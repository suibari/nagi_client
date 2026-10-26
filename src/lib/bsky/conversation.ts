import { threadPreview } from '$lib/thread/preview';
import { replyDepths } from '$lib/thread/replyIndent';
import type { BskyFeedItemView, BskyPostCardView } from './mapView';

type ReplyRef = { root?: { uri: string }; parent?: { uri: string } };
const replyOf = (post: BskyPostCardView) => (post.raw.record as { reply?: ReplyRef }).reply;
export type BskyConversation = {
	key: string;
	rootUri: string;
	item: BskyFeedItemView;
	root: BskyPostCardView;
	replies: { post: BskyPostCardView; depth: number }[];
	hiddenCount: number;
	incomplete: boolean;
};

/** Keep feed order, group replies by root, and preserve the attribution of independent reposts. */
export function bskyConversations(items: BskyFeedItemView[]): BskyConversation[] {
	const groups = new Map<
		string,
		{ item: BskyFeedItemView; rootUri: string; posts: Map<string, BskyPostCardView> }
	>();
	for (const item of items) {
		const rootUri = replyOf(item.post)?.root?.uri ?? item.root?.uri ?? item.post.uri;
		const key = item.repostedBy ? item.key : rootUri;
		let group = groups.get(key);
		if (!group) {
			group = { item, rootUri, posts: new Map() };
			groups.set(key, group);
		}
		for (const post of [item.root, item.parent]) {
			if (post && !group.posts.has(post.uri)) group.posts.set(post.uri, post);
		}
		group.posts.set(item.post.uri, item.post);
	}
	return [...groups].map(([key, group]) => {
		const posts = [...group.posts.values()];
		const root = group.posts.get(group.rootUri) ?? posts.find((post) => !replyOf(post)) ?? posts[0];
		const replies = posts
			.filter((post) => post.uri !== root.uri)
			.sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.uri.localeCompare(b.uri));
		const depths = replyDepths(
			root.uri,
			posts.map((post) => ({
				uri: post.uri,
				reply: replyOf(post)?.parent ? { parent: replyOf(post)!.parent! } : undefined,
			})),
		);
		const { visible, hiddenCount } = threadPreview(replies);
		return {
			key,
			rootUri: group.rootUri,
			item: group.item,
			root,
			replies: visible.map((post) => ({ post, depth: depths.get(post.uri) ?? 1 })),
			hiddenCount,
			incomplete:
				!group.posts.has(group.rootUri) ||
				posts.some((post) => {
					const parent = replyOf(post)?.parent?.uri;
					return Boolean(parent && !group.posts.has(parent));
				}),
		};
	});
}

export function conversationPosts(thread: BskyConversation) {
	return [thread.root, ...thread.replies.map((reply) => reply.post)];
}
