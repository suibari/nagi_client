import { m } from '$lib/i18n/i18n.svelte';
import { getBskyFeed, type BskyFeedRef } from './agent';
import type { BskyFeedItemView } from './mapView';

/**
 * Bluesky のフィード1本の読み込み状態。Nagi の Feed と違い、未読ウォーターマークも
 * ポーリングも持たない — カスタムフィードは時系列とは限らず、先頭に新着が積まれる保証が無い。
 * 取り直しは利用者の操作（ナビの再押下・再読み込みボタン）だけで行う。
 */
export class BskyFeed {
	items = $state<BskyFeedItemView[]>([]);
	cursor = $state<string | undefined>(undefined);
	hasMore = $state(false);
	loading = $state(false);
	error = $state('');
	#feed: BskyFeedRef;
	#generation = 0;

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

	async loadMore() {
		if (this.loading || !this.cursor) return;
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
