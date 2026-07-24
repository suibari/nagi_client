<script lang="ts">
	import { onMount } from 'svelte';
	import { getTimeline } from '$lib/api/appview';
	import { Feed } from '$lib/feed/feed.svelte';
	import ThreadUnit from '$lib/components/ThreadUnit.svelte';
	import Composer from '$lib/components/Composer.svelte';
	import FeedTabs from '$lib/components/shell/FeedTabs.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';
	import { session, oauthReady } from '$lib/oauth/session.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	// こっそりポストは共有TLに載せない。楽観表示でも一瞬たりとも出さない。
	const feed = new Feed(
		(cursor) => getTimeline(cursor),
		(item) => !item.threadKossori,
	);
	let lastDid = $state<string | undefined>(undefined);
	onMount(() => {
		feed.load();
		// base refresh + fast poll while own recent posts wait for botたん's reply
		const base = setInterval(() => {
			if (document.visibilityState === 'visible') feed.refresh();
		}, 30_000);
		const fast = setInterval(() => {
			if (
				document.visibilityState === 'visible' &&
				(feed.hasOptimistic() || feed.hasPendingFor($session?.did))
			)
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
{:else if $oauthReady}
	<section class="hero">
		<p class="eyebrow">{m.heroEyebrow()}</p>
		<h1>{m.heroTitle()}</h1>
		<p>{m.heroBody()}</p>
	</section>
	<aside class="welcome">
		<div>
			<strong>{m.welcomeTitle()}</strong><span>{m.welcomeBody()}</span>
			<a class="welcome-about" href="/settings/about">{m.welcomeAboutLink()} →</a>
		</div>
		<a href="/login">{m.joinCta()}</a>
	</aside>
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
			{m.feedEmpty()}
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
