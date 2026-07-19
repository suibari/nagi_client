<script lang="ts">
	import { onMount } from 'svelte';
	import { getTimeline } from '$lib/api/appview';
	import { Feed } from '$lib/feed/feed.svelte';
	import ThreadUnit from '$lib/components/ThreadUnit.svelte';
	import Composer from '$lib/components/Composer.svelte';
	import FeedTabs from '$lib/components/shell/FeedTabs.svelte';
	import { session, oauthReady } from '$lib/oauth/session.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	const feed = new Feed((cursor) => getTimeline(cursor));
	let lastDid = $state<string | undefined>(undefined);
	onMount(() => {
		feed.load();
		// base refresh + fast poll while own recent posts wait for botたん's reply
		const base = setInterval(() => {
			if (document.visibilityState === 'visible') feed.refresh();
		}, 30_000);
		const fast = setInterval(() => {
			if (document.visibilityState === 'visible' && feed.hasPendingFor($session?.did))
				feed.refresh();
		}, 3_000);
		return () => {
			clearInterval(base);
			clearInterval(fast);
		};
	});
	$effect(() => {
		if ($oauthReady) {
			const did = $session?.did;
			if (did !== lastDid) {
				lastDid = did;
				feed.load();
			}
		}
	});
</script>

<FeedTabs />
{#if $session}
	<Composer onposted={() => feed.refresh()} />
{:else}
	<section class="hero">
		<p class="eyebrow">{m.heroEyebrow()}</p>
		<h1>{m.heroTitle()}</h1>
		<p>{m.heroBody()}</p>
	</section>
	<aside class="welcome">
		<div>
			<strong>{m.welcomeTitle()}</strong><span>{m.welcomeBody()}</span>
		</div>
		<a href="/login">{m.joinCta()}</a>
	</aside>
{/if}
<section class="timeline" aria-busy={feed.loading}>
	{#if feed.loading && !feed.items.length}<div class="state">{m.feedWaiting()}</div>
	{:else if feed.error && !feed.items.length}<div class="state error">
			{feed.error}<button onclick={() => feed.load()}>{m.retry()}</button>
		</div>
	{:else if !feed.items.length}<div class="state">
			{m.feedEmpty()}
		</div>
	{:else}{#each feed.items as item (item.uri)}<ThreadUnit {item} />{/each}{#if feed.hasMore}<button
				class="more"
				onclick={() => feed.loadMore()}>{m.loadMore()}</button
			>{/if}{/if}
</section>
