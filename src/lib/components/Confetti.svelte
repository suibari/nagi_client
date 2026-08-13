<script lang="ts">
	import type { ConfettiLevel } from '$lib/cards/celebration';
	import { Confetti as SvelteConfetti } from 'svelte-confetti';

	let {
		level,
		fullscreen = level === 'aar',
	}: {
		level: ConfettiLevel;
		/** AAR と100%コンプだけ、画面下の複数地点から全画面へ飛ばす。 */
		fullscreen?: boolean;
	} = $props();

	const COLORS = ['#ff5f87', '#ffbd3f', '#5ee6a8', '#54b9ff', '#a78bfa', '#ff77d2'];
	const amount = $derived(level === 'sr' ? 24 : level === 'ur' ? 46 : level === 'aar' ? 42 : 54);
	const duration = $derived(level === 'sr' ? 2100 : level === 'ur' ? 2600 : 3000);
</script>

{#if fullscreen}
	<!-- 1地点から横へ引き伸ばさず、左右と中央の3つの噴射口で画面全体を自然に覆う。 -->
	<div class="confetti-layer fullscreen" aria-hidden="true">
		{#each ['left', 'center', 'right'] as position (position)}
			<div class="confetti-origin cannon {position}">
				<SvelteConfetti
					size={11}
					x={[-1.8, 1.8]}
					y={[2.8, 5.4]}
					{duration}
					delay={[0, 380]}
					colorArray={COLORS}
					{amount}
					fallDistance="115vh"
					cone
					xSpread={0.72}
					disableForReducedMotion
				/>
			</div>
		{/each}
	</div>
{:else}
	<div class="confetti-layer local" aria-hidden="true">
		<div class="confetti-origin">
			<SvelteConfetti
				size={level === 'sr' ? 8 : 10}
				x={level === 'sr' ? [-0.75, 0.75] : [-1.25, 1.25]}
				y={level === 'sr' ? [1, 1.8] : [1.5, 2.7]}
				{duration}
				delay={[0, level === 'sr' ? 180 : 300]}
				colorArray={COLORS}
				{amount}
				fallDistance={level === 'sr' ? '340px' : '58vh'}
				cone
				xSpread={0.64}
				disableForReducedMotion
			/>
		</div>
	</div>
{/if}

<style>
	.confetti-layer {
		position: fixed;
		inset: 0;
		inline-size: 100vw;
		block-size: 100dvh;
		z-index: 140;
		pointer-events: none;
		overflow: hidden;
	}
	.confetti-origin {
		position: absolute;
		inline-size: 0;
		block-size: 0;
	}
	.local .confetti-origin {
		inset-block-start: 64%;
		inset-inline-start: 50%;
	}
	.cannon {
		inset-block-end: 2vh;
	}
	.cannon.left {
		inset-inline-start: 12%;
	}
	.cannon.center {
		inset-inline-start: 50%;
	}
	.cannon.right {
		inset-inline-start: 88%;
	}
</style>
