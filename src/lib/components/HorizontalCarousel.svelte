<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';

	type ScrollState = { canPrevious: boolean; canNext: boolean };

	let {
		ariaLabel,
		onscrollstatechange,
		children,
	}: {
		ariaLabel: string;
		onscrollstatechange?: (state: ScrollState) => void;
		children: Snippet;
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
		const card = viewport.querySelector<HTMLElement>('.horizontal-carousel-item');
		const track = viewport.querySelector<HTMLElement>('.horizontal-carousel-track');
		const gap = track ? Number.parseFloat(getComputedStyle(track).columnGap) || 0 : 0;
		const step = card ? card.offsetWidth + gap : viewport.clientWidth * 0.88;
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		viewport.scrollBy({ left: step * direction, behavior: reduceMotion ? 'auto' : 'smooth' });
	}

	export function scrollPrevious() {
		scrollByCard(-1);
	}

	export function scrollNext() {
		scrollByCard(1);
	}

	onMount(() => {
		if (!viewport) return;
		const resizeObserver = new ResizeObserver(updateScrollState);
		const mutationObserver = new MutationObserver(() => requestAnimationFrame(updateScrollState));
		resizeObserver.observe(viewport);
		mutationObserver.observe(viewport, { childList: true, subtree: true });
		updateScrollState();
		return () => {
			resizeObserver.disconnect();
			mutationObserver.disconnect();
		};
	});
</script>

<div
	class="horizontal-carousel"
	class:has-next={scrollState.canNext}
	role="region"
	aria-label={ariaLabel}
	bind:this={viewport}
	onscroll={updateScrollState}
>
	{@render children()}
</div>

<style>
	.horizontal-carousel {
		padding: 12px 24px 12px 0;
		overflow-x: auto;
		overscroll-behavior-x: contain;
		scroll-padding-inline: 0;
		scroll-snap-type: x mandatory;
		scrollbar-width: none;
	}

	/* 右へ続きがある間だけ次のカードの存在を示し、終端では内容を明瞭に見せる。 */
	.horizontal-carousel.has-next {
		-webkit-mask-image: linear-gradient(to right, #000 calc(100% - 56px), transparent);
		mask-image: linear-gradient(to right, #000 calc(100% - 56px), transparent);
	}

	.horizontal-carousel::-webkit-scrollbar {
		display: none;
	}

	.horizontal-carousel :global(.horizontal-carousel-track) {
		display: flex;
		align-items: stretch;
		gap: 16px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.horizontal-carousel :global(.horizontal-carousel-item) {
		flex: 0 0 min(320px, 88%);
		min-width: 0;
		scroll-snap-align: start;
	}
</style>
