import { get } from 'svelte/store';
import { dev } from '$app/environment';
import { PUBLIC_APPVIEW_URL } from '$env/static/public';
import { env } from '$env/dynamic/public';
import { session } from '$lib/oauth/session.svelte';
import type {
	CardCollectionView,
	ChannelsPage,
	ChannelView,
	DiaryPage,
	DrawCardResult,
	EmojiView,
	MuteSubjectType,
	MutesView,
	NotificationView,
	NewsPage,
	Page,
	ProfileFeedFilter,
	ProfilePage,
	ProfileReactionPage,
	SearchActorsResult,
	ThreadView,
	TimelinePage,
} from './types';
const base = PUBLIC_APPVIEW_URL || 'http://localhost:3002';
// AppView へのアクセスはユーザ自身の PDS 経由でプロキシする（atproto-proxy ヘッダー）。
// 自前 getServiceAuth を廃止したことで、未更新セルフホスト PDS の aud params 検証
// （format:did で fragment を却下）を回避できる。scope チェックは proxy ヘッダーの
// fragment aud で granted scope と一致し、トークン発行は PDS 内部処理（aud は PDS の
// バージョンに応じ fragment/bare、サーバ serviceAuth.ts は両方受理）。
// 未ログイン閲覧と auth:'none' は AppView へ直接取得する（開発時だけ Vite 経由）。
const APPVIEW_PROXY = 'did:web:nagi-api.suibari.com#nagi_appview';
// 開発専用: PUBLIC_APPVIEW_DIRECT=true のとき、ログイン中でも PDS プロキシを介さず
// Vite の同一オリジンプロキシから local AppView へ転送する。viewerDid は
// x-viewer-did ヘッダーで渡し、appview 側の APPVIEW_DEV_TRUST_VIEWER=true で信用させる。
const APPVIEW_DIRECT = dev && env.PUBLIC_APPVIEW_DIRECT === 'true';
// 開発時は Vite の同一オリジンプロキシを使う。これにより本番用 CSP が生成済みでも、
// ブラウザからローカル AppView への通信と画像取得を拒否されない。
const browserBase = APPVIEW_DIRECT ? '' : base;
export type LinkMetadata = { uri: string; title: string; description?: string; image?: string };
export type TranslationBatchResult = {
	translations: Array<{ uri: string; text: string }>;
	failures: Array<{ uri: string; code: string }>;
};
const POST_PAGE_LIMIT = '10';

/** AppView が返したHTTPステータスとエラーコードを、呼び出し側で判定できる形で保持する。 */
export class ApiRequestError extends Error {
	constructor(
		public readonly status: number,
		public readonly code: string | undefined,
		message: string,
	) {
		super(message);
		this.name = 'ApiRequestError';
	}
}

// セッションがあり認証を要する呼び出しは PDS 経由プロキシ、それ以外は appview 直 fetch。
async function request(
	path: string,
	options: RequestInit,
	auth: 'none' | 'optional' | 'required',
): Promise<Response> {
	const current = auth === 'none' ? null : get(session);
	if (auth === 'required' && !current) throw new Error('Authentication required');
	const headers = { ...(options.body ? { 'content-type': 'application/json' } : {}) };
	// ローカル開発: Vite の同一オリジンプロキシ経由。ログイン中は viewerDid を dev ヘッダーで渡す。
	if (APPVIEW_DIRECT) {
		return fetch(path, {
			...options,
			headers: { ...headers, ...(current ? { 'x-viewer-did': current.did } : {}) },
		});
	}
	if (current) {
		return current.fetchHandler(path, {
			...options,
			headers: { ...headers, 'atproto-proxy': APPVIEW_PROXY },
		});
	}
	return fetch(`${base}${path}`, { ...options, headers });
}
async function call<T>(
	_lxm: string,
	path: string,
	options: RequestInit = {},
	auth: 'none' | 'optional' | 'required' = 'optional',
): Promise<T> {
	const response = await request(path, options, auth);
	if (!response.ok) {
		const body = (await response.json().catch(() => ({}))) as {
			error?: string;
			message?: string;
		};
		throw new ApiRequestError(
			response.status,
			body.error,
			body.message ?? `Request failed (${response.status})`,
		);
	}
	return response.json();
}
/**
 * ログイン中は認証付き（PDS プロキシ経由 = viewerDid が AppView へ届く）で取得し、
 * 認証だけが拒否されたら公開取得へ落とす。permission-set を publish しても認可サーバの
 * キャッシュが最大24h残るため、これが無いと publish 直後に該当画面が丸ごと壊れる。
 * 公開コンテンツを返すエンドポイント専用（ミュート等のビューア依存部分が効かなくなるだけ）。
 */
