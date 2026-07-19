import type { FeedItem, Page } from '$lib/api/types';

const message = (e: unknown, fallback: string) => (e instanceof Error ? e.message : fallback);

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
	#fetcher: (cursor?: string) => Promise<Page<FeedItem>>;
	#refreshing = false;
	#loadRequest = 0;
	constructor(fetcher: (cursor?: string) => Promise<Page<FeedItem>>) {
		this.#fetcher = fetcher;
	}
	async load() {
		const request = ++this.#loadRequest;
		this.loading = true;
		try {
			const page = await this.#fetcher();
			if (request !== this.#loadRequest) return;
			this.items = page.items;
			this.cursor = page.cursor;
			this.hasMore = page.hasMore;
			this.error = '';
		} catch (e) {
			if (request !== this.#loadRequest) return;
			this.error = message(e, '読み込めませんでした');
		} finally {
			if (request === this.#loadRequest) this.loading = false;
		}
	}
	async loadMore() {
		if (!this.cursor || this.loading) return;
		try {
			const page = await this.#fetcher(this.cursor);
			const unseen = page.items.filter((p) => !this.items.some((x) => x.uri === p.uri));
			this.items = [...this.items, ...unseen];
			this.cursor = page.cursor;
			this.hasMore = page.hasMore;
		} catch (e) {
			this.error = message(e, '読み込めませんでした');
		}
	}
	async refresh() {
		if (this.#refreshing || this.loading) return;
		this.#refreshing = true;
		try {
			const page = await this.#fetcher();
			const incoming = new Map(page.items.map((i) => [i.uri, i]));
			const fresh = page.items.filter((i) => !this.items.some((x) => x.uri === i.uri));
			this.items = [...fresh, ...this.items.map((i) => incoming.get(i.uri) ?? i)];
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
	/** true while one of `did`'s recent posts is still waiting for botたん */
	hasPendingFor(did?: string, windowMs = 180_000) {
		if (!did) return false;
		const now = Date.now();
		return this.items.some(
			(i) =>
				i.author.did === did &&
				i.botReplyState === 'pending' &&
				now - new Date(i.createdAt).valueOf() < windowMs,
		);
	}
}
