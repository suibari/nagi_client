<script lang="ts">
	import type { EmojiView } from '$lib/api/types';
	import BluemojiMedia from './BluemojiMedia.svelte';

	let {
		emoji,
		bluemoji,
		left,
		top,
	}: { emoji: string; bluemoji?: EmojiView; left: number; top: number } = $props();
	const sparks = Array.from({ length: 12 }, (_, index) => ({
		angle: index * 30,
		distance: 35 + (index % 3) * 8,
		hue: [42, 331, 187, 216][index % 4],
	}));
</script>

<div class="reaction-stamp" style:left={`${left}px`} style:top={`${top}px`} aria-hidden="true">
	<span class="reaction-firework">
		{#each sparks as spark}
			<i
				style:--spark-angle={`${spark.angle}deg`}
				style:--spark-distance={`-${spark.distance}px`}
				style:--spark-hue={spark.hue}
			></i>
		{/each}
	</span>
	<span class="reaction-stamp-mark">
		{#if bluemoji}
			<BluemojiMedia class="reaction-stamp-image" emoji={bluemoji} loading="eager" />
		{:else}
			{emoji}
		{/if}
	</span>
</div>

<style>
	.reaction-stamp {
		position: fixed;
		z-index: 160;
		left: 0;
		top: 0;
		display: grid;
		place-items: center;
		width: 72px;
		height: 72px;
		margin: -36px 0 0 -36px;
		pointer-events: none;
	}
	.reaction-stamp-mark {
		position: relative;
		z-index: 1;
		display: grid;
		place-items: center;
		width: 72px;
		height: 72px;
		font-size: 52px;
		line-height: 1;
		filter: drop-shadow(0 8px 8px color-mix(in srgb, #000 25%, transparent));
		animation: stamp-pop 0.5s cubic-bezier(0.16, 0.9, 0.25, 1);
	}
	.reaction-firework,
	.reaction-firework i {
		position: absolute;
		inset: 50% auto auto 50%;
	}
	.reaction-firework i {
		width: 5px;
		height: 13px;
		margin: -6px 0 0 -2px;
		border-radius: var(--r-full);
		background: hsl(var(--spark-hue) 92% 62%);
		box-shadow: 0 0 7px hsl(var(--spark-hue) 95% 68% / 0.8);
		transform-origin: 50% 50%;
		animation: reaction-spark 0.64s cubic-bezier(0.12, 0.62, 0.24, 1) both;
	}
	.reaction-stamp :global(.reaction-stamp-image),
	.reaction-stamp :global(.reaction-stamp-image img),
	.reaction-stamp :global(.reaction-stamp-image canvas) {
		width: 64px;
		height: 64px;
	}
	@keyframes stamp-pop {
		0% {
			opacity: 0;
			transform: translateY(-36px) scale(1.45) rotate(-8deg);
		}
		42% {
			opacity: 1;
			transform: translateY(2px) scale(0.86) rotate(2deg);
		}
		68% {
			transform: translateY(-5px) scale(1.08) rotate(0deg);
		}
		100% {
			opacity: 0;
			transform: translateY(-9px) scale(1);
		}
	}
	@keyframes reaction-spark {
		0% {
			opacity: 0;
			transform: rotate(var(--spark-angle)) translateY(0) scale(0.25, 0.5);
		}
		15% {
			opacity: 1;
		}
		72% {
			opacity: 0.9;
			transform: rotate(var(--spark-angle)) translateY(var(--spark-distance)) scale(0.8, 1.7);
		}
		100% {
			opacity: 0;
			transform: rotate(var(--spark-angle)) translateY(calc(var(--spark-distance) - 9px))
				scale(0.25, 0.7);
		}
	}
</style>
