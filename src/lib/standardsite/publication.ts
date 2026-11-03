import { get } from 'svelte/store';
import { Agent } from '@atproto/api';
import { session } from '$lib/oauth/session.svelte';
import { getOwnNagiProfile } from '$lib/atproto/records';
import { forgetPublicationCache, readPublicationCache, writePublicationCache } from './cache';
import {
	findNagiPublication,
	hasLegacyPublicationUrl,
	migrateNagiDocuments,
	type ExistingPublication,
} from './repo';
import {
	hasNagiTheme,
	NAGI_BASIC_THEME,
	nagiPublicationUrl,
	PUBLICATION,
	type StandardSitePreferences,
} from './types';

const current = () => {
	const value = get(session);
	if (!value) throw new Error('Authentication required');
	return value;
};

/** Nagi プロフィールから publication の表示情報を組み立てる。 */
async function publicationFieldsFromProfile(fallbackName: string) {
	const profile = await getOwnNagiProfile().catch(() => null);
	const name = profile?.displayName?.trim() || fallbackName;
	return {
		name,
		...(profile?.description?.trim() ? { description: profile.description.trim() } : {}),
		...(profile?.avatar !== undefined ? { icon: profile.avatar } : {}),
	};
}

/**
 * publication を用意して at-URI を返す。無ければ作る（初回ブログ投稿時の遅延作成）。
 * 表示情報は Nagi プロフィールから取り、アバターの BlobRef は同一リポジトリなので再利用する。
 *
 * 探索は必ず findNagiPublication を通す。repo には blento.app など他アプリの
 * publication も同居しうるので、先頭 1 件を採ると他人のブログに記事をぶら下げてしまう。
 */
export async function ensurePublication(options: { fallbackName?: string } = {}): Promise<string> {
	const s = current();
	const cached = readPublicationCache(s.did);
	if (cached) return cached;

	const existing = await findNagiPublication();
	if (existing) {
		if (hasLegacyPublicationUrl(existing.value)) {
			await migrateLegacyPublication(existing, options);
			writePublicationCache(s.did, existing.uri);
			return existing.uri;
		}
		// Nagi では記事として公開する選択自体を発見フィードへの掲載同意として扱う。
		// 過去の設定が false / 未設定でも、次に記事を公開するときに ON へ揃える。
		// 配色も同じ機会に Nagi の既定へ揃える（Bluesky の記事カードのボタン色になる）。
		if (
			existing.value.preferences?.showInDiscover !== true ||
			!hasNagiTheme(existing.value.basicTheme)
		) {
			await updatePublication({ showInDiscover: true }, options);
		}
		writePublicationCache(s.did, existing.uri);
		return existing.uri;
	}

	const agent = new Agent(s);
	const fields = await publicationFieldsFromProfile(options.fallbackName ?? 'Nagi');
	const response = await agent.com.atproto.repo.createRecord({
		repo: s.did,
		collection: PUBLICATION,
		validate: false,
		record: {
			$type: PUBLICATION,
			url: nagiPublicationUrl(s.did),
			...fields,
			basicTheme: NAGI_BASIC_THEME,
			preferences: { showInDiscover: true },
		},
	});
	writePublicationCache(s.did, response.data.uri);
	return response.data.uri;
}

/**
 * publication の表示情報と設定を書き戻す。未知の将来フィールドは保持する。
 * prefs を省略すると既存の preferences をそのまま残す。
 * 書き戻す対象は Nagi の publication のみ（他アプリのレコードは触らない）。
 */
export async function updatePublication(
	prefs?: StandardSitePreferences,
	options: { fallbackName?: string } = {},
): Promise<void> {
	const s = current();
	const agent = new Agent(s);
	const existing = await findNagiPublication();
	const fields = await publicationFieldsFromProfile(options.fallbackName ?? 'Nagi');
	if (!existing) {
		await ensurePublication(options);
		if (prefs) await updatePublication(prefs, options);
		return;
	}
	const record: Record<string, unknown> = {
		...(existing.value as unknown as Record<string, unknown>),
		$type: PUBLICATION,
		url: nagiPublicationUrl(s.did),
		...fields,
		basicTheme: NAGI_BASIC_THEME,
		...(prefs
			? { preferences: { ...(existing.value.preferences ?? {}), ...prefs } }
			: existing.value.preferences
				? { preferences: existing.value.preferences }
				: {}),
	};
	// description / icon はプロフィール側で空にされたら落とす。
	if (!('description' in fields)) delete record.description;
	if (!('icon' in fields)) delete record.icon;
	await agent.com.atproto.repo.putRecord({
		repo: s.did,
		collection: PUBLICATION,
		rkey: existing.rkey,
		validate: false,
		record,
	});
	writePublicationCache(s.did, existing.uri);
}

/**
 * 共通 url（移行前）の publication をユーザーごとの url へ移す。
 * document の path は url からの相対なので、先に document を直してから url を変える。
 * document の途中で失敗したら url は古いまま残り、次の呼び出しでやり直せる。
 */
async function migrateLegacyPublication(
	existing: ExistingPublication,
	options: { fallbackName?: string } = {},
): Promise<void> {
	await migrateNagiDocuments(existing.uri);
	await updatePublication({ showInDiscover: true }, options);
}

const MIGRATED_KEY = 'nagi-standardsite-migrated.v1';

function migratedFlag(did: string, value?: true): boolean {
	try {
		const raw = window.localStorage.getItem(MIGRATED_KEY);
		const parsed = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
		if (value) {
			parsed[did] = true;
			window.localStorage.setItem(MIGRATED_KEY, JSON.stringify(parsed));
		}
		return parsed[did] === true;
	} catch {
		return false;
	}
}

/**
 * サインイン時に一度だけ、移行前の publication と記事を今の形へ直す。
 * 次に記事を書くまで待つと、それまで standard.site の検証が通らないままになるため。
 * 権限不足などで失敗したら印を付けず、次回のサインインでやり直す。
 */
export async function migrateLegacyStandardSite(): Promise<void> {
	const s = current();
	if (migratedFlag(s.did)) return;
	const existing = await findNagiPublication();
	if (existing && hasLegacyPublicationUrl(existing.value)) await migrateLegacyPublication(existing);
	migratedFlag(s.did, true);
}

/**
 * publication の現在の版への強参照。Bluesky のティーザーの associatedRefs に固定する。
 * 後で publication を書き換えても、Bluesky は固定した版でカードを出し続ける。
 */
export async function getPublicationRef(): Promise<{ uri: string; cid: string }> {
	const s = current();
	const uri = await ensurePublication();
	const { data } = await new Agent(s).com.atproto.repo.getRecord({
		repo: s.did,
		collection: PUBLICATION,
		rkey: uri.slice(uri.lastIndexOf('/') + 1),
	});
	if (!data.cid) throw new Error('standard.site publication has no cid');
	return { uri: data.uri, cid: data.cid };
}

/**
 * 既存の Nagi publication がある場合だけ、現在のプロフィールを反映する。
 * プロフィール編集をきっかけにブログ公開を勝手に有効化しないため、新規作成はしない。
 */
export async function syncExistingPublicationFromProfile(
	options: {
		fallbackName?: string;
	} = {},
): Promise<boolean> {
	if (!(await findNagiPublication())) return false;
	await updatePublication(undefined, options);
	return true;
}

export { forgetPublicationCache, findNagiPublication, type ExistingPublication };
