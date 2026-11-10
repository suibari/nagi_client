<script lang="ts">
	import { m } from '$lib/i18n/i18n.svelte';
	import CardBack from './CardBack.svelte';
	import Icon from './shell/Icon.svelte';

	let {
		drawing = false,
		anniversaryPending = false,
		reactionNext = false,
		error = '',
		ondraw,
	}: {
		drawing?: boolean;
		anniversaryPending?: boolean;
		reactionNext?: boolean;
		error?: string;
		ondraw: () => void;
	} = $props();
</script>

<div class="card-banner">
	<button
		type="button"
		class="card-banner-button"
		disabled={drawing}
		aria-busy={drawing}
		onclick={ondraw}
	>
		<span class="card-banner-card" aria-hidden="true">
			<span class="card-banner-card-face"><CardBack mark="52%" frame={false} /></span>
		</span>
		<span class="card-banner-label">
			{#if drawing}
				{m.cardDrawing()}
			{:else if anniversaryPending}
				{m.cardAnniversaryEntryLabel()}
			{:else if reactionNext}
				<span class="card-banner-lead">{m.cardReactionNextLead()}</span>
				{m.cardReactionNextText()}
			{:else}
				{m.cardBannerLabel()}
			{/if}
		</span>
		<span class="card-banner-chevron" aria-hidden="true"><Icon name="chevron" size={18} /></span>
	</button>
	{#if error}<p class="card-banner-error" role="alert">{error}</p>{/if}
</div>

<style>
	/* /cards のタブの上に置く帯。ゲームの手順とは別の「今日の一回」なので、タブより上に独立させる。 */
	.card-banner {
		padding: 12px 16px 12px;
	}

	.card-banner-button {
		display: flex;
		align-items: center;
		gap: 16px;
		inline-size: 100%;
		min-block-size: 72px;
		padding: 12px 16px;
		border: 1px solid var(--accent-border);
		border-radius: 12px;
		background: var(--accent-softer);
		color: var(--accent-strong);
		font: inherit;
		font-size: 1rem;
		font-weight: 700;
		line-height: 1.5;
		text-align: start;
		cursor: pointer;
		transition:
			background-color 0.14s ease,
			border-color 0.14s ease;
	}

	.card-banner-button:hover:not(:disabled) {
		background: var(--accent-soft);
		border-color: var(--accent-strong);
	}

	.card-banner-button:focus-visible {
		outline: 2px solid var(--focus-ring);
		outline-offset: 2px;
	}

	.card-banner-button:disabled {
		opacity: 0.7;
		cursor: progress;
	}

	.card-banner-card {
		display: block;
		flex: 0 0 auto;
		inline-size: 32px;
		aspect-ratio: 59 / 86;
		perspective: 120px;
		transform: rotate(-8deg);
	}

	.card-banner-card-face {
		position: relative;
		display: block;
		inline-size: 100%;
		block-size: 100%;
		overflow: hidden;
		border-radius: 4px;
		box-shadow: 0 2px 6px color-mix(in srgb, var(--text) 20%, transparent);
		--card-back-border: 1px;
		transform-style: preserve-3d;
		animation: card-banner-flip 3.8s ease-in-out infinite;
	}

	.card-banner-label {
		flex: 1 1 auto;
		min-inline-size: 0;
		overflow-wrap: anywhere;
	}

	.card-banner-lead {
		margin-inline-end: 4px;
		color: var(--accent-strong);
	}

	.card-banner-chevron {
		display: inline-flex;
		flex: 0 0 auto;
		align-items: center;
		justify-content: center;
		inline-size: 28px;
		block-size: 28px;
		border-radius: 50%;
		background: var(--accent-soft);
		color: var(--accent-strong);
	}

	/* 読み始めを邪魔しないよう長く静止し、周期の終わりだけ1回転して存在を知らせる。 */
	@keyframes card-banner-flip {
		0%,
		68% {
			transform: rotateY(0deg);
		}
		92%,
		100% {
			transform: rotateY(360deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.card-banner-button {
			transition: none;
		}
		.card-banner-card-face {
			animation: none;
		}
	}

	.card-banner-error {
		margin: 8px 0 0;
		color: var(--danger);
		font-size: 12px;
	}
</style>
