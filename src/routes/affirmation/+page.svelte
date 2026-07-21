<script lang="ts">
	import { onMount } from 'svelte';
	import { getAffirmation } from '$lib/api/appview';
	import { Feed } from '$lib/feed/feed.svelte';
	import ThreadUnit from '$lib/components/ThreadUnit.svelte';
	import Composer from '$lib/components/Composer.svelte';
	import FeedTabs from '$lib/components/shell/FeedTabs.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';
	import { session } from '$lib/oauth/session.svelte';
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
{#if $session}
	<Composer onposted={() => feed.refresh()} />
{/if}
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
				botActor={feed.botActor}
				ondeleted={(uri) => feed.removePost(uri)}
				onposted={() => feed.refresh()}
			/>{/each}{#if feed.hasMore}<button
				class="more icon-action"
				type="button"
				aria-label={m.loadMore()}
				title={m.loadMore()}
				onclick={() => feed.loadMore()}><Icon name="more" size={20} /></button
			>{/if}{/if}
</section>
