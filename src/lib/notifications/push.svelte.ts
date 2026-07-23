import { PUBLIC_VAPID_KEY } from '$env/static/public';
import {
	ApiRequestError,
	registerPushSubscription,
	deletePushSubscription,
} from '$lib/api/appview';

/**
 * Web Push の購読状態と購読/解除の操作をまとめたモジュール。
 *
 * 閉じた PWA でも通知を届ける唯一の実用手段が Web Push（Service Worker の push
 * イベント）。iOS/iPadOS では 16.4+ かつ「ホーム画面に追加した standalone PWA」でしか
 * PushManager が存在しないため、非対応環境は UI 側で案内する。
 */

/** standalone（ホーム画面から起動）で動いているか。iOS の Web Push 可否判定に使う。 */
function isStandalone(): boolean {
	if (typeof window === 'undefined') return false;
	return (
		window.matchMedia?.('(display-mode: standalone)').matches ||
		// iOS Safari 独自プロパティ
		(navigator as unknown as { standalone?: boolean }).standalone === true
	);
}

/** この環境で Web Push が使えるか（SW + PushManager + Notification + VAPID鍵）。 */
export function isPushSupported(): boolean {
	if (typeof window === 'undefined') return false;
	return (
		'serviceWorker' in navigator &&
		'PushManager' in window &&
		'Notification' in window &&
		!!PUBLIC_VAPID_KEY
	);
}

/**
 * iOS で「非対応」に見えるのが standalone 未起動が原因かどうか。true のとき UI は
 * 「ホーム画面に追加して起動してください」を案内する。
 */
export function needsStandaloneForPush(): boolean {
	if (typeof window === 'undefined') return false;
	const iOS = /iP(hone|ad|od)/.test(navigator.userAgent);
	return iOS && !isStandalone() && !('PushManager' in window);
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
	const raw = atob(base64);
	const output = new Uint8Array(raw.length);
	for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
	return output;
}

function toInput(sub: PushSubscription) {
	const json = sub.toJSON();
	const keys = json.keys ?? {};
	return { endpoint: sub.endpoint, keys: { p256dh: keys.p256dh ?? '', auth: keys.auth ?? '' } };
}

export type PushPhase = 'idle' | 'checking' | 'enabling' | 'disabling' | 'error';
export type PushError =
	| 'permission-denied'
	| 'auth-required'
	| 'push-unavailable'
	| 'network'
	| 'registration-failed'
	| 'unsubscribe-failed';

function classifyError(error: unknown, fallback: PushError): PushError {
	const message = error instanceof Error ? error.message : '';
	if (error instanceof ApiRequestError) {
		if (error.status === 401 || error.status === 403 || /auth|scope/i.test(error.code ?? ''))
			return 'auth-required';
		if (error.status === 503 && error.code === 'push_unavailable') return 'push-unavailable';
	}
	if (/scope|authentication/i.test(message)) return 'auth-required';
	if (
		error instanceof TypeError ||
		(typeof navigator !== 'undefined' && navigator.onLine === false)
	)
		return 'network';
	return fallback;
}

function setReady(subscribed: boolean): void {
	pushState.registered = subscribed;
	pushState.subscribed = subscribed;
	pushState.error = null;
	pushState.phase = 'idle';
}

function setError(error: PushError): void {
	pushState.registered = false;
	pushState.subscribed = false;
	pushState.error = error;
	pushState.phase = 'error';
}

/** リアクティブな購読状態。ON は端末購読と AppView 登録の双方が成功した場合だけ。 */
export const pushState = $state({
	supported: false,
	permission: 'default' as NotificationPermission,
	browserSubscribed: false,
	registered: false,
	subscribed: false,
	busy: false,
	phase: 'idle' as PushPhase,
	error: null as PushError | null,
});

/**
 * 現在の購読状態を読み直す。端末内に購読があれば AppView へ idempotent に再登録し、
 * 「端末だけ購読済み」の不整合を自動修復する。
 */
