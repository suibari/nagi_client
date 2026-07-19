<script lang="ts">
	import { onMount } from 'svelte';
	import { getAffirmation } from '$lib/api/appview';
	import { Feed } from '$lib/feed/feed.svelte';
	import ThreadUnit from '$lib/components/ThreadUnit.svelte';
	import FeedTabs from '$lib/components/shell/FeedTabs.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	const feed = new Feed((cursor) => getAffirmation(cursor));
	onMount(() => {
		feed.load();
		const timer = setInterval(() => {
			if (document.visibilityState === 'visible') feed.refresh();
		}, 30_000);
		return () => clearInterval(timer);
	});
</script>

<FeedTabs />
<section class="timeline" aria-busy={feed.loading}>
	{#if feed.loading && !feed.items.length}<div class="state">{m.feedWaiting()}</div>
	{:else if feed.error && !feed.items.length}<div class="state error">
			{feed.error}<button onclick={() => feed.load()}>{m.retry()}</button>
		</div>
	{:else if !feed.items.length}<div class="state">
			{m.affirmationEmpty()}
		</div>
	{:else}{#each feed.items as item (item.uri)}<ThreadUnit {item} />{/each}{#if feed.hasMore}<button
				class="more"
				onclick={() => feed.loadMore()}>{m.loadMore()}</button
			>{/if}{/if}
</section>
