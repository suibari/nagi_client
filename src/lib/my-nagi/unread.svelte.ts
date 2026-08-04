import {
	createReadWatermark,
	type ReadPosition,
	type UnreadView,
} from '$lib/unread/watermark.svelte';
import type { FeedItem, PostView } from '$lib/api/types';

export type MyNagiUnreadSection = 'bot' | 'community' | 'list' | 'channels';

const STORAGE_KEY_PREFIX = 'nagi.my-nagi-read-state.v1';

/**
 * my Nagi を開いた時点の既読位置を固定する。
 * パーソナルなセクションは、同じ端末でアカウントを切り替えても混ざらないよう DID ごとに保存する。
 */
export function openMyNagiUnreadView(section: MyNagiUnreadSection, viewerDid?: string): UnreadView {
	const scope = section === 'bot' ? 'public' : encodeURIComponent(viewerDid ?? 'guest');
	return createReadWatermark(`${STORAGE_KEY_PREFIX}.${section}.${scope}`).openView();
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
	return latestReadPosition(posts, (post) => ({ indexedAt: post.indexedAt, uri: post.uri }));
}

/** 表示中はドットを維持しつつ、次回表示に向けて最新位置まで既読にする。 */
export function readLatest(view: UnreadView | undefined, latest?: ReadPosition): boolean {
	if (!view) return false;
	const unread = latest ? view.isUnread(latest) : false;
	view.advance(latest);
	return unread;
}
