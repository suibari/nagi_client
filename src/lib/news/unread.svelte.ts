import { get } from 'svelte/store';
import { session } from '$lib/oauth/session.svelte';
import { sectionWatermark } from '$lib/unread/sections.svelte';
import type { UnreadView } from '$lib/unread/watermark.svelte';

/**
 * ニュースの既読位置。/news 一覧の未読表示と、右サイドバーの1件選定（未読優先）に使う。
 * ナビにはバッジを出さない（ニュースは急いで読むものではないため）ので、
 * 未読を先回りして調べるポーリングは持たず、画面を開いたときだけ判定する。
 * 既読はアカウント同期する（サーバー側は DID 単位）ので、ローカルのキーも DID で分ける。
 * サインアウト中の閲覧は guest スコープに閉じ込める。
 */
export const newsStorageKey = (viewerDid?: string) =>
	`nagi.news-read-state.v1.${encodeURIComponent(viewerDid ?? 'guest')}`;

/** サインイン状態が変わるとキーごと変わるので、その都度いまのウォーターマークを引く。 */
const current = (viewerDid: string | undefined = get(session)?.did) =>
	sectionWatermark('news', newsStorageKey(viewerDid), viewerDid);

/** ニュース一覧を開いた時点の既読基準を凍結したビュー。マウントごとに1つ作る。 */
export const openNewsUnreadView = (viewerDid?: string): UnreadView => current(viewerDid).openView();
