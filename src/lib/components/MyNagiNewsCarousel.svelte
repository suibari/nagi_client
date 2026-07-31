<script lang="ts">
	import type { ActorView, NewsView } from '$lib/api/types';
	import { m } from '$lib/i18n/i18n.svelte';
	import NewsCard from './NewsCard.svelte';

	let { items, botActor }: { items: NewsView[]; botActor?: ActorView } = $props();
</script>

<div class="my-nagi-news-viewport" role="region" aria-label={m.myNagiNewsTitle()}>
	<ul class="my-nagi-news-track">
		{#each items as news (news.uri)}
			<li class="my-nagi-news-item">
				<NewsCard {news} {botActor} />
			</li>
		{/each}
	</ul>
</div>

<style>
	.my-nagi-news-viewport {
		padding: 8px 4px 10px;
		overflow-x: auto;
		overscroll-behavior-x: contain;
		scroll-padding-inline: 4px;
		scroll-snap-type: x mandatory;
		scrollbar-width: thin;
	}

	.my-nagi-news-track {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.my-nagi-news-item {
		flex: 0 0 min(340px, 88%);
		min-width: 0;
		scroll-snap-align: start;
	}
</style>
