import { BskyFeed } from '$lib/bsky/feed.svelte';
import type { BskyFeedRef } from '$lib/bsky/agent';
import type { FeedTabSpec } from '$lib/feed-tabs/resolve';
import { FeedCache } from './cache';
import { Feed } from './feed.svelte';

/**
 * タブごとのフィード状態。FeedShell / BskyFeedShell と、スワイプ中に隣のタブを
 * 覗かせる FeedPeek が同じものを見る。生成は読み込みを伴うので get 系は副作用あり。
 */
export const nagiFeeds = new FeedCache<Feed>();
export const bskyFeeds = new FeedCache<BskyFeed>();

export function nagiFeedFor(spec: FeedTabSpec) {
	return nagiFeeds.get(spec.key, () => {
		const feed = new Feed(spec.fetcher, spec.optimisticFilter, spec.watermark);
		void feed.load();
		return feed;
	});
}

export function bskyFeedFor(key: string, ref: BskyFeedRef) {
	return bskyFeeds.get(key, () => {
		const feed = new BskyFeed(ref);
		void feed.load();
		return feed;
	});
}
