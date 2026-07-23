import { writable } from 'svelte/store';
import { getLatestPositiveNews } from '$lib/api/appview';
import type { NewsView } from '$lib/api/types';
import { i18n } from '$lib/i18n/i18n.svelte';

type NewsPosition = Pick<NewsView, 'indexedAt' | 'uri'>;
type StoredState = { initialized: false } | { initialized: true; seen?: NewsPosition };

export const NEWS_READ_STATE_STORAGE_KEY = 'nagi.news-read-state.v1';
export const unreadNews = writable(false);

const POLL_INTERVAL_MS = 30 * 60_000;
let state: StoredState = readStoredState();
let latestKnown: NewsPosition | undefined;
let timer: ReturnType<typeof setInterval> | undefined;
let started = false;

function isPosition(value: unknown): value is NewsPosition {
	if (!value || typeof value !== 'object') return false;
	const candidate = value as Partial<NewsPosition>;
	return (
		typeof candidate.indexedAt === 'string' &&
		!Number.isNaN(Date.parse(candidate.indexedAt)) &&
		typeof candidate.uri === 'string'
	);
}

function readStoredState(): StoredState {
	if (typeof window === 'undefined') return { initialized: false };
	try {
		const raw = window.localStorage.getItem(NEWS_READ_STATE_STORAGE_KEY);
		if (!raw) return { initialized: false };
		const parsed = JSON.parse(raw) as { initialized?: unknown; seen?: unknown };
		if (parsed.initialized !== true) return { initialized: false };
		return isPosition(parsed.seen)
			? { initialized: true, seen: parsed.seen }
			: { initialized: true };
	} catch {
		return { initialized: false };
	}
}

function persistState() {
	if (typeof window === 'undefined') return;
	try {
		window.localStorage.setItem(NEWS_READ_STATE_STORAGE_KEY, JSON.stringify(state));
	} catch {
		// 保存できない環境でも、このタブを開いている間はメモリ上で状態を維持する。
	}
}

/** AppView と同じ indexedAt DESC, uri DESC の順序で新旧を比較する。 */
function isNewer(candidate: NewsPosition, baseline: NewsPosition): boolean {
	const candidateTime = Date.parse(candidate.indexedAt);
	const baselineTime = Date.parse(baseline.indexedAt);
	return (
		candidateTime > baselineTime || (candidateTime === baselineTime && candidate.uri > baseline.uri)
	);
}

function positionOf(news: NewsView | undefined): NewsPosition | undefined {
	return news ? { indexedAt: news.indexedAt, uri: news.uri } : undefined;
}

function applyLatest(news: NewsView | undefined) {
	latestKnown = positionOf(news);
	if (!state.initialized) {
		// 機能を初めて使う端末では、現在の掲載分を既読の基準にする。
		state = { initialized: true, seen: latestKnown };
		persistState();
		unreadNews.set(false);
		return;
	}
	unreadNews.set(Boolean(latestKnown && (!state.seen || isNewer(latestKnown, state.seen))));
}

/** 最新ニュースを1件だけ確認する。失敗時は現在の表示を維持して次回に再試行する。 */
export async function refreshUnreadNews() {
	try {
		const page = await getLatestPositiveNews(i18n.locale);
		applyLatest(page.items[0]);
	} catch {
		// ネットワーク断などは未読表示を変えず、次のポーリングや画面復帰で再試行する。
	}
}

/** ニュース一覧で表示した最新分までを既読にする。空の一覧でも初期化済みとして記録する。 */
export function markNewsSeen(news?: NewsView) {
	const seen = positionOf(news);
	latestKnown = seen ?? latestKnown;
	if (!state.initialized) {
		state = { initialized: true, seen };
		persistState();
	} else if (seen && (!state.seen || isNewer(seen, state.seen))) {
		state = { initialized: true, seen };
		persistState();
	}
	// 一覧取得後にさらに新しいニュースを検出済みなら、その分の未読表示は残す。
	unreadNews.set(Boolean(latestKnown && (!state.seen || isNewer(latestKnown, state.seen))));
}

function onVisible() {
	if (document.visibilityState === 'visible') void refreshUnreadNews();
}

function onStorage(event: StorageEvent) {
	if (event.key !== NEWS_READ_STATE_STORAGE_KEY) return;
	state = readStoredState();
	if (!state.initialized) {
		void refreshUnreadNews();
		return;
	}
	unreadNews.set(Boolean(latestKnown && (!state.seen || isNewer(latestKnown, state.seen))));
}

/** 起動時・30分ごと・画面復帰時に未読ニュースを確認する。多重起動しない。 */
export function startUnreadNewsPolling() {
	if (typeof window === 'undefined' || started) return;
	started = true;
	void refreshUnreadNews();
	timer = setInterval(() => void refreshUnreadNews(), POLL_INTERVAL_MS);
	window.addEventListener('focus', () => void refreshUnreadNews());
	window.addEventListener('storage', onStorage);
	document.addEventListener('visibilitychange', onVisible);
}
