import { writable, get } from 'svelte/store';
import { getUnreadCount, updateSeen } from '$lib/api/appview';
import { session } from '$lib/oauth/session.svelte';

/**
 * 未読通知件数のグローバルストア。サーバーの readAt を単一の真実源とし、
 * ここには getUnreadCount の結果だけを持つ（ローカルで既読状態を持たない）。
 * 将来の PWA アプリバッジ（navigator.setAppBadge）やプッシュ通知件数は、
 * このストアを更新する形で接続する。
 */
export const unreadCount = writable(0);

/** PWA アプリアイコンのバッジを未読件数に合わせる。非対応環境では静かに無視。 */
function syncAppBadge(count: number) {
	if (typeof navigator === 'undefined') return;
	const nav = navigator as Navigator & {
		setAppBadge?: (n?: number) => Promise<void>;
		clearAppBadge?: () => Promise<void>;
	};
	try {
		if (count > 0) void nav.setAppBadge?.(count);
		else void nav.clearAppBadge?.();
	} catch {
		// バッジ非対応（多くのデスクトップブラウザ等）は無視。
	}
}

const POLL_INTERVAL_MS = 60_000;
let timer: ReturnType<typeof setInterval> | undefined;
let started = false;

/** 未読件数をサーバーから取り直す。未ログイン・失敗時は静かにスキップ（次回に再試行）。 */
export async function refreshUnread() {
	if (!get(session)) return;
	try {
		unreadCount.set((await getUnreadCount()).count);
	} catch {
		// ネットワーク断や一時的な認証切れは無視。次のポーリングで回復する。
	}
}

/** seenAt までを一括既読にし、成功したらバッジを 0 に落とす。 */
export async function markAllSeen(seenAt: string) {
	if (!get(session)) return;
	try {
		await updateSeen(seenAt);
		unreadCount.set(0);
	} catch {
		// 失敗しても致命的ではない。次回オープン時に再送される。
	}
}

function onVisible() {
	if (document.visibilityState === 'visible') void refreshUnread();
}

/**
 * ポーリング（60秒）＋ウィンドウ復帰時の再取得を開始する。多重起動しない。
 * ログイン中は即時取得、ログアウトでバッジを 0 に戻す。
 */
export function startUnreadPolling() {
	if (typeof window === 'undefined' || started) return;
	started = true;
	// 件数が変わるたびに PWA アプリバッジへ反映する（唯一の真実源は unreadCount）。
	unreadCount.subscribe(syncAppBadge);
	// ログイン/ログアウトに追従（初回購読で現在値が即座に流れる）。
	session.subscribe((current) => {
		if (current) void refreshUnread();
		else unreadCount.set(0);
	});
	timer = setInterval(() => void refreshUnread(), POLL_INTERVAL_MS);
	window.addEventListener('focus', () => void refreshUnread());
	document.addEventListener('visibilitychange', onVisible);
}
