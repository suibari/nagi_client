<script lang="ts">
	import type { ModerationOpts } from '@atproto/api';
	import { untrack } from 'svelte';
	import { getBskyThread, getModerationOpts } from '$lib/bsky/agent';
	import type { BskyFeed } from '$lib/bsky/feed.svelte';
	import type { Feed } from '$lib/feed/feed.svelte';
	import { bskyFeedFor, nagiFeedFor } from '$lib/feed/feed-caches';
	import { feedTabLabel, resolveFeedTab } from '$lib/feed-tabs/resolve';
	import type { FeedTab } from '$lib/feed-tabs/types';
	import { m } from '$lib/i18n/i18n.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import { hasBlueskyViewScope } from '$lib/optin/scope-optin';
	import Spinner from './Spinner.svelte';
	import ThreadUnit from './ThreadUnit.svelte';
	import BskyThreadUnit from './bsky/BskyThreadUnit.svelte';

	/**
	 * スワイプ中に隣から入ってくるタブの中身。キャッシュ済みなら先頭の数件をそのまま描き、
	 * 未取得ならこの時点で読み込みを始める（指を離す頃には出ていることが多い）。
	 * 見せるだけなので操作は受けない（呼び出し側で inert）。
	 */
	let { tab, limit = 6 }: { tab: FeedTab; limit?: number } = $props();

	// 未ログインのホームはサインインへ送るので、中身は覗かせない。
	const toLogin = $derived(tab.kind === 'list' && !$session);
	const spec = $derived(resolveFeedTab(tab, { did: $session?.did }));
	// 生成は読み込みを伴う副作用なので $derived には置かない（FeedShell と同じ）。
	let nagi = $state<Feed>();
	$effect(() => {
		const target = toLogin || spec.bsky ? undefined : spec;
		nagi = target && untrack(() => nagiFeedFor(target));
	});

	let bsky = $state<{ feed: BskyFeed; moderation: ModerationOpts }>();
	$effect(() => {
		const target = spec.bsky;
		const key = spec.key;
		bsky = undefined;
		if (!target || !$session) return;
		let cancelled = false;
		void (async () => {
			try {
				if (!(await hasBlueskyViewScope())) return;
				const moderation = await getModerationOpts();
				if (cancelled) return;
				bsky = { feed: untrack(() => bskyFeedFor(key, target.feed)), moderation };
			} catch {
				// 覗き見なので失敗は黙って待機表示のまま。切り替えた先で本体がエラーを出す。
			}
		})();
		return () => {
			cancelled = true;
		};
	});

	const nagiItems = $derived(nagi?.visibleItems.slice(0, limit) ?? []);
	const bskyItems = $derived(bsky?.feed.visibleItems.slice(0, limit) ?? []);
</script>

<section class="timeline feed-peek" aria-label={feedTabLabel(tab)}>
	{#if toLogin}
		<div class="state">{feedTabLabel(tab)}</div>
	{:else if nagi}
		{#if nagiItems.length}
			{#each nagiItems as item (item.conversation?.threadRootUri ?? item.uri)}
				<ThreadUnit {item} botActor={nagi.botActor} />
			{/each}
		{:else if nagi.loading}
			<Spinner label={m.feedWaiting()} />
		{:else if nagi.error}
			<div class="state error">{nagi.error}</div>
		{:else}
			<div class="state">{spec.empty()}</div>
		{/if}
	{:else if bsky && bskyItems.length}
		{#each bskyItems as thread (thread.key)}
			<BskyThreadUnit
				{thread}
				moderation={bsky.moderation}
				loadThread={getBskyThread}
				revision={bsky.feed.revision}
			/>
		{/each}
	{:else if bsky && !bsky.feed.loading}
		<div class="state">{m.bskyFeedEmpty()}</div>
	{:else}
		<Spinner label={m.feedWaiting()} />
	{/if}
</section>
