import { get } from 'svelte/store';
import { Agent } from '@atproto/api';
import { PUBLIC_APPVIEW_URL } from '$env/static/public';
import { session } from '$lib/oauth/session.svelte';
import type { NotificationView, Page, ProfileFeedFilter, ProfilePage, ThreadView, TimelinePage } from './types';
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
async function call<T>(
	lxm: string,
	path: string,
	options: RequestInit = {},
	auth: 'optional' | 'required' = 'optional',
): Promise<T> {
	const jwt = await token(lxm);
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
		'required',
	);
export { base as APPVIEW_URL };
