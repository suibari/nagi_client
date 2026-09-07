import { type ReadPosition, type UnreadView } from '$lib/unread/watermark.svelte';
import { sectionWatermark } from '$lib/unread/sections.svelte';
import type { FeedItem, PostView } from '$lib/api/types';
import { hasSeenPost } from '$lib/post/seen';

export type MyNagiUnreadSection = 'bot' | 'community' | 'list' | 'channels';

const STORAGE_KEY_PREFIX = 'nagi.my-nagi-read-state.v1';

/**
 * 既読位置はアカウント同期する（サーバー側は DID 単位）ので、ローカルのキーも
 * DID で分ける。サインアウト中は guest スコープに閉じ込める。
 */
export const myNagiStorageKey = (section: MyNagiUnreadSection, viewerDid?: string) =>
	`${STORAGE_KEY_PREFIX}.${section}.${encodeURIComponent(viewerDid ?? 'guest')}`;

/**
 * my Nagi を開いた時点の既読位置を固定する。
 * ウォーターマーク自体はセクションごとに1つ（`$lib/unread/sections`）で、
 * 進んだ位置はそこからアカウントへ同期される。
 */
export function openMyNagiUnreadView(section: MyNagiUnreadSection, viewerDid?: string): UnreadView {
	const view = sectionWatermark(
		section,
		myNagiStorageKey(section, viewerDid),
		viewerDid,
	).openView();
	return {
		advance: view.advance,
		isUnread(position) {
			return !hasSeenPost(position.uri, viewerDid) && view.isUnread(position);
		},
	};
}

/** API が返す最新順を信用せず、AppView と同じ日時・URI順で最新位置を選ぶ。 */
export function latestReadPosition<T>(
	items: T[],
	positionOf: (item: T) => ReadPosition,
): ReadPosition | undefined {
	let latest: ReadPosition | undefined;
	for (const item of items) {
		const candidate = positionOf(item);
		if (Number.isNaN(Date.parse(candidate.indexedAt))) continue;
		if (
			!latest ||
			Date.parse(candidate.indexedAt) > Date.parse(latest.indexedAt) ||
			(Date.parse(candidate.indexedAt) === Date.parse(latest.indexedAt) &&
				candidate.uri > latest.uri)
		) {
			latest = candidate;
		}
	}
	return latest;
}

/** ThreadUnit 内に実際に含まれるルート・返信・bot返信をまとめて最新投稿を選ぶ。 */
export function latestIncludedPostPosition(items: FeedItem[]): ReadPosition | undefined {
	return latestReadPosition(includedPostPositions(items), (position) => position);
}

/** ThreadUnit 内に実際に含まれる全投稿位置。別画面で見たURIだけを個別に除外できる。 */
export function includedPostPositions(items: FeedItem[]): ReadPosition[] {
	const posts: PostView[] = [];
	for (const item of items) {
		if (item.conversation) {
			posts.push(item.conversation.root, ...item.conversation.bubbles.map(({ post }) => post));
			continue;
		}
		if (item.replyParent) posts.push(item.replyParent);
		posts.push(item);
		if (item.botReply) posts.push(item.botReply);
	}
	return posts.map((post) => ({ indexedAt: post.indexedAt, uri: post.uri }));
}

/** 表示中はドットを維持しつつ、次回表示に向けて最新位置まで既読にする。 */
export function readLatest(view: UnreadView | undefined, latest?: ReadPosition): boolean {
	if (!view) return false;
	const unread = latest ? view.isUnread(latest) : false;
	view.advance(latest);
	return unread;
}

/** URIごとの既読を考慮し、含まれる投稿のどれか1件でも未読ならバーを出す。 */
export function readPositions(view: UnreadView | undefined, positions: ReadPosition[]): boolean {
	if (!view) return false;
	const unread = positions.some((position) => view.isUnread(position));
	view.advance(latestReadPosition(positions, (position) => position));
	return unread;
}

export function readIncludedPosts(view: UnreadView | undefined, items: FeedItem[]): boolean {
	return readPositions(view, includedPostPositions(items));
}
