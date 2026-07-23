/**
 * 任意 Atmosphere アプリ連携。プロフィール所有者本人が「どの collection の・どのキーを・
 * どうラベル付けして出すか」を自分の PDS の com.suibari.nagi.appLinks（rkey=self）に curate する。
 * 表示側は対象 DID の PDS を直読みして描画する（バックエンド非依存）。
 *
 * - 設定の読み書き / discovery / サンプル取得は「自分の repo」なので認証済み Agent を使う。
 * - 表示（loadProfileAppLinks）は任意 DID なので pds.ts の未認証直読みを使う。
 */
import { get } from 'svelte/store';
import { Agent } from '@atproto/api';
import { session } from '$lib/oauth/session.svelte';
import { resolveLexicon as resolveLexiconApi, getAppIcon as getAppIconApi } from '$lib/api/appview';
import { listRecords as pdsListRecords, getRecord as pdsGetRecord } from './pds';

export const APP_LINKS = 'com.suibari.nagi.appLinks';

export type AppLinkFieldRole = 'title' | 'value' | 'datetime' | 'url';
export type AppLinkField = { path: string; label?: string; role: AppLinkFieldRole };
export type AppLink = {
	collection: string;
	label: string;
	selection: 'latest';
	appUri?: string;
	iconUrl?: string;
	enabled?: boolean;
	fields: AppLinkField[];
};

const current = () => {
	const value = get(session);
	if (!value) throw new Error('Authentication required');
	return value;
};

// discovery の候補から除外する既知コレクション（Bluesky / Nagi / Bluemoji）。
const KNOWN_COLLECTIONS = new Set([
	'app.bsky.actor.profile',
	'app.bsky.feed.post',
	'app.bsky.feed.like',
	'app.bsky.feed.repost',
	'app.bsky.graph.follow',
	'app.bsky.graph.block',
	'app.bsky.graph.list',
	'app.bsky.graph.listitem',
	'com.suibari.nagi.post',
	'com.suibari.nagi.reaction',
	'com.suibari.nagi.profile',
	'com.suibari.nagi.appLinks',
	'blue.moji.collection.item',
]);

const isRecordNotFound = (error: unknown) =>
	typeof error === 'object' &&
	error !== null &&
	(('error' in error && (error as { error?: unknown }).error === 'RecordNotFound') ||
		('message' in error &&
			typeof (error as { message?: unknown }).message === 'string' &&
			(error as { message: string }).message.includes('RecordNotFound')));

/** 自分の連携設定を読む。未設定なら空配列。 */
export async function getOwnAppLinks(): Promise<AppLink[]> {
	const s = current();
	try {
		const res = await new Agent(s).com.atproto.repo.getRecord({
			repo: s.did,
			collection: APP_LINKS,
			rkey: 'self',
		});
		const links = (res.data.value as { links?: unknown })?.links;
		return Array.isArray(links) ? (links as AppLink[]) : [];
	} catch (error) {
		if (isRecordNotFound(error)) return [];
		throw error;
	}
}

/** 自分の連携設定を保存する。 */
export async function putAppLinks(links: AppLink[]): Promise<void> {
	const s = current();
	await new Agent(s).com.atproto.repo.putRecord({
		repo: s.did,
		collection: APP_LINKS,
		rkey: 'self',
		validate: false,
		record: {
			$type: APP_LINKS,
			links,
			createdAt: new Date().toISOString(),
		},
	});
}

/** 自分の repo にある collection の一覧（既知の bsky/nagi を除外）。連携先の候補サジェスト用。 */
export async function listOwnCollections(): Promise<string[]> {
	const s = current();
	const res = await new Agent(s).com.atproto.repo.describeRepo({ repo: s.did });
	const collections = (res.data.collections ?? []) as string[];
	return collections.filter((c) => !KNOWN_COLLECTIONS.has(c)).sort();
}

export type FlatField = { path: string; sample: string };

/**
 * レコード本体を再帰的に flatten し、[キーパス → サンプル値] の一覧を返す。
 * 配列は先頭要素 [0] のみ展開。blob は "[blob]"。深さ・件数に上限を設ける。
 */
export function flattenRecord(value: unknown, prefix = '', out: FlatField[] = [], depth = 0): FlatField[] {
	if (depth > 6 || out.length >= 80 || value === null || value === undefined) return out;
	if (Array.isArray(value)) {
		if (value.length) flattenRecord(value[0], `${prefix}[0]`, out, depth + 1);
		return out;
	}
	if (typeof value === 'object') {
		const obj = value as Record<string, unknown>;
		if (obj.$type === 'blob' || (obj.ref && obj.mimeType)) {
			if (prefix) out.push({ path: prefix, sample: '[blob]' });
			return out;
		}
		for (const [k, v] of Object.entries(obj)) {
			if (k === '$type') continue;
			flattenRecord(v, prefix ? `${prefix}.${k}` : k, out, depth + 1);
		}
		return out;
	}
	if (prefix) out.push({ path: prefix, sample: String(value).slice(0, 120) });
	return out;
}