async function withPublicFallback<T>(lxm: string, path: string): Promise<T> {
	try {
		return await call<T>(lxm, path);
	} catch (error) {
		if (
			get(session) &&
			error instanceof ApiRequestError &&
			(error.status === 401 ||
				error.status === 403 ||
				(error.status === 400 && /scope|permission/i.test(error.message)))
		) {
			return call<T>(lxm, path, {}, 'none');
		}
		throw error;
	}
}
export const getTimeline = (cursor?: string) =>
	call<TimelinePage>(
		'com.suibari.nagi.getTimeline',
		`/xrpc/com.suibari.nagi.getTimeline?limit=${POST_PAGE_LIMIT}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`,
	);
export const getAffirmation = (cursor?: string) =>
	call<TimelinePage>(
		'com.suibari.nagi.getAffirmation',
		`/xrpc/com.suibari.nagi.getAffirmation?limit=${POST_PAGE_LIMIT}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`,
	);
export const getPositiveNews = (lang: 'ja' | 'en', cursor?: string) => {
	const params = new URLSearchParams({ limit: '20', lang });
	if (cursor) params.set('cursor', cursor);
	return withPublicFallback<NewsPage>(
		'com.suibari.nagi.getPositiveNews',
		`/xrpc/com.suibari.nagi.getPositiveNews?${params}`,
	);
};
/** 未読確認用。本文を描画しない画面では最新の1件だけを取得する。 */
export const getLatestPositiveNews = (lang: 'ja' | 'en') => {
	const params = new URLSearchParams({ limit: '1', lang });
	return call<NewsPage>(
		'com.suibari.nagi.getPositiveNews',
		`/xrpc/com.suibari.nagi.getPositiveNews?${params}`,
		{},
		'none',
	);
};
export const getThread = (uri: string) =>
	call<{ thread: ThreadView }>(
		'com.suibari.nagi.getThread',
		`/xrpc/com.suibari.nagi.getThread?uri=${encodeURIComponent(uri)}`,
	);
export const ensureRecord = (uri: string, cid: string) =>
	call<{ uri: string; cid: string; indexed: true }>(
		'com.suibari.nagi.ensureRecord',
		'/xrpc/com.suibari.nagi.ensureRecord',
		{
			method: 'POST',
			body: JSON.stringify({ uri, cid }),
			signal: AbortSignal.timeout(3_000),
		},
		'required',
	);
// チャンネル閲覧・検索は公開コンテンツだが、ミュートを効かせるには viewerDid が要る。
// viewerDid は PDS プロキシ経由の service-auth JWT からしか取れないので、ログイン中は
// 認証付きで叩き、permission-set のキャッシュ未反映で弾かれたときだけ公開取得へ落とす
// （withPublicFallback）。未ログインは従来どおり AppView 直読みで、ミュートは元々効かない。
export const getChannels = (cursor?: string) => {
	const params = new URLSearchParams({ limit: '50' });
	if (cursor) params.set('cursor', cursor);
	return withPublicFallback<ChannelsPage>(
		'com.suibari.nagi.getChannels',
		`/xrpc/com.suibari.nagi.getChannels?${params}`,
	);
};
export const getChannel = (uri: string) =>
	withPublicFallback<{ channel: ChannelView }>(
		'com.suibari.nagi.getChannel',
		`/xrpc/com.suibari.nagi.getChannel?uri=${encodeURIComponent(uri)}`,
	);
