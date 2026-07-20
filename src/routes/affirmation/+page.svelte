<script lang="ts">
	import { onMount } from 'svelte';
	import { getAffirmation } from '$lib/api/appview';
	import { Feed } from '$lib/feed/feed.svelte';
	import ThreadUnit from '$lib/components/ThreadUnit.svelte';
	import FeedTabs from '$lib/components/shell/FeedTabs.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	const feed = new Feed(
		(cursor) => getAffirmation(cursor),
		(item) => item.isAffirmation,
	);
	onMount(() => {
		feed.load();
		const timer = setInterval(() => {
			if (document.visibilityState === 'visible') feed.refresh();
		}, 30_000);
		const fast = setInterval(() => {
			if (document.visibilityState === 'visible' && feed.hasOptimistic()) feed.refresh();
		}, 3_000);
		return () => {
			clearInterval(timer);
			clearInterval(fast);
		};
	});
</script>

<FeedTabs />
<section class="timeline" aria-busy={feed.loading}>
	{#if feed.loading && !feed.visibleItems.length}<div class="state">{m.feedWaiting()}</div>
	{:else if feed.error && !feed.visibleItems.length}<div class="state error">
			{feed.error}<button onclick={() => feed.load()}>{m.retry()}</button>
		</div>
	{:else if !feed.visibleItems.length}<div class="state">
			{m.affirmationEmpty()}
		</div>
	{:else}{#each feed.visibleItems as item (item.uri)}<ThreadUnit
				{item}
				botActor={feed.botActor}
				ondeleted={(uri) => feed.removePost(uri)}
				onposted={() => feed.refresh()}
			/>{/each}{#if feed.hasMore}<button class="more" onclick={() => feed.loadMore()}
				>{m.loadMore()}</button
			>{/if}{/if}
</section>
