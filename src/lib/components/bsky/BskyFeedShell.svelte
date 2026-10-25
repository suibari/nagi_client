<script module lang="ts">
	import { BskyFeed } from '$lib/bsky/feed.svelte';
	import type { BskyFeedRef } from '$lib/bsky/agent';

	/**
	 * key（DID + フィードの uri / following）ごとに1つ。タブを行き来しても読み込み位置が残るように
	 * コンポーネントの外に置く（FeedShell と同じ考え方の LRU）。
	 */
	const MAX_CACHED = 8;
	const cache = new Map<string, BskyFeed>();

	function feedFor(key: string, ref: BskyFeedRef): BskyFeed {
		const existing = cache.get(key);
		if (existing) {
			cache.delete(key);
			cache.set(key, existing);
			return existing;
		}
		const created = new BskyFeed(ref);
		cache.set(key, created);
		if (cache.size > MAX_CACHED) cache.delete(cache.keys().next().value!);
		void created.load();
		return created;
	}
</script>

<script lang="ts">
	import type { ModerationOpts } from '@atproto/api';
	import { untrack } from 'svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import InfiniteScroll from '$lib/components/InfiniteScroll.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';
	import { getModerationOpts } from '$lib/bsky/agent';
	import { bskyFeedUrl } from '$lib/bsky/links';
	import { markCrosspostPending } from '$lib/crosspost/preferences';
	import { m } from '$lib/i18n/i18n.svelte';
	import { grantedOptIns, hasBlueskyViewScope } from '$lib/optin/scope-optin';
	import { session, signIn } from '$lib/oauth/session.svelte';
	import BskyPostCard from './BskyPostCard.svelte';

	/**
	 * Bluesky のフィードタブの中身。権限が無ければ Bluesky 連携の再認可へ案内する
	 * （クロスポストと同じオプトインで、スイッチは増やさない）。
	 * preview は設定画面のプレビュー用で、先頭の数件だけを出して続きを読まない。
	 */
	let {
		feed: feedRef,
		cacheKey,
		preview,
	}: { feed: BskyFeedRef; cacheKey: string; preview?: number } = $props();

	let granted = $state<boolean>();
	let moderation = $state<ModerationOpts>();
	let moderationFailed = $state(false);
	let feed = $state<BskyFeed>();
	let reauthorizing = $state(false);
	/** 再試行ボタンで増やし、下の effect をやり直させる。 */
	let attempt = $state(0);

	$effect(() => {
		void attempt;
		const did = $session?.did;
		const key = cacheKey;
		// 指し先は cacheKey に含まれている。feedRef は描画のたびに作り直される
		// オブジェクトなので、依存に入れると同じタブでも読み込み直してしまう。
		const ref = untrack(() => feedRef);
		granted = undefined;
		feed = undefined;
		if (!did) return;
		let cancelled = false;
		void (async () => {
			const ok = await hasBlueskyViewScope();
			if (cancelled) return;
			granted = ok;
			if (!ok) return;
			try {
				moderation = await getModerationOpts();
				moderationFailed = false;
			} catch (error) {
				console.warn('[BskyFeedShell] moderation preferences failed', error);
				// 本人のモデレーション設定が読めないまま出すと、隠すべき投稿が出てしまう。
				moderationFailed = true;
				return;
			}
			if (cancelled) return;
			feed = feedFor(key, ref);
		})();
		return () => {
			cancelled = true;
		};
	});

	const items = $derived(feed ? (preview ? feed.items.slice(0, preview) : feed.items) : []);

	async function reauthorize() {
		if (!$session || reauthorizing) return;
		reauthorizing = true;
		markCrosspostPending();
		try {
			await signIn($session.did, { ...(await grantedOptIns()), crosspost: true });
		} finally {
			reauthorizing = false;
		}
	}

	/** ナビの再押下（pageRefresh）から呼ぶ。 */
	export function refresh() {
		return feed?.load();
	}
	/** アカウントが変わったらキャッシュごと捨てる。 */
	export function reset() {
		cache.clear();
	}
</script>

<section class="timeline" aria-busy={!feed || feed.loading}>
	{#if !$session}
		<div class="state">{m.bskyFeedSignInRequired()}</div>
	{:else if granted === false}
		<div class="state bsky-permission">
			<p>{m.bskyFeedNeedsPermission()}</p>
			<button type="button" disabled={reauthorizing} onclick={reauthorize}
				>{#if reauthorizing}<Spinner inline size="sm" decorative />{/if}{reauthorizing
					? m.crosspostReauthPending()
					: m.crosspostReauthSubmit()}</button
			>
		</div>
	{:else if moderationFailed}
		<div class="state error">
			{m.bskyFeedLoadFailed()}<button
				class="icon-action"
				type="button"
				aria-label={m.retry()}
				title={m.retry()}
				onclick={() => {
					moderationFailed = false;
					attempt++;
				}}><Icon name="refresh" size={18} /></button
			>
		</div>
	{:else if !feed || !moderation || (feed.loading && !feed.items.length)}
		<Spinner label={m.feedWaiting()} />
	{:else if feed.error && !feed.items.length}
		<div class="state error">
			{feed.error}<button
				class="icon-action"
				type="button"
				aria-label={m.retry()}
				title={m.retry()}
				onclick={() => feed?.load()}><Icon name="refresh" size={18} /></button
			>
		</div>
	{:else if !items.length}
		<div class="state">{m.bskyFeedEmpty()}</div>
	{:else}
		{#each items as item (item.key)}
			<BskyPostCard {item} {moderation} />
		{/each}
		{#if !preview}
			<InfiniteScroll
				hasMore={feed.hasMore}
				loading={feed.loading}
				error={feed.error}
				onload={() => feed?.loadMore()}
			/>
			{@const feedUrl =
				feedRef.kind === 'timeline' ? 'https://bsky.app/' : bskyFeedUrl(feedRef.uri)}
			{#if feedUrl}
				<a class="bsky-feed-open" href={feedUrl} target="_blank" rel="noopener noreferrer"
					><Icon name="bluesky" size={14} />{m.bskyOpenFeedInBluesky()}</a
				>
			{/if}
		{/if}
	{/if}
</section>

<style>
	.bsky-permission {
		display: grid;
		gap: 0.75rem;
		justify-items: center;
		text-align: center;
	}
	.bsky-permission p {
		margin: 0;
	}
	.bsky-feed-open {
		display: inline-flex;
		align-items: center;
		justify-self: center;
		gap: 4px;
		padding: 8px;
		color: var(--text-mute);
		font-size: 12px;
	}
</style>
