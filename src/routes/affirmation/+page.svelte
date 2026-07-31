<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { getAffirmation } from '$lib/api/appview';
	import { Feed } from '$lib/feed/feed.svelte';
	import { affirmationFeedRead } from '$lib/feed/unread.svelte';
	import { startVisiblePolling } from '$lib/polling';
	import ThreadUnit from '$lib/components/ThreadUnit.svelte';
	import InfiniteScroll from '$lib/components/InfiniteScroll.svelte';
	import { postedSignal } from '$lib/feed/posted-signal.svelte';
	import FeedTabs from '$lib/components/shell/FeedTabs.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';
	import { session, oauthReady } from '$lib/oauth/session.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	const feed = new Feed(
		(cursor) => getAffirmation(cursor),
		(item) => item.isAffirmation && !item.threadKossori,
		affirmationFeedRead,
	);
	let lastDid = $state<string | undefined>(undefined);
	onMount(() => {
		const timer = startVisiblePolling(() => feed.refresh(), 30_000, { onReturn: true });
		const fast = startVisiblePolling(() => feed.refresh(), 3_000, {
			when: () => feed.hasOptimistic(),
		});
		return () => {
			timer();
			fast();
		};
	});
	// OAuth 復元完了を待ってから読み込む。待たずに load すると、リロード時に session が
	// まだ null で本人向けフィードにならない。session（did）が変わったら再ロードする。
	$effect(() => {
		if ($oauthReady) {
			const did = $session?.did;
			if (did !== lastDid) {
				lastDid = did;
				feed.load();
			}
		}
	});
	// ポストモーダルからの投稿を拾う。
	let seenPosted = untrack(() => postedSignal.count);
	$effect(() => {
		if (postedSignal.count === seenPosted) return;
		seenPosted = postedSignal.count;
		void feed.refresh();
	});
</script>

<FeedTabs />
<section class="timeline" aria-busy={feed.loading}>
	{#if feed.loading && !feed.visibleItems.length}<div
			class="timeline-loading"
			role="status"
			aria-label={m.feedWaiting()}
		>
			<span class="spinner" aria-hidden="true"></span>
		</div>
	{:else if feed.error && !feed.visibleItems.length}<div class="state error">
			{feed.error}<button
				class="icon-action"
				type="button"
				aria-label={m.retry()}
				title={m.retry()}
				onclick={() => feed.load()}><Icon name="refresh" size={18} /></button
			>
		</div>
	{:else if !feed.visibleItems.length}<div class="state">
			{m.affirmationEmpty()}
		</div>
	{:else}{#each feed.visibleItems as item (item.uri)}<ThreadUnit
				{item}
				unread={feed.isUnread(item, $session?.did)}
				botActor={feed.botActor}
				ondeleted={(uri) => feed.removePost(uri)}
				onposted={() => feed.refresh()}
			/>{/each}<InfiniteScroll
			hasMore={feed.hasMore}
			loading={feed.loading}
			error={feed.error}
			onload={() => feed.loadMore()}
		/>{/if}
</section>
