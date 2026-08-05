import { writable, get } from 'svelte/store';
import { getUnreadCount, updateSeen } from '$lib/api/appview';
import { session } from '$lib/oauth/session.svelte';

/**
 * 未読通知件数のグローバルストア。サーバーの readAt を単一の真実源とし、
 * ここには getUnreadCount の結果だけを持つ（ローカルで既読状態を持たない）。
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
const RETRY_DELAY_MS = 5_000;
let timer: ReturnType<typeof setInterval> | undefined;
let retryTimer: ReturnType<typeof setTimeout> | undefined;
let started = false;
/**
 * 「この時点より前に発射した getUnreadCount の応答は捨てる」ための世代。
 * markAllSeen の楽観的 0 が、それ以前に飛んでいた応答で巻き戻されるのを防ぐ。
 */
let generation = 0;

/** 未読件数をサーバーから取り直す。未ログイン・失敗時は静かにスキップ（次回に再試行）。 */
export async function refreshUnread() {
	if (!get(session)) return;
	const request = generation;
	try {
		const { count } = await getUnreadCount();
		if (request !== generation) return;
		unreadCount.set(count);
	} catch {
		// 一時的な認証切れやネットワーク断。60秒待たずに一度だけ取り直す
		// （タブ復帰の直後はトークン更新と重なって失敗しやすい）。
		if (retryTimer) return;
		retryTimer = setTimeout(() => {
			retryTimer = undefined;
			void refreshUnread();
		}, RETRY_DELAY_MS);
	}
}

/** seenAt までを一括既読にし、成功したらバッジを 0 に落とす。 */
export async function markAllSeen(seenAt: string) {
	if (!get(session)) return;
	try {
		await updateSeen(seenAt);
		generation++;
		unreadCount.set(0);
	} catch {
		// 失敗しても致命的ではない。次回オープン時に再送される。
	}
}

function onVisible() {
	if (document.visibilityState === 'visible') void refreshUnread();
}

/**
 * ポーリング（60秒）＋ウィンドウ復帰時・プッシュ受信時の再取得を開始する。多重起動しない。
 * ログイン中は即時取得、ログアウトでバッジを 0 に戻す。
 */
export function startUnreadPolling() {
	if (typeof window === 'undefined' || started) return;
	started = true;
	// 件数が変わるたびに PWA アプリバッジへ反映する（唯一の真実源は unreadCount）。
	// ただし購読直後に流れてくる初期値 0 では消さない。Service Worker が
	// バックグラウンドで積んだ OS バッジを、起動しただけで消してしまうため。
	let firstBadgeEmission = true;
	unreadCount.subscribe((count) => {
		if (firstBadgeEmission) {
			firstBadgeEmission = false;
			if (count === 0) return;
		}
		syncAppBadge(count);
	});
	// ログイン/ログアウトに追従（初回購読で現在値が即座に流れる）。
	session.subscribe((current) => {
		if (current) void refreshUnread();
		else {
			generation++;
			unreadCount.set(0);
		}
	});
	timer = setInterval(() => void refreshUnread(), POLL_INTERVAL_MS);
	window.addEventListener('focus', () => void refreshUnread());
	document.addEventListener('visibilitychange', onVisible);
	// タブを開いたままプッシュが届いたとき、次のポーリングまで最大60秒バッジが
	// 古いままになるのを避ける。Service Worker からの合図で即座に取り直す。
	navigator.serviceWorker?.addEventListener('message', (event: MessageEvent) => {
		if (event.data?.type === 'nagi:push') void refreshUnread();
	});
}
