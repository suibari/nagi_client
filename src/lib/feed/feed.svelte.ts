import type { ActorView, FeedItem, Page, PostView } from '$lib/api/types';
import { m } from '$lib/i18n/i18n.svelte';
import type { ReadWatermark, UnreadView } from '$lib/unread/watermark.svelte';
import { optimisticPosts } from './optimistic-posts.svelte';
import { postFollow } from './post-follow.svelte';
import { postTranslations } from '$lib/i18n/postTranslations.svelte';

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

/** 楽観返信を会話カードの末尾バブルとして足す。depth は返信元バブルのひとつ下。 */
function withPendingBubbles(item: FeedItem, pending: FeedItem[]): FeedItem {
	const conversation = item.conversation!;
	const depthOf = (post: FeedItem) =>
		(conversation.bubbles.find((b) => b.post.uri === post.replyParent?.uri)?.depth ?? 0) + 1;
	return {
		...item,
		conversation: {
			...conversation,
			bubbles: [
				...conversation.bubbles,
				...pending.map((post) => ({ post, depth: depthOf(post) })),
			],
			totalCount: conversation.totalCount + pending.length,
		},
	};
}

/**
 * サーバーが返した並びに合わせて1件だけ挿し直す。ポーリングでの並べ替えは画面が飛ぶので
 * 普段はしない（no-jump）が、自分が今書き込んだスレッドだけは「最新へ動く」ことが
 * 期待されるので例外にする。ページ1に居ないスレッドには触らない。
 */
function repositionFollowed(
	list: FeedItem[],
	page: FeedItem[],
	key: string | undefined,
): FeedItem[] {
	if (!key) return list;
	const rank = new Map(page.map((item, index) => [feedKey(item), index]));
	const target = rank.get(key);
	if (target === undefined) return list;
	const moving = list.find((item) => feedKey(item) === key);
	if (!moving) return list;
	const rest = list.filter((item) => feedKey(item) !== key);
	// loadMore で足したアイテムはページ1に居ない＝より古いので、後ろ扱いにする。
	const at = rest.findIndex((item) => (rank.get(feedKey(item)) ?? Infinity) > target);
	return at < 0 ? [...rest, moving] : [...rest.slice(0, at), moving, ...rest.slice(at)];
}

/**
 * Shared feed state for timeline/affirmation/profile tabs.
 * refresh() merges page 1 by thread key (updates botReplyState/reactions in place,
 * prepends genuinely new items) so polling never makes the list jump. The one
 * exception is the thread the viewer just posted into: that one follows the server order.
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
	#unread: UnreadView | undefined;
	#refreshing = false;
	#loadRequest = 0;
	constructor(
		fetcher: (cursor?: string) => Promise<Page<FeedItem>>,
		optimisticFilter: (item: FeedItem) => boolean = () => true,
		watermark?: ReadWatermark,
	) {
		this.#fetcher = fetcher;
		this.#optimisticFilter = optimisticFilter;
		// 既読基準はこのインスタンスを作った時点で凍結する。load() は画面ごとに複数回
		// 走る（onMount + oauthReady）ので、凍結を load() 側に置くとマークが即消える。
		this.#unread = watermark?.openView();
	}
	/**
	 * 楽観投稿を「会話カードへ合流させる返信」と「単独カードとして先頭へ出すもの」に振り分ける。
	 * 既にサーバー側のアイテムに含まれているものは捨てる（次の reconcile で消える）。
	 * 返信を単独カードにすると、確定した瞬間にそれが消えて元スレッドは元の位置のまま——
	 * つまり「返信したらスレッドごと消えた」ように見えるので、合流させる。
	 */
	#splitPending() {
		const merged = new Map<string, FeedItem[]>();
		const standalone: FeedItem[] = [];
		const indexed = new Set(this.items.flatMap(feedUris));
		const conversations = new Set(this.items.filter((item) => item.conversation).map(feedKey));
		for (const pending of optimisticPosts.items) {
			if (indexed.has(pending.uri)) continue;
			const root = pending.reply?.root.uri;
			if (root && conversations.has(root)) merged.set(root, [...(merged.get(root) ?? []), pending]);
			else if (this.#optimisticFilter(pending)) standalone.push(pending);
		}
		return { merged, standalone };
	}
	get visibleItems() {
		const { merged, standalone } = this.#splitPending();
		if (!merged.size) return [...standalone, ...this.items];
		// 合流したスレッドは最新の活動になったので、サーバーの並びに先回りして先頭へ出す。
		const touched = this.items.filter((item) => merged.has(feedKey(item)));
		const rest = this.items.filter((item) => !merged.has(feedKey(item)));
		return [
			...standalone,
			...touched.map((item) => withPendingBubbles(item, merged.get(feedKey(item))!)),
			...rest,
		];
	}
	hasOptimistic() {
		const { merged, standalone } = this.#splitPending();
		return Boolean(merged.size || standalone.length);
	}
	/**
	 * 未読マーク対象か。マークはスレッド単位（カード1枚に1本）なので、判定も代表投稿
	 * （＝そのスレッドの最新の人間投稿）で行う。楽観カードと自分の投稿には付けない。
	 */
	isUnread(item: FeedItem, selfDid?: string) {
		return Boolean(
			this.#unread &&
			!item.optimisticState &&
			item.author.did !== selfDid &&
			this.#unread.isUnread(item),
		);
	}
	async load() {
		const request = ++this.#loadRequest;
		this.loading = true;
		try {
			const page = await this.#fetcher();
			void postTranslations.prepare(page.items);
			optimisticPosts.reconcile(page.items.flatMap(feedPosts));
			if (request !== this.#loadRequest) return;
			this.items = page.items;
			// 表示した最新分までを既読にする。未読マークは凍結した基準で判定するので消えない。
			this.#unread?.advance(page.items[0]);
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
		this.loading = true;
		this.error = '';
		try {
			const page = await this.#fetcher(this.cursor);
			void postTranslations.prepare(page.items);
			optimisticPosts.reconcile(page.items.flatMap(feedPosts));
			const seen = new Set(this.items.map(feedKey));
			const unseen = page.items.filter((p) => !seen.has(feedKey(p)));
			this.items = [...this.items, ...unseen];
			this.botActor = page.botActor ?? this.botActor;
			this.cursor = page.cursor;
			this.hasMore = page.hasMore;
			this.error = '';
		} catch (e) {
			this.error = message(e, m.loadFailed());
		} finally {
			this.loading = false;
		}
	}
	async refresh() {
		if (this.#refreshing || this.loading) return;
		this.#refreshing = true;
		try {
			const page = await this.#fetcher();
			void postTranslations.prepare(page.items);
			optimisticPosts.reconcile(page.items.flatMap(feedPosts));
			// スレッドキーでマージ。新リプライで代表 uri が変わっても同スレッドは in-place 更新され、
			// 二重表示されない。既存スレッドは位置固定（no-jump）、新規スレッドだけ prepend。
			// 例外は自分が今投稿したスレッドで、そこだけサーバーが返した位置へ動かす。
			const incoming = new Map(page.items.map((i) => [feedKey(i), i]));
			const seen = new Set(this.items.map(feedKey));
			const fresh = page.items.filter((i) => !seen.has(feedKey(i)));
			this.items = repositionFollowed(
				[...fresh, ...this.items.map((i) => incoming.get(feedKey(i)) ?? i)],
				page.items,
				postFollow.current?.threadRootUri,
			);
			this.#unread?.advance(page.items[0]);
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
					...(item.botReply?.uri === uri ? { botReply: undefined, botReplyState: undefined } : {}),
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
