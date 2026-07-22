import { PUBLIC_VAPID_KEY } from '$env/static/public';
import { registerPushSubscription, deletePushSubscription } from '$lib/api/appview';

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

/** リアクティブな購読状態。ページはこれを読んでトグルの見た目を切り替える。 */
export const pushState = $state({
	supported: false,
	permission: 'default' as NotificationPermission,
	subscribed: false,
	busy: false
});

/** 現在の購読状態を読み直す（ページマウント時に呼ぶ）。 */
export async function refreshPushState(): Promise<void> {
	pushState.supported = isPushSupported();
	if (!pushState.supported) return;
	pushState.permission = Notification.permission;
	try {
		const reg = await navigator.serviceWorker.ready;
		const sub = await reg.pushManager.getSubscription();
		pushState.subscribed = !!sub;
	} catch {
		pushState.subscribed = false;
	}
}

/**
 * 通知許可を取り、プッシュ購読して AppView に登録する。成功で subscribed=true。
 * 許可が拒否された場合や非対応の場合は false を返す。
 */
export async function enablePush(): Promise<boolean> {
	if (!isPushSupported() || pushState.busy) return false;
	pushState.busy = true;
	try {
		const permission = await Notification.requestPermission();
		pushState.permission = permission;
		if (permission !== 'granted') return false;
		const reg = await navigator.serviceWorker.ready;
		const existing = await reg.pushManager.getSubscription();
		const sub =
			existing ??
			(await reg.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY) as BufferSource
			}));
		await registerPushSubscription(toInput(sub));
		pushState.subscribed = true;
		return true;
	} catch (e) {
		console.error('[push] enable failed', e);
		return false;
	} finally {
		pushState.busy = false;
	}
}

/** プッシュ購読を解除し、AppView からも削除する。 */
export async function disablePush(): Promise<void> {
	if (pushState.busy) return;
	pushState.busy = true;
	try {
		await unsubscribeCurrent();
		pushState.subscribed = false;
	} finally {
		pushState.busy = false;
	}
}

/**
 * 現在のデバイスの購読を解除して AppView からも消す。サインアウト時にも使うため
 * pushState を触らず副作用を最小化した下請け。失敗しても致命的でないので握りつぶす。
 */
export async function unsubscribeCurrent(): Promise<void> {
	if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
	try {
		const reg = await navigator.serviceWorker.ready;
		const sub = await reg.pushManager.getSubscription();
		if (!sub) return;
		const { endpoint } = sub;
		await sub.unsubscribe().catch(() => {});
		await deletePushSubscription(endpoint).catch(() => {});
	} catch {
		// 未ログイン・SW未登録などは無視。
	}
}
