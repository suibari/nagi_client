/**
 * 任意 Atmosphere アプリ連携。プロフィール所有者本人が「どの collection の・どのキーを出すか」を
 * 自分の PDS の com.suibari.nagi.appLinks（rkey=self）に curate する。表示側は対象 DID の PDS を
 * 直読みして描画する（バックエンド非依存）。
 *
 * 描画の役割（値/日時/リンク/画像）はレコードの実値から自動判別するので、ユーザーが設定するのは
 * 「どのフィールドを表示するか」だけ。設定は表示するキーパスの宣言のみを保存する。
 */
import { get } from 'svelte/store';
import { Agent } from '@atproto/api';
import { session } from '$lib/oauth/session.svelte';
import { dateLocale } from '$lib/i18n/i18n.svelte';
import { getAppIcon as getAppIconApi } from '$lib/api/appview';
import { listRecords as pdsListRecords, getRecord as pdsGetRecord, resolvePdsUrl } from './pds';

export const APP_LINKS = 'com.suibari.nagi.appLinks';

export type AppLinkFieldRole = 'value' | 'datetime' | 'url' | 'image';
/** 保存する連携設定。fields は「表示するキーパス」の宣言のみ。 */
export type AppLinkField = { path: string };
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
	'app.bsky.feed.threadgate',
	'app.bsky.feed.postgate',
	'app.bsky.graph.follow',
	'app.bsky.graph.block',
	'app.bsky.graph.list',
	'app.bsky.graph.listitem',
	'app.bsky.graph.starterpack',
	'chat.bsky.actor.declaration',
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

/** 自分の repo の指定 collection の最新1件を取得（設定画面のプレビュー用）。 */
export async function fetchOwnLatestRecord(collection: string): Promise<Record<string, unknown> | null> {
	const s = current();
	const res = await new Agent(s).com.atproto.repo.listRecords({ repo: s.did, collection, limit: 1 });
	const rec = res.data.records[0];
	return rec ? (rec.value as Record<string, unknown>) : null;
}

/** 自分の PDS ベース URL（blob URL 生成用）。 */
export async function resolveOwnPdsUrl(): Promise<string> {
	return resolvePdsUrl(current().did);
}

// ---- 値からの役割判別・整形 -------------------------------------------------

const DATETIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

function isBlob(v: unknown): v is { $type?: string; ref?: unknown; mimeType?: string } {
	return !!v && typeof v === 'object' && (('$type' in v && (v as { $type?: string }).$type === 'blob') || ('ref' in v && 'mimeType' in v));
}
export function isImageBlob(v: unknown): boolean {
	return isBlob(v) && typeof v.mimeType === 'string' && v.mimeType.startsWith('image/');
}
/**
 * blob の CID 文字列を取り出す。生JSON表現（listRecords の raw fetch）は ref.$link、
 * @atproto/api の Agent 経由では ref が CID インスタンス（toString で CID 文字列）になる。両対応。
 */
function blobCidOf(v: unknown): string | undefined {
	if (!isBlob(v)) return undefined;
	const ref = v.ref as { $link?: string; toString?: () => string } | undefined;
	if (!ref || typeof ref !== 'object') return undefined;
	if (typeof ref.$link === 'string') return ref.$link;
	if (typeof ref.toString === 'function') {
		const s = ref.toString();
		return s && s !== '[object Object]' ? s : undefined;
	}
	return undefined;
}
export function blobUrl(pdsUrl: string, did: string, cid: string): string {
	return `${pdsUrl}/xrpc/com.atproto.sync.getBlob?did=${encodeURIComponent(did)}&cid=${encodeURIComponent(cid)}`;
}

