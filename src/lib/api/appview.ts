import { get } from 'svelte/store';
import { PUBLIC_APPVIEW_URL } from '$env/static/public';
import { session } from '$lib/oauth/session.svelte';
import type {
	DiaryPage,
	EmojiView,
	NotificationView,
	Page,
	ProfileFeedFilter,
	ProfilePage,
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
// 未ログイン閲覧と auth:'none' は従来どおり appview へ直 fetch する（proxy は DPoP セッション必須）。
const APPVIEW_PROXY = 'did:web:nagi-api.suibari.com#nagi_appview';
export type LinkMetadata = { uri: string; title: string; description?: string; image?: string };
// セッションがあり認証を要する呼び出しは PDS 経由プロキシ、それ以外は appview 直 fetch。
async function request(
	path: string,
	options: RequestInit,
	auth: 'none' | 'optional' | 'required',
): Promise<Response> {
	const current = auth === 'none' ? null : get(session);
	if (auth === 'required' && !current) throw new Error('Authentication required');
	const headers = { ...(options.body ? { 'content-type': 'application/json' } : {}) };
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
		const body = await response.json().catch(() => ({}));
		throw new Error(body.message ?? `Request failed (${response.status})`);
	}
	return response.json();
}
export const getTimeline = (cursor?: string) =>
	call<TimelinePage>(
		'com.suibari.nagi.getTimeline',
		`/xrpc/com.suibari.nagi.getTimeline${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`,
	);
export const getAffirmation = (cursor?: string) =>
	call<TimelinePage>(
		'com.suibari.nagi.getAffirmation',
		`/xrpc/com.suibari.nagi.getAffirmation${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`,
	);
export const getThread = (uri: string) =>
	call<{ thread: ThreadView }>(
		'com.suibari.nagi.getThread',
		`/xrpc/com.suibari.nagi.getThread?uri=${encodeURIComponent(uri)}`,
	);
export const getProfile = (
	actor: string,
	opts: { filter?: ProfileFeedFilter; cursor?: string; limit?: number } = {},
) => {
	const params = new URLSearchParams({ actor });
	if (opts.filter) params.set('filter', opts.filter);
	if (opts.cursor) params.set('cursor', opts.cursor);
	if (opts.limit) params.set('limit', String(opts.limit));
	return call<ProfilePage>(
		'com.suibari.nagi.getProfile',
		`/xrpc/com.suibari.nagi.getProfile?${params}`,
	);
};
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
export { base as APPVIEW_URL };
