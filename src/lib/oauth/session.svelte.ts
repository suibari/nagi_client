import { writable, get } from 'svelte/store';
import { BASE_SCOPE, FULL_SCOPE, oauthClient } from './client';
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
export async function signIn(handle: string, options: { crosspost?: boolean } = {}) {
	// クロスポストはオプトインなので、有効化するときだけ Bluesky への
	// 書き込み権限を含むスコープで認可し直す。
	await oauthClient.signIn(handle.trim(), {
		scope: options.crosspost ? FULL_SCOPE : BASE_SCOPE,
	});
}
export async function signOut() {
	const current = get(session);
	if (current) {
		// 認可が切れる前にこのデバイスのプッシュ購読を解除・削除しておく（AppView 呼び出しは
		// 有効なセッションが要るため signOut より先に行う）。循環 import を避け動的読み込み。
		try {
			const { unsubscribeCurrent } = await import('$lib/notifications/push.svelte');
			await unsubscribeCurrent();
		} catch {
			// 購読解除に失敗してもサインアウト自体は続行する。
		}
		localStorage.removeItem('nagi.did');
		await current.signOut();
	}
	session.set(null);
}