/** キーパスと実値から描画役割を判別する。表示できない型は null。 */
export function detectRole(path: string, value: unknown): AppLinkFieldRole | null {
	if (isImageBlob(value)) return 'image';
	if (typeof value === 'string') {
		const key = path.split('.').pop() ?? '';
		if (DATETIME_RE.test(value) || (/At$/.test(key) && !Number.isNaN(Date.parse(value)))) return 'datetime';
		if (/^(https?|at):\/\//.test(value)) return 'url';
		return 'value';
	}
	if (typeof value === 'number' || typeof value === 'boolean') return 'value';
	return null;
}

function formatValue(role: AppLinkFieldRole, value: unknown): string {
	if (role === 'datetime') {
		const d = new Date(String(value));
		return Number.isNaN(d.valueOf()) ? String(value) : d.toLocaleString(dateLocale());
	}
	return String(value).slice(0, 300);
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

// ---- レコードの走査（設定画面のフィールド候補） ----------------------------

export type Leaf = { path: string; value: unknown; role: AppLinkFieldRole };

/** レコード本体を再帰的に走査し、表示可能なリーフ（役割付き）の一覧を返す。配列は先頭のみ。 */
export function collectLeaves(value: unknown, prefix = '', out: Leaf[] = [], depth = 0): Leaf[] {
	if (depth > 6 || out.length >= 60 || value === null || value === undefined) return out;
	if (isBlob(value)) {
		if (prefix && isImageBlob(value)) out.push({ path: prefix, value, role: 'image' });
		return out;
	}
	if (Array.isArray(value)) {
		if (value.length) collectLeaves(value[0], `${prefix}[0]`, out, depth + 1);
		return out;
	}
	if (typeof value === 'object') {
		for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
			if (k === '$type') continue;
			collectLeaves(v, prefix ? `${prefix}.${k}` : k, out, depth + 1);
		}
		return out;
	}
	if (prefix) {
		const role = detectRole(prefix, value);
		if (role) out.push({ path: prefix, value, role });
	}
	return out;
}

/** サンプル値の短い表示文字列。 */
export function sampleText(leaf: Leaf): string {
	if (leaf.role === 'image') return '🖼';
	if (leaf.role === 'datetime') return formatValue('datetime', leaf.value);
	return String(leaf.value).slice(0, 80);
}

/**
 * 初期選択するコアフィールドのパス集合: 画像blob・代表テキスト1つ・~At日時。
 * 代表テキストは createdAt 等を除いた最初の value 文字列。
 */
export function autoSelectFields(record: Record<string, unknown>): string[] {
	const leaves = collectLeaves(record);
	const selected: string[] = [];
	const image = leaves.find((l) => l.role === 'image');
	if (image) selected.push(image.path);
	const skip = new Set(['createdAt', 'updatedAt', 'indexedAt']);
	const rep = leaves.find(
		(l) => l.role === 'value' && typeof l.value === 'string' && !skip.has(l.path.split('.').pop() ?? ''),
	);
	if (rep) selected.push(rep.path);
	const dt = leaves.find((l) => l.role === 'datetime');
	if (dt) selected.push(dt.path);
	return selected;
}

// ---- 表示用ビューの構築（プロフィール・設定プレビュー共通） ----------------

export type AppLinkFieldView = { role: 'value' | 'datetime' | 'url'; value: string };
export type AppLinkView = {
	collection: string;
	label: string;
	appUri?: string;
	iconUrl?: string;
	images: string[];
	fields: AppLinkFieldView[];
};

/** 1連携の設定＋実レコードから表示用ビューを組み立てる。画像は getBlob URL にする。 */
export function buildLinkView(
	did: string,
	pdsUrl: string,
	link: Pick<AppLink, 'collection' | 'label' | 'appUri' | 'iconUrl' | 'fields'>,
	record: Record<string, unknown>,
): AppLinkView {
	const fields: AppLinkFieldView[] = [];
	const images: string[] = [];
	for (const f of link.fields ?? []) {
		const raw = getByPath(record, f.path);
		if (raw === null || raw === undefined) continue;
		const role = detectRole(f.path, raw);
		if (!role) continue;
		if (role === 'image') {
			const cid = blobCidOf(raw);
			if (cid) images.push(blobUrl(pdsUrl, did, cid));
			continue;
		}
		fields.push({ role, value: formatValue(role, raw) });
	}
	return {
		collection: link.collection,
		label: link.label || link.collection,
		appUri: link.appUri,
		iconUrl: link.iconUrl,
		images,
		fields,
	};
}

/** appUri から favicon を解決する。失敗時は undefined。 */
export async function resolveAppIcon(appUri: string): Promise<string | undefined> {
	try {
		return (await getAppIconApi(appUri)).iconUrl;
	} catch {
		return undefined;
	}
}

/**
 * NSID から アプリの Web サイト URL を推定する（favicon の取得元／カードのリンク先）。
 * lexicon の authority は深いサブドメインになりがちで favicon を持たないことが多いので、
 * 登録可能ドメイン（先頭2セグメントを逆順）を使う。例: fm.teal.alpha.feed.play → https://teal.fm 。
 */
export function suggestAppUri(nsid: string): string | undefined {
	const parts = nsid.split('.');
	if (parts.length < 2) return undefined;
	return `https://${parts.slice(0, 2).reverse().join('.')}`;
}

/**
 * 対象 DID のプロフィールに表示する連携カードを構築する。config と対象レコードを対象 DID の
 * PDS から直読みして組み立てる。1連携の取得失敗は握りつぶして他を出す。
 */
export async function loadProfileAppLinks(did: string): Promise<AppLinkView[]> {
	const config = await pdsGetRecord(did, APP_LINKS, 'self');
	const links = (config?.value?.links as AppLink[] | undefined) ?? [];
	const enabled = links.filter((l) => l.enabled !== false && l.collection);
	if (!enabled.length) return [];
	const pdsUrl = await resolvePdsUrl(did);
	const views = await Promise.all(
		enabled.map(async (link): Promise<AppLinkView | null> => {
			try {
				const { records } = await pdsListRecords(did, link.collection, { limit: 1 });
				const record = records[0]?.value;
				return record ? buildLinkView(did, pdsUrl, link, record) : null;
			} catch {
				return null;
			}
		}),
	);
	return views.filter((v): v is AppLinkView => v !== null);
}
