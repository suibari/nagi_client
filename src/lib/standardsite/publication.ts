import { get } from 'svelte/store';
import { Agent } from '@atproto/api';
import { session } from '$lib/oauth/session.svelte';
import { getOwnNagiProfile } from '$lib/atproto/records';
import { forgetPublicationCache, readPublicationCache, writePublicationCache } from './cache';
import { findNagiPublication, type ExistingPublication } from './repo';
import { NAGI_PUBLIC_ORIGIN, PUBLICATION, type StandardSitePreferences } from './types';

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
 * publication を用意して at-URI を返す。無ければ作る（初回オプトイン投稿時の遅延作成）。
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
		// Nagi では記事として公開する選択自体を発見フィードへの掲載同意として扱う。
		// 過去の設定が false / 未設定でも、次に記事を公開するときに ON へ揃える。
		if (existing.value.preferences?.showInDiscover !== true) {
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
			url: NAGI_PUBLIC_ORIGIN,
			...fields,
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
		url: NAGI_PUBLIC_ORIGIN,
		...fields,
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
