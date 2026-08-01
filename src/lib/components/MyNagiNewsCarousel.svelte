<script lang="ts">
	import type { ActorView, NewsView } from '$lib/api/types';
	import { m } from '$lib/i18n/i18n.svelte';
	import { onMount, tick } from 'svelte';
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

	let viewport = $state<HTMLDivElement>();
	let scrollState = $state<ScrollState>({ canPrevious: false, canNext: false });

	function updateScrollState() {
		if (!viewport) return;
		const next = {
			canPrevious: viewport.scrollLeft > 2,
			canNext: viewport.scrollLeft + viewport.clientWidth < viewport.scrollWidth - 2,
		};
		if (next.canPrevious === scrollState.canPrevious && next.canNext === scrollState.canNext)
			return;
		scrollState = next;
		onscrollstatechange?.(next);
	}

	function scrollByCard(direction: 1 | -1) {
		if (!viewport) return;
		const card = viewport.querySelector<HTMLElement>('.my-nagi-news-item');
		const step = card ? card.offsetWidth + 12 : viewport.clientWidth * 0.88;
		viewport.scrollBy({ left: step * direction, behavior: 'smooth' });
	}

	export function scrollPrevious() {
		scrollByCard(-1);
	}

	export function scrollNext() {
		scrollByCard(1);
	}

	onMount(() => {
		if (!viewport) return;
		const observer = new ResizeObserver(updateScrollState);
		observer.observe(viewport);
		updateScrollState();
		return () => observer.disconnect();
	});

	$effect(() => {
		items.length;
		void tick().then(updateScrollState);
	});
</script>

<div
	class="my-nagi-news-viewport"
	role="region"
	aria-label={m.myNagiNewsTitle()}
	bind:this={viewport}
	onscroll={updateScrollState}
>
	<ul class="my-nagi-news-track">
		{#each items as news (news.uri)}
			<li class="my-nagi-news-item">
				<NewsCard {news} {botActor} embedded />
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
		scrollbar-width: none;
	}

	.my-nagi-news-viewport::-webkit-scrollbar {
		display: none;
	}

	.my-nagi-news-track {
		display: flex;
		align-items: stretch;
		gap: 12px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.my-nagi-news-item {
		flex: 0 0 min(340px, 88%);
		display: flex;
		min-width: 0;
		scroll-snap-align: start;
	}
</style>
