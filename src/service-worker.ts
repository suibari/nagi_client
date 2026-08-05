/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

// SvelteKit が自動登録する Service Worker。ここではキャッシュは扱わず、Web Push の
// 受信（push）とクリック（notificationclick）だけを担当する。閉じた PWA でも OS の
// プッシュサービス経由でこのワーカーが起こされ、通知を表示できる。

const sw = self as unknown as ServiceWorkerGlobalScope;

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
 * ここでできるのは「新しい購読を作り直す」までで、AppView への登録はできない。
 * XRPC は PDS プロキシ経由の DPoP セッションを必要とし、SW はそれを持たないため。
 * サーバーへの再登録は、次回アプリ起動時に +layout.svelte が走らせる
 * refreshPushState() が引き受ける（端末に購読があれば idempotent に再登録する）。
 * この分担が崩れると「端末は購読済みだがサーバーに行が無い」端末が生まれ、
 * 通知が来ないのにユーザーからは ON に見える状態になる。
 */
sw.addEventListener('pushsubscriptionchange', (event) => {
	// pushsubscriptionchange は TS の SW 型定義に含まれないので手当てする。
	const change = event as ExtendableEvent & { oldSubscription?: PushSubscription | null };
	const applicationServerKey = change.oldSubscription?.options?.applicationServerKey;
	if (!applicationServerKey) return;
	change.waitUntil(
		sw.registration.pushManager
			.subscribe({ userVisibleOnly: true, applicationServerKey })
			.then(() => undefined)
			.catch(() => undefined),
	);
});
