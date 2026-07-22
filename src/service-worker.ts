/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

// SvelteKit が自動登録する Service Worker。ここではキャッシュは扱わず、Web Push の
// 受信（push）とクリック（notificationclick）だけを担当する。閉じた PWA でも OS の
// プッシュサービス経由でこのワーカーが起こされ、通知を表示できる。

const sw = self as unknown as ServiceWorkerGlobalScope;

interface PushPayload {
	title?: string;
	body?: string;
	type?: string;
	url?: string;
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
				icon: '/nagi_icon.png',
				badge: '/nagi_icon.png',
				tag: payload.type ?? 'nagi-notification',
				data: { url }
			});
			// アプリバッジを 1 増やす（未読の正確な件数はアプリ起動時に再同期される）。
			try {
				// @ts-expect-error setAppBadge is not yet in the SW lib types
				if (navigator.setAppBadge) await navigator.setAppBadge();
			} catch {
				// バッジ非対応環境では無視。
			}
		})()
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
		})()
	);
});
