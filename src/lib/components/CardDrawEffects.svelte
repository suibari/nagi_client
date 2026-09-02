<script lang="ts">
	import type { CardRarity } from '$lib/api/types';
	import { cardRevealEffect } from '$lib/cards/celebration';

	let {
		rarity,
		revealed,
		active = true,
	}: { rarity: CardRarity; revealed: boolean; active?: boolean } = $props();

	const effect = $derived(cardRevealEffect(rarity));
	const stageWindow = $derived(effect.stages.length * effect.stageMs);
	const blackoutDuration = $derived(effect.chargeMs - stageWindow);
</script>

{#if active}
	{#if effect.blackout}
		<div
			class="draw-blackout"
			class:revealed
			style={`--blackout-delay: ${stageWindow}ms; --blackout-duration: ${blackoutDuration}ms`}
			aria-hidden="true"
		>
			<div class="crt-plus"><i></i><i></i></div>
		</div>
	{/if}
	<div
		class="draw-fx rarity-{rarity.toLowerCase()}"
		class:charging={!revealed}
		class:revealed
		aria-hidden="true"
	>
		{#if revealed}
			<div class="focus-lines"></div>
			<div class="reveal-origin">
				<div class="reveal-ripple ripple-one"></div>
				<div class="reveal-ripple ripple-two"></div>
			</div>
		{:else}
			<div class="charge-origin">
				{#each effect.stages as stage, index (`${stage}-${index}`)}
					<div
						class="charge-stage stage-{stage.toLowerCase()}"
						style={`--stage-delay: ${index * effect.stageMs}ms; --stage-duration: ${effect.stageMs}ms`}
					>
						<div class="charge-aura"></div>
						<div class="charge-ripple"></div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
{/if}

<style>
	.draw-fx {
		position: fixed;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		overflow: hidden;
	}
	.draw-blackout {
		position: fixed;
		inset: 0;
		z-index: 150;
		background: transparent;
		pointer-events: none;
		opacity: 1;
		animation: blackout-in var(--blackout-duration) ease-in var(--blackout-delay) forwards;
	}
	.draw-blackout.revealed {
		background: white;
		animation: blackout-release 0.72s ease-out forwards;
	}
	.crt-plus {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		opacity: 0;
		animation: crt-plus-collapse var(--blackout-duration) cubic-bezier(0.7, 0, 1, 0.55)
			var(--blackout-delay) forwards;
	}
	.crt-plus i {
		position: absolute;
		display: block;
		background: white;
		box-shadow:
			0 0 8px white,
			0 0 24px white,
			0 0 60px rgb(180 225 255 / 0.9);
	}
	.crt-plus i:first-child {
		inline-size: 92vw;
		block-size: 3px;
	}
	.crt-plus i:last-child {
		inline-size: 3px;
		block-size: 84vh;
	}
	.charge-origin,
	.reveal-origin {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
	}
	.charge-stage {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		pointer-events: none;
	}
	.charge-stage > * {
		grid-area: 1 / 1;
	}
	.charge-aura {
		inline-size: min(74vmin, 520px);
		aspect-ratio: 59 / 86;
		border-radius: 18%;
		background: radial-gradient(
			ellipse,
			transparent 42%,
			color-mix(in srgb, var(--fx) 38%, transparent) 72%,
			transparent 74%
		);
		filter: blur(7px);
		opacity: 0;
		animation: charge-aura-build var(--stage-duration) ease-in-out var(--stage-delay) both;
	}
	.charge-ripple {
		inline-size: min(56vmin, 390px);
		aspect-ratio: 1;
		border: 5px solid color-mix(in srgb, var(--fx) 76%, white);
		border-radius: 50%;
		filter: drop-shadow(0 0 9px var(--fx));
		opacity: 0;
		animation: charge-ripple-build var(--stage-duration) ease-out var(--stage-delay) both;
	}
	.rarity-r,
	.stage-r {
		--fx: var(--card-rarity-r);
	}
	.rarity-sr,
	.stage-sr {
		--fx: var(--card-rarity-sr);
	}
	.rarity-ur,
	.stage-ur {
		--fx: var(--card-rarity-ur);
	}
	.rarity-aar,
	.stage-aar {
		--fx: var(--card-rarity-aar);
	}
	.focus-lines {
		position: absolute;
		inset: -45vmax;
		border-radius: 50%;
		background: repeating-conic-gradient(
			from 0deg,
			color-mix(in srgb, var(--fx, white) 48%, transparent) 0deg 1.1deg,
			transparent 1.1deg 8deg
		);
		-webkit-mask: radial-gradient(circle, transparent 0 20%, #000 54% 100%);
		mask: radial-gradient(circle, transparent 0 20%, #000 54% 100%);
		opacity: 0.34;
		animation:
			focus-spin 18s linear infinite,
			focus-arrive 0.7s ease-out both;
	}
	.rarity-n .focus-lines {
		--fx: white;
		opacity: 0.14;
	}
	.reveal-ripple {
		position: relative;
		grid-area: 1 / 1;
		inline-size: min(72vmin, 500px);
		aspect-ratio: 1;
		border: 4px solid color-mix(in srgb, var(--fx, white) 72%, white);
		border-radius: 50%;
		opacity: 0;
		animation: reveal-ripple 0.9s ease-out both;
	}
	.ripple-two {
		animation-delay: 0.14s;
	}
	@keyframes charge-aura-build {
		0% {
			opacity: 0;
			transform: scale(0.9);
		}
		18%,
		76% {
			opacity: 0.52;
		}
		100% {
			opacity: 0;
			transform: scale(1.1);
		}
	}
	@keyframes charge-ripple-build {
		0% {
			opacity: 0;
			transform: scale(0.32);
		}
		14% {
			opacity: 0.96;
		}
		88% {
			opacity: 0.42;
		}
		100% {
			opacity: 0;
			transform: scale(1.72);
		}
	}
	@keyframes focus-spin {
		to {
			transform: rotate(1turn);
		}
	}
	@keyframes blackout-in {
		0% {
			background: rgb(0 0 0 / 0);
		}
		28%,
		100% {
			background: #000;
		}
	}
	@keyframes crt-plus-collapse {
		0% {
			opacity: 0;
			transform: scale(1);
		}
		5% {
			opacity: 1;
			transform: scale(1);
		}
		26% {
			opacity: 1;
			transform: scaleY(0.035) scaleX(1);
		}
		45% {
			opacity: 1;
			transform: scale(0.018);
		}
		48%,
		100% {
			opacity: 0;
			transform: scale(0);
		}
	}
	@keyframes blackout-release {
		0%,
		16% {
			opacity: 1;
			background: white;
		}
		100% {
			opacity: 0;
			background: white;
		}
	}
	@keyframes focus-arrive {
		from {
			opacity: 0;
			scale: 0.72;
		}
	}
	@keyframes reveal-ripple {
		0% {
			opacity: 0.95;
			transform: scale(0.36);
		}
		100% {
			opacity: 0;
			transform: scale(1.7);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.draw-blackout {
			display: none;
		}
		.charge-aura,
		.charge-ripple,
		.reveal-ripple {
			display: none;
		}
		.focus-lines {
			animation: none;
		}
	}
</style>
