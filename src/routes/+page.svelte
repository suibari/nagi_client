<script lang="ts">
	import { onMount } from 'svelte';
	import { getTimeline } from '$lib/api/appview';
	import { Feed } from '$lib/feed/feed.svelte';
	import ThreadUnit from '$lib/components/ThreadUnit.svelte';
	import Composer from '$lib/components/Composer.svelte';
	import FeedTabs from '$lib/components/shell/FeedTabs.svelte';
	import { session, oauthReady } from '$lib/oauth/session.svelte';
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
		<p class="eyebrow">AT Protocolでつながる、やさしい場所</p>
		<h1>言葉が、静かに届く。</h1>
		<p>ここでは、どんな声もまず受け止めます。</p>
	</section>
	<aside class="welcome">
		<div>
			<strong>Nagiへようこそ</strong><span
				>タイムラインは誰でも読めます。参加すると投稿やリアクションができます。</span
			>
		</div>
		<a href="/login">参加する</a>
	</aside>
{/if}
<section class="timeline" aria-busy={feed.loading}>
	{#if feed.loading && !feed.items.length}<div class="state">波が届くのを待っています…</div>
	{:else if feed.error && !feed.items.length}<div class="state error">
			{feed.error}<button onclick={() => feed.load()}>もう一度</button>
		</div>
	{:else if !feed.items.length}<div class="state">
			まだ静かな海です。最初の言葉を待っています。
		</div>
	{:else}{#each feed.items as item (item.uri)}<ThreadUnit {item} />{/each}{#if feed.hasMore}<button
				class="more"
				onclick={() => feed.loadMore()}>さらに読む</button
			>{/if}{/if}
</section>
