import type { AppBskyFeedDefs, AppBskyFeedGetPostThread } from '@atproto/api';
import { toPostCard, type BskyPostCardView } from './mapView';

export type BskyThreadSnapshot = {
	posts: BskyPostCardView[];
	unavailableUris: string[];
	incomplete: boolean;
};
type ThreadNode = AppBskyFeedGetPostThread.OutputSchema['thread'];

/** Flatten all reply branches, preserving each post's moderation data. Counts never assume missing replies are visible. */
export function toThreadSnapshot(thread: ThreadNode): BskyThreadSnapshot {
	if (thread.$type !== 'app.bsky.feed.defs#threadViewPost') throw new Error('Thread unavailable');
	const posts = new Map<string, BskyPostCardView>();
	const unavailableUris: string[] = [];
	let incomplete = false;
	const pending: ThreadNode[] = [thread];
	let visited = 0;
	while (pending.length && visited++ < 1000) {
		const node = pending.pop()!;
		if (node.$type !== 'app.bsky.feed.defs#threadViewPost') {
			const uri = (node as { uri?: string }).uri;
			if (uri) unavailableUris.push(uri);
			incomplete = true;
			continue;
		}
		const view = node as AppBskyFeedDefs.ThreadViewPost;
		if (posts.has(view.post.uri)) continue;
		posts.set(view.post.uri, toPostCard(view.post));
		const replies = view.replies ?? [];
		if ((view.post.replyCount ?? 0) > replies.length) incomplete = true;
		pending.push(...replies);
	}
	return {
		posts: [...posts.values()],
		unavailableUris,
		incomplete: incomplete || pending.length > 0,
	};
}

/** Bound parallel requests and share snapshots between the same thread's normal/repost cards. Owned by the OAuth context. */
export class BskyThreadLoader {
	#cache = new Map<string, { promise: Promise<BskyThreadSnapshot>; expires: number }>();
	#queue: (() => void)[] = [];
	#active = 0;
	constructor(private readonly fetcher: (uri: string) => Promise<BskyThreadSnapshot>) {}

	get(uri: string): Promise<BskyThreadSnapshot> {
		const cached = this.#cache.get(uri);
		if (cached && cached.expires > Date.now()) return cached.promise;
		const entry = {
			promise: undefined as unknown as Promise<BskyThreadSnapshot>,
			expires: Infinity,
		};
		entry.promise = new Promise<BskyThreadSnapshot>((resolve, reject) => {
			this.#queue.push(() => {
				this.#active++;
				void this.fetcher(uri)
					.then(
						(snapshot) => {
							entry.expires = Date.now() + 25_000;
							resolve(snapshot);
						},
						(error: unknown) => {
							if (this.#cache.get(uri) === entry) this.#cache.delete(uri);
							reject(error);
						},
					)
					.finally(() => {
						this.#active--;
						this.#drain();
					});
			});
		});
		this.#cache.delete(uri);
		this.#cache.set(uri, entry);
		// Pending requests are retained for deduplication; evict settled snapshots first.
		for (const [key, value] of this.#cache) {
			if (this.#cache.size <= 100) break;
			if (value.expires !== Infinity) this.#cache.delete(key);
		}
		this.#drain();
		return entry.promise;
	}
	#drain() {
		while (this.#active < 3 && this.#queue.length) this.#queue.shift()!();
	}
}
