import { writable, get } from 'svelte/store';
import { BASE_SCOPE, FULL_SCOPE, oauthClient } from './client';
import { normalizeHandle } from '$lib/atproto/handle';
export type OAuthSession = Awaited<ReturnType<typeof oauthClient.restore>>;
export const session = writable<OAuthSession | null>(null);
export const oauthReady = writable(false);
export const oauthError = writable<string | null>(null);
const OAUTH_RETURN_TO_KEY = 'nagi.oauth.return-to';

export function setOAuthReturnTo(path: string): void {
	if (typeof window === 'undefined' || !path.startsWith('/') || path.startsWith('//')) return;
	try {
		localStorage.setItem(OAUTH_RETURN_TO_KEY, path);
	} catch {
		// 戻り先を保存できなくてもOAuth自体は続行できる。
	}
}

export function consumeOAuthReturnTo(): string | null {
	if (typeof window === 'undefined') return null;
	try {
		const path = localStorage.getItem(OAUTH_RETURN_TO_KEY);
		localStorage.removeItem(OAUTH_RETURN_TO_KEY);
		return path?.startsWith('/') && !path.startsWith('//') ? path : null;
	} catch {
		return null;
	}
}

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
export async function signIn(
	handle: string,
	options: { crosspost?: boolean; refreshPermissions?: boolean } = {},
) {
	// クロスポストはオプトインなので、有効化するときだけ Bluesky への
	// 書き込み権限を含むスコープで認可し直す。
	// 先頭 @ や大文字・前後空白を落として handle 解決の失敗を防ぐ。
	await oauthClient.signIn(normalizeHandle(handle), {
		scope: options.crosspost ? FULL_SCOPE : BASE_SCOPE,
		...(options.refreshPermissions ? { prompt: 'consent' as const } : {}),
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