/** flatten キーパスで値を取り出す。"a.b[0].c" 形式に対応。 */
export function getByPath(root: unknown, path: string): unknown {
	let cur: unknown = root;
	for (const seg of path.split('.')) {
		const m = /^([^[]*)((?:\[\d+\])*)$/.exec(seg);
		if (!m) return undefined;
		if (m[1]) cur = (cur as Record<string, unknown> | undefined)?.[m[1]];
		for (const idx of m[2].match(/\d+/g) ?? []) cur = (cur as unknown[] | undefined)?.[Number(idx)];
		if (cur === null || cur === undefined) return cur;
	}
	return cur;
}

/** 自分の repo の指定 collection の最新1件を取得（設定画面のサンプル表示用）。 */
export async function fetchOwnLatestRecord(collection: string): Promise<Record<string, unknown> | null> {
	const s = current();
	const res = await new Agent(s).com.atproto.repo.listRecords({
		repo: s.did,
		collection,
		limit: 1,
	});
	const rec = res.data.records[0];
	return rec ? (rec.value as Record<string, unknown>) : null;
}

/**
 * publish 済み Lexicon のスキーマからフィールド候補を得る（未解決なら空）。サンプル値と併せて
 * フィールド選択 UI を補助する。record 型の properties のキーを返す。
 */
export async function resolveSchemaFields(nsid: string): Promise<{ path: string; description?: string }[]> {
	try {
		const res = await resolveLexiconApi(nsid);
		if (!res.resolved || !res.schema) return [];
		const defs = (res.schema as { defs?: Record<string, unknown> }).defs ?? {};
		const main = defs.main as { type?: string; record?: { properties?: Record<string, { description?: string }> } } | undefined;
		const props = main?.type === 'record' ? main.record?.properties : undefined;
		if (!props) return [];
		return Object.entries(props).map(([path, def]) => ({ path, description: def?.description }));
	} catch {
		return [];
	}
}

/** appUri から favicon を解決する。失敗時は undefined。 */
export async function resolveAppIcon(appUri: string): Promise<string | undefined> {
	try {
		const res = await getAppIconApi(appUri);
		return res.iconUrl;
	} catch {
		return undefined;
	}
}

/**
 * NSID の authority ドメインを推定して Web サイト URL を作る（appUri の初期サジェスト用）。
 * 例: fm.teal.alpha.feed.play → https://feed.alpha.teal.fm 。ユーザーが編集する前提。
 */
export function suggestAppUri(nsid: string): string | undefined {
	const parts = nsid.split('.');
	if (parts.length < 3) return undefined;
	const domain = parts.slice(0, -1).reverse().join('.');
	return `https://${domain}`;
}

export type AppLinkFieldView = { role: AppLinkFieldRole; label?: string; value: string };
export type AppLinkView = {
	label: string;
	appUri?: string;
	iconUrl?: string;
	fields: AppLinkFieldView[];
};

function renderField(field: AppLinkField, record: Record<string, unknown>): AppLinkFieldView | null {
	const raw = getByPath(record, field.path);
	if (raw === null || raw === undefined) return null;
	let value: string;
	if (field.role === 'datetime') {
		const d = new Date(String(raw));
		value = Number.isNaN(d.valueOf()) ? String(raw) : d.toLocaleString();
	} else if (typeof raw === 'object') {
		value = JSON.stringify(raw).slice(0, 200);
	} else {
		value = String(raw).slice(0, 300);
	}
	return { role: field.role, label: field.label, value };
}

/**
 * 対象 DID のプロフィールに表示する連携カードを構築する。config と対象レコードを、
 * 対象 DID の PDS から直読みして組み立てる。1連携の取得失敗は握りつぶして他を出す。
 */
export async function loadProfileAppLinks(did: string): Promise<AppLinkView[]> {
	const config = await pdsGetRecord(did, APP_LINKS, 'self');
	const links = (config?.value?.links as AppLink[] | undefined) ?? [];
	const enabled = links.filter((l) => l.enabled !== false && l.collection);
	const views = await Promise.all(
		enabled.map(async (link): Promise<AppLinkView | null> => {
			try {
				const { records } = await pdsListRecords(did, link.collection, { limit: 1 });
				const record = records[0]?.value;
				if (!record) return null;
				const fields = (link.fields ?? [])
					.map((f) => renderField(f, record))
					.filter((f): f is AppLinkFieldView => f !== null);
				return { label: link.label, appUri: link.appUri, iconUrl: link.iconUrl, fields };
			} catch {
				return null;
			}
		}),
	);
	return views.filter((v): v is AppLinkView => v !== null);
}