export const getChannelTimeline = (uri: string, cursor?: string) => {
	const params = new URLSearchParams({ uri, limit: POST_PAGE_LIMIT });
	if (cursor) params.set('cursor', cursor);
	return withPublicFallback<TimelinePage>(
		'com.suibari.nagi.getChannelTimeline',
		`/xrpc/com.suibari.nagi.getChannelTimeline?${params}`,
	);
};
// タグ投稿の検索。将来のキーワード検索も同じ /search 画面・同系エンドポイントへ相乗りできるよう
// tag を明示パラメータにする。
export const searchPosts = (tag: string, cursor?: string) => {
	const params = new URLSearchParams({ tag, limit: POST_PAGE_LIMIT });
	if (cursor) params.set('cursor', cursor);
	return withPublicFallback<TimelinePage>(
		'com.suibari.nagi.searchPosts',
		`/xrpc/com.suibari.nagi.searchPosts?${params}`,
	);
};
// 自由文キーワード検索（意味検索＋語彙一致のハイブリッド）。tag 検索と同じ /search 画面に相乗り。
export const searchPostsByQuery = (q: string, cursor?: string) => {
	const params = new URLSearchParams({ q, limit: POST_PAGE_LIMIT });
	if (cursor) params.set('cursor', cursor);
	return withPublicFallback<TimelinePage>(
		'com.suibari.nagi.searchPosts',
		`/xrpc/com.suibari.nagi.searchPosts?${params}`,
	);
};
// チャンネルの自由文検索（意味検索＋語彙一致）。
export const searchChannelsByQuery = (q: string, cursor?: string) => {
	const params = new URLSearchParams({ q });
	if (cursor) params.set('cursor', cursor);
	return withPublicFallback<ChannelsPage>(
		'com.suibari.nagi.searchChannels',
		`/xrpc/com.suibari.nagi.searchChannels?${params}`,
	);
};
// ニュースの自由文検索（意味検索＋語彙一致）。公開コンテンツなので AppView 直読み。
export const searchNewsByQuery = (q: string, lang: 'ja' | 'en', cursor?: string) => {
	const params = new URLSearchParams({ q, lang });
	if (cursor) params.set('cursor', cursor);
	return call<NewsPage>(
		'com.suibari.nagi.searchNews',
		`/xrpc/com.suibari.nagi.searchNews?${params}`,
		{},
		'none',
	);
};
type GetProfileOptions = {
	filter?: ProfileFeedFilter;
	cursor?: string;
	limit?: number;
	lang?: 'ja' | 'en';
};
export function getProfile(
	actor: string,
	opts: GetProfileOptions & { filter: 'reactions' },
): Promise<ProfileReactionPage>;
export function getProfile(
	actor: string,
	opts?: GetProfileOptions & {
		filter?: Exclude<ProfileFeedFilter, 'reactions'>;
	},
): Promise<ProfilePage>;
export function getProfile(actor: string, opts: GetProfileOptions = {}) {
	const params = new URLSearchParams({ actor });
	if (opts.filter) params.set('filter', opts.filter);
	if (opts.cursor) params.set('cursor', opts.cursor);
	params.set('limit', String(opts.limit ?? POST_PAGE_LIMIT));
	if (opts.lang) params.set('lang', opts.lang);
	return call<ProfilePage | ProfileReactionPage>(
		'com.suibari.nagi.getProfile',
		`/xrpc/com.suibari.nagi.getProfile?${params}`,
	);
}
/** 日記は公開コンテンツなので認証不要。month は "YYYY-MM"。 */
export const getDiaries = (actor: string, opts: { month?: string; cursor?: string } = {}) => {
	const params = new URLSearchParams({ actor });
	if (opts.month) params.set('month', opts.month);
	if (opts.cursor) params.set('cursor', opts.cursor);
	return call<DiaryPage>(
		'com.suibari.nagi.getDiaries',
		`/xrpc/com.suibari.nagi.getDiaries?${params}`,
		{},
		'none',
	);
};
export const searchActors = (query: string, limit = 10) =>
	call<SearchActorsResult>(
		'com.suibari.nagi.searchActors',
		`/xrpc/com.suibari.nagi.searchActors?q=${encodeURIComponent(query)}&limit=${Math.min(10, Math.max(1, limit))}`,
		{},
		'none',
	);
