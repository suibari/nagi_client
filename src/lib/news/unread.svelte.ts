import { get } from 'svelte/store';
import { session } from '$lib/oauth/session.svelte';
import { sectionWatermark } from '$lib/unread/sections.svelte';
import { type ReadPosition, type UnreadView } from '$lib/unread/watermark.svelte';

/**
 * ニュースの既読位置。my Nagi のニュースセクションのドットと /news 一覧の未読表示に使う。
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

/**
 * my Nagi 表示時にもニュースの既読位置を進めるようポリシー統一済み。
 * 互換性のために残しており、現在は readLatest と同等または readLatest を使用します。
 */
export function previewUnreadNews(view: UnreadView | undefined, latest?: ReadPosition): boolean {
	if (!view) return false;
	const unread = latest ? view.isUnread(latest) : false;
	view.advance(latest);
	return unread;
}
