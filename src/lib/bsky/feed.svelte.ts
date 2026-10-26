import { EntryMotion } from '$lib/feed/entry-motion.svelte';
import { bskyConversations, conversationPosts } from './conversation';
import { m } from '$lib/i18n/i18n.svelte';
import { getBskyFeed, type BskyFeedRef } from './agent';
import type { BskyFeedItemView } from './mapView';

/** Bluesky のフィード状態。カスタムフィードは提供元の順序・入れ替えをそのまま反映する。 */
export class BskyFeed {
	items = $state<BskyFeedItemView[]>([]);
	cursor = $state<string | undefined>(undefined);
	hasMore = $state(false);
	loading = $state(false);
	error = $state('');
	revision = $state(0);
	readonly entry = new EntryMotion();
	get visibleItems() {
		const threads = bskyConversations(this.items);
		if (!this.#order.length) return threads;
		const rank = new Map(this.#order.map((key, i) => [key, i]));
		return threads.sort((a, b) => (rank.get(a.key) ?? Infinity) - (rank.get(b.key) ?? Infinity));
	}
	get newItemsVersion() {
		return this.entry.version;
	}
	#order = $state<string[]>([]);
	#feed: BskyFeedRef;
	#generation = 0;
	#refreshing = false;

	constructor(feed: BskyFeedRef) {
		this.#feed = feed;
	}

	/** 先頭から取り直す。読み込み中に呼ばれたら、古い応答は捨てる。 */
	async load() {
		const generation = ++this.#generation;
		this.loading = true;
		this.error = '';
		try {
			const page = await getBskyFeed(this.#feed);
			if (generation !== this.#generation) return;
			this.#order = [];
			this.items = dedupe(page.items);
			this.cursor = page.cursor;
			this.hasMore = Boolean(page.cursor);
		} catch (error) {
			if (generation !== this.#generation) return;
			this.error = message(error);
		} finally {
			if (generation === this.#generation) this.loading = false;
		}
	}

	/** 先頭ページを更新する。バックグラウンドの失敗は次回に再試行する。 */
	async refresh() {
		if (this.loading || this.#refreshing) return;
		const generation = this.#generation;
		this.#refreshing = true;
		try {
			const page = await getBskyFeed(this.#feed);
			if (generation !== this.#generation) return;
			const previous = this.visibleItems;
			// カスタムフィードは非時系列・総入れ替えもあるため、古い結果と混ぜない。
			// カーソルも同じ取得結果のものへ更新する。
			if (this.#feed.kind === 'generator') {
				this.items = dedupe(page.items);
				this.cursor = page.cursor;
				this.hasMore = Boolean(page.cursor);
				this.#markEntering(previous);
				this.error = '';
				this.revision++;
				return;
			}
			const incoming = new Map(dedupe(page.items).map((item) => [item.key, item]));
			const seen = new Set(this.items.map((item) => item.key));
			const fresh = [...incoming.values()].filter((item) => !seen.has(item.key));
			this.items = [...fresh, ...this.items.map((item) => incoming.get(item.key) ?? item)];
			this.#markEntering(previous);
			if (!this.cursor) {
				this.cursor = page.cursor;
				this.hasMore = Boolean(page.cursor);
			}
			this.error = '';
			this.revision++;
		} catch {
			// 表示中の投稿を残し、次のポーリングで再試行する。
		} finally {
			this.#refreshing = false;
		}
	}

	#markEntering(previous: ReturnType<typeof bskyConversations>) {
		const keys = new Set(previous.map((thread) => thread.key));
		const uris = new Set(previous.flatMap(conversationPosts).map((post) => post.uri));
		const current = bskyConversations(this.items);
		if (this.#feed.kind === 'timeline') {
			const currentKeys = new Set(current.map((thread) => thread.key));
			this.#order = [
				...current.filter((thread) => !keys.has(thread.key)).map((thread) => thread.key),
				...previous.filter((thread) => currentKeys.has(thread.key)).map((thread) => thread.key),
			];
		}
		this.entry.mark(
			current.filter((thread) => !keys.has(thread.key)).map((thread) => thread.key),
			current
				.flatMap(conversationPosts)
				.map((post) => post.uri)
				.filter((uri) => !uris.has(uri)),
		);
	}

	async loadMore() {
		if (this.loading || this.#refreshing || !this.cursor) return;
		const generation = this.#generation;
		this.loading = true;
		this.error = '';
		try {
			const page = await getBskyFeed(this.#feed, this.cursor);
			if (generation !== this.#generation) return;
			this.items = dedupe([...this.items, ...page.items]);
			this.cursor = page.cursor;
			this.hasMore = Boolean(page.cursor);
		} catch (error) {
			if (generation !== this.#generation) return;
			this.error = message(error);
		} finally {
			if (generation === this.#generation) this.loading = false;
		}
	}
}

/** ページをまたいで同じ投稿が来るフィードがある。先に来た方を残す。 */
function dedupe(items: BskyFeedItemView[]): BskyFeedItemView[] {
	const seen = new Set<string>();
	return items.filter((item) => {
		if (seen.has(item.key)) return false;
		seen.add(item.key);
		return true;
	});
}

/** XRPC のエラー文は英語の内部表現なので、画面には出さずコンソールに残す。 */
function message(error: unknown) {
	console.warn('[BskyFeed] load failed', error);
	return m.bskyFeedLoadFailed();
}