// ログイン画面のサジェスト用。ログイン時点ではまだ Nagi ユーザーですらないため、
// Nagi AppView を経由せず未認証で叩ける公開 Bsky AppView を直接叩く。
const BSKY_PUBLIC = 'https://public.api.bsky.app';
export const searchActorsTypeahead = async (
	query: string,
	limit = 8,
): Promise<SearchActorsResult> => {
	const q = query.trim();
	if (!q) return { actors: [] };
	const url = `${BSKY_PUBLIC}/xrpc/app.bsky.actor.searchActorsTypeahead?q=${encodeURIComponent(q)}&limit=${Math.min(10, Math.max(1, limit))}`;
	const res = await fetch(url);
	if (!res.ok) return { actors: [] };
	return res.json() as Promise<SearchActorsResult>;
};
export const searchEmojis = (
	opts: { q?: string; repo?: string; limit?: number; cursor?: string } = {},
) => {
	const params = new URLSearchParams();
	if (opts.q) params.set('q', opts.q);
	if (opts.repo) params.set('repo', opts.repo);
	params.set('limit', String(Math.min(100, Math.max(1, opts.limit ?? 50))));
	if (opts.cursor) params.set('cursor', opts.cursor);
	return call<{ emojis: EmojiView[]; cursor?: string }>(
		'com.suibari.nagi.searchEmojis',
		`/xrpc/com.suibari.nagi.searchEmojis?${params}`,
		{},
		'none',
	);
};
export const getEmoji = (uri: string) =>
	call<{ emoji: EmojiView }>(
		'com.suibari.nagi.getEmoji',
		`/xrpc/com.suibari.nagi.getEmoji?uri=${encodeURIComponent(uri)}`,
		{},
		'none',
	);
export const getNotifications = () =>
	call<Page<NotificationView>>(
		'com.suibari.nagi.getNotifications',
		'/xrpc/com.suibari.nagi.getNotifications',
		{},
		'required',
	);
export const getUnreadCount = () =>
	call<{ count: number }>(
		'com.suibari.nagi.getUnreadCount',
		'/xrpc/com.suibari.nagi.getUnreadCount',
		{},
		'required',
	);
// ミュートは非公開情報なので必ず認証必須（公開フォールバックは付けない）。
export const getMutes = () =>
	call<MutesView>('com.suibari.nagi.getMutes', '/xrpc/com.suibari.nagi.getMutes', {}, 'required');
export const setMute = (subjectType: MuteSubjectType, subject: string, muted: boolean) =>
	call<{ muted: boolean }>(
		'com.suibari.nagi.setMute',
		'/xrpc/com.suibari.nagi.setMute',
		{ method: 'POST', body: JSON.stringify({ subjectType, subject, muted }) },
		'required',
	);
// カードの所持状況は公開情報なので、他人のプロフィールでも見える。ただし自分のときだけ
// drawStatus（今日引けるか）が付くので、ログイン中は認証付きで叩く必要がある。
// permission-set のキャッシュ未反映で弾かれたら公開取得へ落とす（drawStatus が消えるだけで
// コレクション自体は見える）。
export const getCards = (actor: string) =>
	withPublicFallback<CardCollectionView>(
		'com.suibari.nagi.getCards',
		`/xrpc/com.suibari.nagi.getCards?actor=${encodeURIComponent(actor)}`,
	);
/**
 * 今日のカードを1枚引く。抽選はサーバ側なので入力は無い。
 * 既に引いている日に呼んでもエラーにはならず、その日のカードが alreadyDrawn=true で返る。
 */
export const drawCard = () =>
	call<DrawCardResult>(
		'com.suibari.nagi.drawCard',
		'/xrpc/com.suibari.nagi.drawCard',
		{ method: 'POST' },
		'required',
	);
