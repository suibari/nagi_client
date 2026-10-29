import type { FeedItem, PostView, ThreadView } from '$lib/api/types';

export function itemPosts(item: FeedItem): PostView[] {
	return item.conversation
		? [item.conversation.root, ...item.conversation.bubbles.map((bubble) => bubble.post)]
		: [item.replyParent, item, item.botReply].filter((post): post is PostView => Boolean(post));
}

/** Only direct bot replies to another person's top-level post are candidates. Replies with media stay visible. */
export function collapsibleBotReplies(
	posts: PostView[],
	viewerDid?: string,
	allowUnknownRoot = false,
): Set<string> {
	const byUri = new Map(posts.map((post) => [post.uri, post]));
	const repliedTo = new Set(
		[...byUri.values()]
			.filter((post) => !post.isBot && !post.deleted)
			.map((post) => post.reply?.parent.uri),
	);
	return new Set(
		[...byUri.values()]
			.filter((post) => {
				if (!post.isBot || !post.reply || post.deleted || post.images?.length || post.video)
					return false;
				if (repliedTo.has(post.uri)) return false;
				const root = byUri.get(post.reply.root.uri);
				if (!root) return allowUnknownRoot && post.reply.parent.uri === post.reply.root.uri;
				return Boolean(
					root &&
					!root.reply &&
					!root.isBot &&
					root.author.did !== viewerDid &&
					post.reply.parent.uri === root.uri,
				);
			})
			.map((post) => post.uri),
	);
}

/** Short-lived, shared checks. Invalidation also prevents an old request from repopulating the cache. */
export class BotReplyChecks {
	private entries = new Map<
		string,
		{ promise: Promise<ThreadView | undefined>; expires: number; signature: string }
	>();
	constructor(private fetchThread: (uri: string) => Promise<{ thread: ThreadView }>) {}
	clear() {
		this.entries.clear();
	}
	get(
		viewerDid: string | undefined,
		rootUri: string,
		signature: string,
	): Promise<ThreadView | undefined> {
		const key = JSON.stringify([viewerDid, rootUri]);
		const cached = this.entries.get(key);
		if (cached && cached.expires > Date.now() && cached.signature === signature)
			return cached.promise;
		const entry = {
			promise: Promise.resolve<ThreadView | undefined>(undefined),
			expires: Infinity,
			signature,
		};
		entry.promise = this.fetchThread(rootUri)
			.then(({ thread }) => thread)
			.catch(() => undefined)
			.finally(() => {
				entry.expires = Date.now() + 3_000;
			});
		if (this.entries.size >= 200) this.entries.delete(this.entries.keys().next().value!);
		this.entries.set(key, entry);
		return entry.promise;
	}
}