export async function refreshPushState(): Promise<void> {
	pushState.supported = isPushSupported();
	if (!pushState.supported || pushState.busy) return;
	pushState.busy = true;
	pushState.phase = 'checking';
	pushState.error = null;
	pushState.permission = Notification.permission;
	try {
		const reg = await navigator.serviceWorker.ready;
		const sub = await reg.pushManager.getSubscription();
		pushState.browserSubscribed = !!sub;
		if (!sub) {
			setReady(false);
			return;
		}
		await registerPushSubscription(toInput(sub));
		setReady(true);
	} catch (error) {
		console.error('[push] refresh/register failed', error);
		setError(classifyError(error, 'registration-failed'));
	} finally {
		pushState.busy = false;
	}
}

/**
 * 通知許可を取り、プッシュ購読して AppView に登録する。成功で subscribed=true。
 * 許可が拒否された場合や非対応の場合は false を返す。
 */
export async function enablePush(): Promise<boolean> {
	if (!isPushSupported() || pushState.busy) return false;
	pushState.busy = true;
	pushState.phase = 'enabling';
	pushState.error = null;
	let created: PushSubscription | null = null;
	try {
		const permission = await Notification.requestPermission();
		pushState.permission = permission;
		if (permission !== 'granted') {
			setError('permission-denied');
			return false;
		}
		const reg = await navigator.serviceWorker.ready;
		const existing = await reg.pushManager.getSubscription();
		const sub =
			existing ??
			(await reg.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY) as BufferSource,
			}));
		if (!existing) created = sub;
		pushState.browserSubscribed = true;
		await registerPushSubscription(toInput(sub));
		setReady(true);
		return true;
	} catch (error) {
		console.error('[push] enable failed', error);
		// 今回作った購読だけを戻す。以前からある不完全な購読は再認証後の修復に使える。
		if (created) {
			const removed = await created.unsubscribe().catch(() => false);
			pushState.browserSubscribed = !removed;
		}
		setError(classifyError(error, 'registration-failed'));
		return false;
	} finally {
		pushState.busy = false;
	}
}

/** プッシュ購読を解除し、AppView からも削除する。 */
export async function disablePush(): Promise<void> {
	if (pushState.busy) return;
	pushState.busy = true;
	pushState.phase = 'disabling';
	pushState.error = null;
	try {
		await removeCurrentSubscription();
		pushState.browserSubscribed = false;
		setReady(false);
	} catch (error) {
		console.error('[push] disable failed', error);
		// ローカル解除に成功していれば表示はOFFのままにする。AppView側の失効購読は
		// 次回配信の404/410でも掃除される。
		try {
			const reg = await navigator.serviceWorker.ready;
			pushState.browserSubscribed = !!(await reg.pushManager.getSubscription());
		} catch {
			pushState.browserSubscribed = false;
		}
		setError(classifyError(error, 'unsubscribe-failed'));
	} finally {
		pushState.busy = false;
	}
}

async function removeCurrentSubscription(): Promise<void> {
	if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
	const reg = await navigator.serviceWorker.ready;
	const sub = await reg.pushManager.getSubscription();
	if (!sub) return;

	let serverError: unknown;
	try {
		await deletePushSubscription(sub.endpoint);
	} catch (error) {
		serverError = error;
	}
	const unsubscribed = await sub.unsubscribe();
	if (!unsubscribed) throw new Error('Browser push subscription could not be removed');
	if (serverError) throw serverError;
}

/**
 * 現在のデバイスの購読を解除して AppView からも消す。サインアウト時にも使うため
 * pushState を触らず副作用を最小化した下請け。失敗しても致命的でないので握りつぶす。
 */
export async function unsubscribeCurrent(): Promise<void> {
	try {
		await removeCurrentSubscription();
	} catch {
		// 未ログイン・SW未登録などは無視。
	}
}
