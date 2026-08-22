/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

import { PUBLIC_APPVIEW_URL, PUBLIC_VAPID_KEY } from '$env/static/public';
import { loadPushInstallation } from '$lib/notifications/push-installation';

// SvelteKit が自動登録する Service Worker。ここではキャッシュは扱わず、Web Push の
// 受信（push）とクリック（notificationclick）だけを担当する。閉じた PWA でも OS の
// プッシュサービス経由でこのワーカーが起こされ、通知を表示できる。

const sw = self as unknown as ServiceWorkerGlobalScope;
const appviewBase = PUBLIC_APPVIEW_URL || 'http://localhost:3002';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
	const raw = atob(base64);
	const output = new Uint8Array(raw.length);
	for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
	return output;
}

function subscriptionInput(sub: PushSubscription) {
	const keys = sub.toJSON().keys ?? {};
	return {
		endpoint: sub.endpoint,
		keys: { p256dh: keys.p256dh ?? '', auth: keys.auth ?? '' },
	};
}

// この SW は薄く保つ。修正しても旧版が居座ると端末に届かないため、判断はできる限り
// サーバー（payload）に寄せ、ここは受け取ったものを表示するだけにする。
// skipWaiting / clients.claim は、次に不具合が見つかったときすぐ差し替えるための保険。
sw.addEventListener('install', () => sw.skipWaiting());
sw.addEventListener('activate', (event) => event.waitUntil(sw.clients.claim()));

/**
 * ⚠ この型は bsky-affirmative-bot/apps/nagi_appview/src/services/pushPayload.ts と対。
 *    別リポジトリで型を共有できないため、変更時は必ず両方を更新すること。
 *    サーバーだけ先にデプロイされる／SW だけ古いまま残る状況が普通に起きるので、
 *    すべてのフィールドは optional にして受信側でフォールバックする。
 */
interface PushPayload {
	title?: string;
	body?: string;
	type?: string;
	tag?: string;
	url?: string;
}

/**
 * 通知タグを決める。tag はサーバーが通知1件ごとに一意な値を入れてくる（pushPayload.ts）。
 *
 * ⚠ payload に tag が無いときのフォールバックは必ず「一意な値」にすること。
 *    かつてここが payload.type だったため、同じ種別の通知が既存の通知を静かに置き換え、
 *    2通目以降が音もバナーも無しに消えるという障害を起こした（Notifications 仕様では
 *    同一 tag の通知は renotify なしだと再アラートされない）。
 *    フォールバックは「通知が重複して出る」側に倒す。うるさいが気づける。
 *    「消える」側に倒すと誰も気づけない。
 */
function notificationTag(payload: PushPayload): string {
	if (payload.tag) return payload.tag;
	return `${payload.type ?? 'nagi'}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

sw.addEventListener('push', (event) => {
	let payload: PushPayload = {};
	try {
		payload = event.data?.json() ?? {};
	} catch {
		payload = { body: event.data?.text() };
	}
	const title = payload.title ?? 'Nagi';
	const url = payload.url ?? '/notifications';
	event.waitUntil(
		(async () => {
			await sw.registration.showNotification(title, {
				body: payload.body ?? '',
				icon: '/nagi_icon_trans.png',
				badge: '/nagi_icon_trans.png',
				tag: notificationTag(payload),
				// tag が万一衝突しても再アラートさせる保険。tag の指定が前提の項目なので、
				// tag を空にする変更を入れるとここも壊れる。
				renotify: true,
				data: { url },
			});
			// アプリバッジを 1 増やす（未読の正確な件数はアプリ起動時に再同期される）。
			try {
				// @ts-expect-error setAppBadge is not yet in the SW lib types
				if (navigator.setAppBadge) await navigator.setAppBadge();
			} catch {
				// バッジ非対応環境では無視。
			}
			// 開いているタブへ知らせる。これが無いと、タブを開いたままプッシュが来ても
			// 次のポーリング（最大60秒）までナビの未読バッジが古いままになる。
			const clients = await sw.clients.matchAll({ type: 'window', includeUncontrolled: true });
			for (const client of clients) client.postMessage({ type: 'nagi:push' });
		})(),
	);
});

sw.addEventListener('notificationclick', (event) => {
	event.notification.close();
	const target = (event.notification.data as { url?: string } | undefined)?.url ?? '/notifications';
	event.waitUntil(
		(async () => {
			const clients = await sw.clients.matchAll({ type: 'window', includeUncontrolled: true });
			// 既に開いているウィンドウがあればフォーカスして遷移、無ければ新規に開く。
			for (const client of clients) {
				if ('focus' in client) {
					await client.focus();
					if ('navigate' in client) await client.navigate(target).catch(() => {});
					return;
				}
			}
			await sw.clients.openWindow(target);
		})(),
	);
});

/**
 * ブラウザ側の都合（鍵のローテーション等）で購読が差し替わったときに呼ばれる。
 *
 * installation capability はDIDを変更できない端末固有の秘密なので、OAuth sessionを
 * 持たないSWからでもAppView上の同じ購読だけを更新できる。失敗時は次回アプリ起動時の
 * refreshPushState() が認証済み経路で引き受ける。
 * この分担が崩れると「端末は購読済みだがサーバーに行が無い」端末が生まれ、
 * 通知が来ないのにユーザーからは ON に見える状態になる。
 */
sw.addEventListener('pushsubscriptionchange', (event) => {
	// pushsubscriptionchange は TS の SW 型定義に含まれないので手当てする。
	const change = event as ExtendableEvent & { oldSubscription?: PushSubscription | null };
	const applicationServerKey =
		change.oldSubscription?.options?.applicationServerKey ??
		(PUBLIC_VAPID_KEY ? (urlBase64ToUint8Array(PUBLIC_VAPID_KEY) as BufferSource) : undefined);
	if (!applicationServerKey) return;
	change.waitUntil(
		(async () => {
			const sub = await sw.registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey,
			});
			const installation = await loadPushInstallation();
			if (!installation) return;
			const response = await fetch(`${appviewBase}/xrpc/com.suibari.nagi.refreshPushSubscription`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					installationId: installation.installationId,
					capability: installation.capability,
					...subscriptionInput(sub),
				}),
			});
			if (!response.ok) throw new Error(`Push installation refresh failed (${response.status})`);
		})().catch(() => undefined),
	);
});
