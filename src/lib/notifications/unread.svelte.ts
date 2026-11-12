import { writable, get } from 'svelte/store';
import { getUnreadCount, updateSeen } from '$lib/api/appview';
import { session, onOAuthSessionReady, type OAuthSession } from '$lib/oauth/session.svelte';

export const unreadCount = writable(0);

function syncAppBadge(count: number) {
	if (typeof navigator === 'undefined') return;
	const nav = navigator as Navigator & {
		setAppBadge?: (n?: number) => Promise<void>;
		clearAppBadge?: () => Promise<void>;
	};
	try {
		const result = count > 0 ? nav.setAppBadge?.(count) : nav.clearAppBadge?.();
		void result?.catch(() => undefined);
	} catch {
		// バッジ非対応環境ではAPIが同期的に拒否する場合もある。
	}
}

const POLL_INTERVAL_MS = 60_000;
const RETRY_DELAY_MS = 5_000;
let retryTimer: ReturnType<typeof setTimeout> | undefined;
let started = false;
// NOTIFY-02: 既読化・セッション変更前に開始した応答を捨てる。
let generation = 0;
let activeSession: OAuthSession | null = null;

function clearRetry() {
	clearTimeout(retryTimer);
	retryTimer = undefined;
}

export async function refreshUnread(current = get(session)) {
	if (!current) return;
	const request = generation;
	const isCurrent = () => request === generation && get(session) === current;
	try {
		const { count } = await getUnreadCount(current);
		if (!isCurrent()) return;
		unreadCount.set(count);
	} catch {
		if (!isCurrent() || retryTimer) return;
		retryTimer = setTimeout(() => {
			retryTimer = undefined;
			if (isCurrent()) void refreshUnread(current);
		}, RETRY_DELAY_MS);
	}
}

export async function markAllSeen(seenAt: string) {
	const current = get(session);
	if (!current) return;
	const request = generation;
	try {
		await updateSeen(seenAt);
		if (request !== generation || get(session) !== current) return;
		generation++;
		clearRetry();
		unreadCount.set(0);
	} catch {
		// 次回一覧を開いたときに再送する。
	}
}

function activateSession(current: OAuthSession | null) {
	if (activeSession === current) return;
	generation++;
	clearRetry();
	activeSession = current;
	unreadCount.set(0);
	if (current) void refreshUnread(current);
}

function onVisible() {
	if (document.visibilityState === 'visible') void refreshUnread();
}

export function startUnreadPolling() {
	if (typeof window === 'undefined' || started) return;
	started = true;
	// SWが積んだOSバッジを初期値0だけで消さない。
	let firstBadgeEmission = true;
	const stopBadge = unreadCount.subscribe((count) => {
		if (firstBadgeEmission) {
			firstBadgeEmission = false;
			if (count === 0) return;
		}
		syncAppBadge(count);
	});
	const stopReady = onOAuthSessionReady(activateSession);
	const stopSession = session.subscribe(activateSession);
	const timer = setInterval(() => void refreshUnread(), POLL_INTERVAL_MS);
	const onFocus = () => void refreshUnread();
	const onPush = (event: MessageEvent) => {
		if (event.data?.type === 'nagi:push') void refreshUnread();
	};
	window.addEventListener('focus', onFocus);
	document.addEventListener('visibilitychange', onVisible);
	navigator.serviceWorker?.addEventListener('message', onPush);
	return () => {
		stopReady();
		stopSession();
		stopBadge();
		clearInterval(timer);
		clearRetry();
		window.removeEventListener('focus', onFocus);
		document.removeEventListener('visibilitychange', onVisible);
		navigator.serviceWorker?.removeEventListener('message', onPush);
		generation++;
		activeSession = null;
		unreadCount.set(0);
		started = false;
	};
}
