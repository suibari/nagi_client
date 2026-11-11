<script lang="ts">
	import type { AdventCardView } from '$lib/api/types';
	import {
		ADVENT_DAYS,
		TREE_BASE_Y,
		TREE_TOP_Y,
		adventSlots,
		garlandPath,
		treeHalfWidth,
	} from '$lib/advent/advent';
	import { m } from '$lib/i18n/i18n.svelte';

	/**
	 * 大きなクリスマスツリー。下から 1 日、てっぺんの星が 25 日。
	 * 開いた日の飾りには選ばれた人のアバターが入り、押すとカードが開く。
	 */
	let {
		cards,
		openedDay,
		viewerDid,
		onselect,
	}: {
		cards: AdventCardView[];
		openedDay: number;
		viewerDid?: string;
		onselect: (day: number) => void;
	} = $props();

	const slots = adventSlots();
	const garland = garlandPath(slots);
	const byDay = $derived(new Map(cards.map((card) => [card.day, card])));

	/** 枝の層。上から重ねて、裾の広いもみの木にする。 */
	const LAYERS = [
		{ top: TREE_TOP_Y, bottom: 34 },
		{ top: 20, bottom: 52 },
		{ top: 34, bottom: 72 },
		{ top: 50, bottom: TREE_BASE_Y },
	];
	const layerPath = (top: number, bottom: number) => {
		const half = treeHalfWidth(bottom) + 3;
		// 裾を少し波打たせて、ただの三角にしない。
		return `M 50 ${top} L ${50 + half} ${bottom} Q 50 ${bottom + 3.5} ${50 - half} ${bottom} Z`;
	};

	const label = (day: number, card?: AdventCardView) =>
		card
			? m.adventOrnamentAria({ day, name: card.actor.displayName || card.actor.handle })
			: day <= openedDay
				? m.adventOrnamentPreparingAria({ day })
				: m.adventOrnamentLockedAria({ day });
</script>

<div class="tree-box">
	<svg class="tree" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
		<rect class="trunk" x="45" y={TREE_BASE_Y - 1} width="10" height="7" rx="0.8" />
		{#each LAYERS as layer, index}
			<path class={`layer layer-${index}`} d={layerPath(layer.top, layer.bottom)} />
		{/each}
		<path class="garland" d={garland} vector-effect="non-scaling-stroke" />
	</svg>
	{#each slots as slot (slot.day)}
		{@const card = byDay.get(slot.day)}
		{@const star = slot.day === ADVENT_DAYS}
		{@const open = Boolean(card)}
		<button
			type="button"
			class="ornament"
			class:star
			class:open
			class:mine={card && card.actor.did === viewerDid}
			class:latest={open && slot.day === openedDay}
			style:left={`${slot.x}%`}
			style:top={`${slot.y}%`}
			disabled={!open}
			aria-label={label(slot.day, card)}
			onclick={() => onselect(slot.day)}
		>
			{#if star}
				<svg class="star-shape" viewBox="0 0 100 100" aria-hidden="true">
					<path
						d="M50 4 L61.8 36.2 L96 37.6 L69 58.8 L78.4 92 L50 72.6 L21.6 92 L31 58.8 L4 37.6 L38.2 36.2 Z"
					/>
				</svg>
			{/if}
			<span class="ball">
				{#if card?.actor.avatar}
					<img src={card.actor.avatar} alt="" loading="lazy" />
				{:else if card}
					<span class="initial">{(card.actor.displayName || card.actor.handle).slice(0, 1)}</span>
				{:else}
					<span class="number">{slot.day}</span>
				{/if}
			</span>
			{#if open}<span class="tag">{slot.day}</span>{/if}
		</button>
	{/each}
</div>

<style>
	.tree-box {
		container-type: inline-size;
		position: relative;
		width: 100%;
		aspect-ratio: 4 / 5;
	}
	.tree {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		overflow: visible;
	}
	.trunk {
		fill: var(--advent-red-dark);
	}
	.layer {
		fill: var(--advent-pine);
	}
	.layer-0,
	.layer-2 {
		fill: var(--advent-pine-light);
	}
	.layer-1,
	.layer-3 {
		fill: var(--advent-pine);
	}
	.garland {
		fill: none;
		stroke: var(--advent-light);
		stroke-width: 1.5;
		stroke-dasharray: 1 5;
		stroke-linecap: round;
		opacity: 0.85;
	}

	.ornament {
		position: absolute;
		width: 11cqw;
		height: 11cqw;
		padding: 0;
		border: 0;
		background: none;
		transform: translate(-50%, -50%);
		cursor: pointer;
		color: var(--advent-cream);
	}
	.ornament:disabled {
		cursor: default;
	}
	.ornament:focus-visible {
		outline: 0.6cqw solid var(--advent-light);
		outline-offset: 0.6cqw;
		border-radius: 50%;
	}
	.ball {
		position: relative;
		z-index: 1;
		display: grid;
		place-items: center;
		width: 100%;
		height: 100%;
		overflow: hidden;
		border-radius: 50%;
		background: var(--advent-pine-dark);
		box-shadow: inset 0 0 0 0.45cqw var(--advent-gold);
		opacity: 0.55;
		transition: transform 160ms ease;
	}
	.open .ball {
		opacity: 1;
		background: var(--advent-red);
		box-shadow:
			inset 0 0 0 0.6cqw var(--advent-gold),
			0 0.8cqw 1.6cqw var(--advent-shadow);
	}
	.open:hover .ball {
		transform: scale(1.08);
	}
	.latest .ball {
		box-shadow:
			inset 0 0 0 0.6cqw var(--advent-gold),
			0 0 0 0.8cqw var(--advent-light),
			0 0.8cqw 1.6cqw var(--advent-shadow);
	}
	.mine .ball {
		box-shadow:
			inset 0 0 0 0.6cqw var(--advent-light),
			0 0 0 0.8cqw var(--advent-red),
			0 0.8cqw 1.6cqw var(--advent-shadow);
	}
	.ball img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.number,
	.initial {
		font-size: 4cqw;
		font-weight: 700;
		color: var(--advent-gold-soft);
	}
	.tag {
		position: absolute;
		z-index: 2;
		right: -1.2cqw;
		bottom: -1cqw;
		min-width: 4.6cqw;
		padding: 0.3cqw 0.8cqw;
		border-radius: 1.2cqw;
		background: var(--advent-gold);
		color: var(--advent-night-deep);
		font-size: 2.6cqw;
		font-weight: 700;
		line-height: 1.2;
	}

	.star {
		width: 20cqw;
		height: 20cqw;
	}
	.star-shape {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		fill: var(--advent-gold);
		opacity: 0.6;
		filter: drop-shadow(0 0 2cqw var(--advent-glow));
	}
	.star.open .star-shape {
		opacity: 1;
	}
	.star .ball {
		position: absolute;
		left: 50%;
		top: 54%;
		width: 9cqw;
		height: 9cqw;
		transform: translate(-50%, -50%);
	}
	.star.open:hover .ball {
		transform: translate(-50%, -50%) scale(1.08);
	}
	.star .ball,
	.star.open .ball {
		background: var(--advent-red-dark);
	}
	.star:not(.open) .ball {
		background: transparent;
		box-shadow: none;
		opacity: 1;
	}
	.star:not(.open) .number {
		color: var(--advent-night-deep);
	}
	.star .tag {
		right: 3cqw;
		bottom: 2cqw;
	}

	@media (prefers-reduced-motion: reduce) {
		.ball {
			transition: none;
		}
	}
</style>
