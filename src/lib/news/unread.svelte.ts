import { get } from 'svelte/store';
import { getLatestPositiveNews } from '$lib/api/appview';
import { i18n } from '$lib/i18n/i18n.svelte';
import { session } from '$lib/oauth/session.svelte';
import { sectionWatermark } from '$lib/unread/sections.svelte';
import { type ReadPosition, type UnreadView } from '$lib/unread/watermark.svelte';

/**
 * ニュースの既読位置。my Nagi のニュースセクションのドットと /news 一覧の未読表示に使う。
 * 既読はアカウント同期する（サーバー側は DID 単位）ので、ローカルのキーも DID で分ける。
 * サインアウト中の閲覧は guest スコープに閉じ込める。
 */
export const newsStorageKey = (viewerDid?: string) =>
	`nagi.news-read-state.v1.${encodeURIComponent(viewerDid ?? 'guest')}`;

const POLL_INTERVAL_MS = 30 * 60_000;
let timer: ReturnType<typeof setInterval> | undefined;
let started = false;

/** サインイン状態が変わるとキーごと変わるので、その都度いまのウォーターマークを引く。 */
const current = (viewerDid: string | undefined = get(session)?.did) =>
	sectionWatermark('news', newsStorageKey(viewerDid), viewerDid);

/** ニュース一覧を開いた時点の既読基準を凍結したビュー。マウントごとに1つ作る。 */
export const openNewsUnreadView = (viewerDid?: string): UnreadView => current(viewerDid).openView();

/**
 * my Nagi では未読の有無だけを確認し、未読だった位置はまだ既読へ進めない。
 * これにより「もっと見る」のニュース一覧が同じ基準で各記事を未読表示できる。
 * 初回利用・空一覧・すでに既読の場合は、現在位置との同期だけ行う。
 */
export function previewUnreadNews(view: UnreadView | undefined, latest?: ReadPosition): boolean {
	if (!view) return false;
	const unread = latest ? view.isUnread(latest) : false;
	if (!unread) view.advance(latest);
	return unread;
}

/** 最新ニュースを1件だけ確認する。失敗時は現在の表示を維持して次回に再試行する。 */
export async function refreshUnreadNews() {
	try {
		const page = await getLatestPositiveNews(i18n.locale);
		current().observeLatest(page.items[0]);
	} catch {
		// ネットワーク断などは未読表示を変えず、次のポーリングや画面復帰で再試行する。
	}
}

function onVisible() {
	if (document.visibilityState === 'visible') void refreshUnreadNews();
}

function onStorage(event: StorageEvent) {
	const watermark = current();
	if (event.key !== watermark.storageKey) return;
	watermark.reloadFromStorage();
	if (!watermark.initialized) void refreshUnreadNews();
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