export const updateSeen = (seenAt: string) =>
	call<{ updated: number }>(
		'com.suibari.nagi.updateSeen',
		'/xrpc/com.suibari.nagi.updateSeen',
		{ method: 'POST', body: JSON.stringify({ seenAt }) },
		'required',
	);
export const registerPushSubscription = (input: {
	endpoint: string;
	keys: { p256dh: string; auth: string };
}) =>
	call<{ registered: boolean }>(
		'com.suibari.nagi.registerPushSubscription',
		'/xrpc/com.suibari.nagi.registerPushSubscription',
		{ method: 'POST', body: JSON.stringify(input) },
		'required',
	);
export const deletePushSubscription = (endpoint: string) =>
	call<{ deleted: number }>(
		'com.suibari.nagi.deletePushSubscription',
		'/xrpc/com.suibari.nagi.deletePushSubscription',
		{ method: 'POST', body: JSON.stringify({ endpoint }) },
		'required',
	);
export const translatePost = (uri: string, targetLang: string) =>
	call<{ text: string }>(
		'com.suibari.nagi.translatePost',
		'/xrpc/com.suibari.nagi.translatePost',
		{ method: 'POST', body: JSON.stringify({ uri, targetLang }) },
		'none',
	);
export const translatePosts = (
	uris: string[],
	targetLang: string,
	options: { cacheOnly?: boolean; signal?: AbortSignal } = {},
) =>
	call<TranslationBatchResult>(
		'com.suibari.nagi.translatePosts',
		'/xrpc/com.suibari.nagi.translatePosts',
		{
			method: 'POST',
			body: JSON.stringify({
				uris,
				targetLang,
				...(options.cacheOnly ? { cacheOnly: true } : {}),
			}),
			signal: options.signal,
		},
		'none',
	);
export const getCachedTranslations = (uris: string[], targetLang: string, signal?: AbortSignal) =>
	translatePosts(uris, targetLang, { cacheOnly: true, signal });
// 任意アプリ連携のフィールド選択補助。publish 済み Lexicon のスキーマを AppView 経由で解決する
// （DNS TXT 解決はブラウザ不可のためサーバ側で行う）。未解決なら resolved:false。認証不要。
export const resolveLexicon = (nsid: string) =>
	call<{ resolved: boolean; nsid: string; schema?: unknown }>(
		'com.suibari.nagi.resolveLexicon',
		`/xrpc/com.suibari.nagi.resolveLexicon?nsid=${encodeURIComponent(nsid)}`,
		{},
		'none',
	);
// アプリの favicon を解決する（連携設定時に1回呼び、結果 URL をレコードへ保存）。認証不要。
export const getAppIcon = (url: string) =>
	call<{ iconUrl?: string }>(
		'com.suibari.nagi.getAppIcon',
		`/xrpc/com.suibari.nagi.getAppIcon?url=${encodeURIComponent(url)}`,
		{},
		'none',
	);
export const deleteAccountData = () =>
	call<{ success: true }>(
		'com.suibari.nagi.deleteAccountData',
		'/xrpc/com.suibari.nagi.deleteAccountData',
		{ method: 'POST' },
		'required',
	);
export const getLinkMetadata = (url: string, fallback = false) =>
	call<LinkMetadata>(
		'com.suibari.nagi.getLinkMetadata',
		`/xrpc/com.suibari.nagi.getLinkMetadata?url=${encodeURIComponent(url)}${fallback ? '&fallback=true' : ''}`,
		{},
		'required',
	);
export async function getLinkThumbnail(url: string): Promise<Blob> {
	const response = await request(
		`/xrpc/com.suibari.nagi.getLinkThumbnail?url=${encodeURIComponent(url)}`,
		{},
		'required',
	);
	if (!response.ok) throw new Error(`Thumbnail request failed (${response.status})`);
	return response.blob();
}
export async function prepareDeleteAccountData(): Promise<void> {
	if (!get(session)) throw new Error('Authentication required');
}
export { browserBase as APPVIEW_URL };
