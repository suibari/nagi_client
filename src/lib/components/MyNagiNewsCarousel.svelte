<script lang="ts">
	import type { ActorView, NewsView } from '$lib/api/types';
	import { m } from '$lib/i18n/i18n.svelte';
	import HorizontalCarousel from './HorizontalCarousel.svelte';
	import NewsCard from './NewsCard.svelte';

	type ScrollState = { canPrevious: boolean; canNext: boolean };

	let {
		items,
		botActor,
		onscrollstatechange,
	}: {
		items: NewsView[];
		botActor?: ActorView;
		onscrollstatechange?: (nextState: ScrollState) => void;
	} = $props();

	let carousel = $state<{ scrollPrevious: () => void; scrollNext: () => void }>();

	export function scrollPrevious() {
		carousel?.scrollPrevious();
	}

	export function scrollNext() {
		carousel?.scrollNext();
	}
</script>

<HorizontalCarousel bind:this={carousel} ariaLabel={m.myNagiNewsTitle()} {onscrollstatechange}>
	<ul class="horizontal-carousel-track">
		{#each items as news (news.uri)}
			<li class="horizontal-carousel-item my-nagi-news-item">
				<NewsCard {news} {botActor} embedded />
			</li>
		{/each}
	</ul>
</HorizontalCarousel>

<style>
	.my-nagi-news-item {
		display: flex;
	}
</style>
