import { get } from 'svelte/store';
import { Agent } from '@atproto/api';
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
const aud = 'did:web:nagi-api.suibari.com#nagi_appview';
const cache = new Map<string, { token: string; expires: number }>();
async function token(lxm: string) {
	const current = get(session);
	if (!current) return;
	const hit = cache.get(lxm);
	if (hit && hit.expires > Date.now() + 5000) return hit.token;
	const response = await new Agent(current).com.atproto.server.getServiceAuth({
		aud,
		lxm,
		exp: Math.floor(Date.now() / 1000) + 55,
	});
	const jwt = response.data.token;
	cache.set(lxm, { token: jwt, expires: Date.now() + 50_000 });
	return jwt;
}
export type LinkMetadata = { uri: string; title: string; description?: string; image?: string };
async function call<T>(
	lxm: string,
	path: string,
	options: RequestInit = {},
	auth: 'none' | 'optional' | 'required' = 'optional',
): Promise<T> {
	const jwt = auth === 'none' ? undefined : await token(lxm);
	if (auth === 'required' && !jwt) throw new Error('Authentication required');
	const response = await fetch(`${base}${path}`, {
		...options,
		headers: {
			...(options.body ? { 'content-type': 'application/json' } : {}),
			...(jwt ? { authorization: `Bearer ${jwt}` } : {}),
		},
	});
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
	const lxm = 'com.suibari.nagi.getLinkThumbnail';
	const jwt = await token(lxm);
	if (!jwt) throw new Error('Authentication required');
	const response = await fetch(`${base}/xrpc/${lxm}?url=${encodeURIComponent(url)}`, {
		headers: { authorization: `Bearer ${jwt}` },
	});
	if (!response.ok) throw new Error(`Thumbnail request failed (${response.status})`);
	return response.blob();
}
export async function prepareDeleteAccountData(): Promise<void> {
	const jwt = await token('com.suibari.nagi.deleteAccountData');
	if (!jwt) throw new Error('Authentication required');
}
export { base as APPVIEW_URL };
