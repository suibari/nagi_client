import type { ActorView, FeedItem, Page, PostView } from '$lib/api/types';
import { m } from '$lib/i18n/i18n.svelte';
import { optimisticPosts } from './optimistic-posts.svelte';

const message = (e: unknown, fallback: string) => (e instanceof Error ? e.message : fallback);

/**
 * マージ/DOMキー用の安定キー。会話グループでは代表 uri が新リプライで変わっても
 * threadRootUri は不変なので、同スレッドの二重表示を防げる。
 */
export const feedKey = (item: FeedItem) => item.conversation?.threadRootUri ?? item.uri;
/** アイテムが内包する全投稿（会話バブル・返信元・bot返信を含む）。楽観突合・author記憶に使う。 */
export const feedPosts = (item: FeedItem): PostView[] =>
	item.conversation
		? [item.conversation.root, ...item.conversation.bubbles.map((b) => b.post)]
		: [item, item.replyParent, item.botReply].filter((p): p is PostView => Boolean(p));
/** feedPosts の uri 版。 */
export const feedUris = (item: FeedItem): string[] => feedPosts(item).map((p) => p.uri);

/**
 * Shared feed state for timeline/affirmation/profile tabs.
 * refresh() merges page 1 by uri (updates botReplyState/reactions in place,
 * prepends genuinely new items) so polling never makes the list jump.
 */
export class Feed {
	items = $state<FeedItem[]>([]);
	cursor = $state<string | undefined>(undefined);
	hasMore = $state(false);
	loading = $state(false);
	error = $state('');
	botActor = $state<ActorView>();
	#fetcher: (cursor?: string) => Promise<Page<FeedItem>>;
	#optimisticFilter: (item: FeedItem) => boolean;
	#refreshing = false;
	#loadRequest = 0;
	constructor(
		fetcher: (cursor?: string) => Promise<Page<FeedItem>>,
		optimisticFilter: (item: FeedItem) => boolean = () => true,
	) {
		this.#fetcher = fetcher;
		this.#optimisticFilter = optimisticFilter;
	}
	get visibleItems() {
		const pending = optimisticPosts.items.filter(this.#optimisticFilter);
		const pendingUris = new Set(pending.map((item) => item.uri));
		// 楽観投稿が既存アイテム（会話バブル含む）として現れたら、そのアイテム側を隠す。
		return [
			...pending,
			...this.items.filter((item) => !feedUris(item).some((u) => pendingUris.has(u))),
		];
	}
	hasOptimistic() {
		return optimisticPosts.items.some(this.#optimisticFilter);
	}
	async load() {
		const request = ++this.#loadRequest;
		this.loading = true;
		try {
			const page = await this.#fetcher();
			optimisticPosts.reconcile(page.items.flatMap(feedPosts));
			if (request !== this.#loadRequest) return;
			this.items = page.items;
			this.botActor = page.botActor ?? this.botActor;
			this.cursor = page.cursor;
			this.hasMore = page.hasMore;
			this.error = '';
		} catch (e) {
			if (request !== this.#loadRequest) return;
			this.error = message(e, m.loadFailed());
		} finally {
			if (request === this.#loadRequest) this.loading = false;
		}
	}
	async loadMore() {
		if (!this.cursor || this.loading) return;
		try {
			const page = await this.#fetcher(this.cursor);
			optimisticPosts.reconcile(page.items.flatMap(feedPosts));
			const seen = new Set(this.items.map(feedKey));
			const unseen = page.items.filter((p) => !seen.has(feedKey(p)));
			this.items = [...this.items, ...unseen];
			this.botActor = page.botActor ?? this.botActor;
			this.cursor = page.cursor;
			this.hasMore = page.hasMore;
		} catch (e) {
			this.error = message(e, m.loadFailed());
		}
	}
	async refresh() {
		if (this.#refreshing || this.loading) return;
		this.#refreshing = true;
		try {
			const page = await this.#fetcher();
			optimisticPosts.reconcile(page.items.flatMap(feedPosts));
			// スレッドキーでマージ。新リプライで代表 uri が変わっても同スレッドは in-place 更新され、
			// 二重表示されない。既存スレッドは位置固定（no-jump）、新規スレッドだけ prepend。
			const incoming = new Map(page.items.map((i) => [feedKey(i), i]));
			const seen = new Set(this.items.map(feedKey));
			const fresh = page.items.filter((i) => !seen.has(feedKey(i)));
			this.items = [...fresh, ...this.items.map((i) => incoming.get(feedKey(i)) ?? i)];
			this.botActor = page.botActor ?? this.botActor;
			if (!this.cursor) {
				this.cursor = page.cursor;
				this.hasMore = page.hasMore;
			}
			this.error = '';
		} catch {
			// background refresh failures stay silent; the next tick retries
		} finally {
			this.#refreshing = false;
		}
	}
	removePost(uri: string) {
		this.items = this.items.flatMap((item) => {
			if (item.conversation) {
				// ルート削除はスレッドを非共有化するので、会話ごと除去。
				if (item.conversation.root.uri === uri) return [];
				const bubbles = item.conversation.bubbles.filter((b) => b.post.uri !== uri);
				if (bubbles.length === item.conversation.bubbles.length) return [item];
				const removed = item.conversation.bubbles.length - bubbles.length;
				return [
					{
						...item,
						conversation: {
							...item.conversation,
							bubbles,
							totalCount: Math.max(1, item.conversation.totalCount - removed),
						},
					},
				];
			}
			if (item.uri === uri) return [];
			return [
				{
					...item,
					...(item.replyParent?.uri === uri ? { replyParent: undefined } : {}),
					...(item.botReply?.uri === uri
						? { botReply: undefined, botReplyState: undefined }
						: {}),
				},
			];
		});
	}
	/** true while one of `did`'s recent posts is still waiting for botたん */
	hasPendingFor(did?: string, windowMs = 180_000) {
		if (!did) return false;
		const now = Date.now();
		return this.items.some((i) => {
			const state = i.conversation?.awaitingBotReply ?? i.botReplyState;
			return (
				i.author.did === did &&
				(state === 'pending' || state === 'processing') &&
				now - new Date(i.createdAt).valueOf() < windowMs
			);
		});
	}
}
