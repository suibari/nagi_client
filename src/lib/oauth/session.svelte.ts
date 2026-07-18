import { writable, get } from 'svelte/store';
import { oauthClient } from './client';
export type OAuthSession = Awaited<ReturnType<typeof oauthClient.restore>>;
export const session = writable<OAuthSession | null>(null);
export const oauthReady = writable(false);
export const oauthError = writable<string | null>(null);
export async function initOAuth() {
	try {
		const result = await oauthClient.init();
		if (result?.session) session.set(result.session);
		else {
			const did = localStorage.getItem('nagi.did');
			if (did) session.set(await oauthClient.restore(did));
		}
	} catch (e) {
		oauthError.set(e instanceof Error ? e.message : 'OAuth initialization failed');
	} finally {
		oauthReady.set(true);
	}
}
export async function signIn(handle: string) {
	await oauthClient.signIn(handle.trim(), { scope: undefined });
}
export async function signOut() {
	const current = get(session);
	if (current) {
		localStorage.removeItem('nagi.did');
		await current.signOut();
	}
	session.set(null);
}
