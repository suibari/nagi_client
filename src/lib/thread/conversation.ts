import type { FeedItem, ThreadView } from '$lib/api/types';
import { replyDepths } from './replyIndent';

const VISIBLE_REPLY_COUNT = 3;

/** group 非対応の旧 getProfile 応答を、getThread から通常タイムライン形式へ補完する。 */
export function threadToConversationItem(thread: ThreadView): FeedItem {
	const replies = [...thread.replies].sort(
		(a, b) => a.createdAt.localeCompare(b.createdAt) || a.uri.localeCompare(b.uri),
	);
	const depths = replyDepths(thread.post.uri, [thread.post, ...replies]);
	const visibleReplies = replies.slice(-VISIBLE_REPLY_COUNT);
	const awaitingPost = [thread.post, ...replies]
		.reverse()
		.find(
			(post) =>
				post.botReplyState === 'pending' ||
				post.botReplyState === 'processing' ||
				post.botReplyState === 'failed',
		);

	return {
		...thread.post,
		// ThreadUnit は待機時間の判定に代表 item の日時を使う。待機中なら対象投稿の日時に合わせる。
		createdAt: awaitingPost?.createdAt ?? thread.post.createdAt,
		conversation: {
			threadRootUri: thread.post.uri,
			root: thread.post,
			bubbles: visibleReplies.map((post) => ({
				post,
				depth: depths.get(post.uri) ?? 1,
			})),
			hiddenCount: Math.max(0, replies.length - visibleReplies.length),
			totalCount: replies.length + 1,
			...(awaitingPost?.botReplyState && awaitingPost.botReplyState !== 'posted'
				? { awaitingBotReply: awaitingPost.botReplyState }
				: {}),
		},
	};
}
