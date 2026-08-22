<script lang="ts">
	import { m } from '$lib/i18n/i18n.svelte';
	import Confetti from './Confetti.svelte';

	let {
		percent,
		collectionHref,
		onclose,
	}: {
		percent: number;
		collectionHref?: string;
		onclose: () => void;
	} = $props();

	let closeButton: HTMLButtonElement;
	$effect(() => closeButton?.focus());

	function keydown(event: KeyboardEvent) {
		if (event.key === 'Escape') onclose();
	}
	function backdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) onclose();
	}
</script>

<svelte:window onkeydown={keydown} />
<Confetti level="milestone" fullscreen={percent === 100} />
<div class="milestone-backdrop" role="presentation" onclick={backdropClick}>
	<div class="milestone-dialog" role="dialog" aria-modal="true" aria-labelledby="milestone-title">
		<div class="milestone-medal" aria-hidden="true">{percent}%</div>
		<h2 id="milestone-title">{m.cardMilestoneTitle({ percent })}</h2>
		<p>{percent === 100 ? m.cardMilestoneComplete() : m.cardMilestoneBody()}</p>
		<div class="milestone-track" aria-hidden="true"><i style={`inline-size:${percent}%`}></i></div>
		<div class="milestone-actions">
			<button bind:this={closeButton} type="button" class="primary" onclick={onclose}>
				{m.cardMilestoneClose()}
			</button>
			{#if collectionHref}
				<a href={collectionHref} onclick={onclose}>{m.cardViewCollection()} →</a>
			{/if}
		</div>
	</div>
</div>

<style>
	.milestone-backdrop {
		position: fixed;
		inset: 0;
		z-index: 130;
		display: grid;
		place-items: center;
		padding: 20px;
		background: rgb(0 0 0 / 0.62);
	}
	.milestone-dialog {
		display: grid;
		justify-items: center;
		gap: 0.9rem;
		inline-size: min(100%, 360px);
		padding: 1.7rem 1.3rem 1.4rem;
		border: 1px solid color-mix(in srgb, var(--accent) 42%, var(--line));
		border-radius: var(--radius-l);
		background: var(--bg-raised);
		box-shadow: var(--shadow-pop);
		text-align: start;
	}
	.milestone-medal {
		display: grid;
		place-items: center;
		inline-size: 92px;
		aspect-ratio: 1;
		border: 6px double color-mix(in srgb, var(--accent) 72%, white);
		border-radius: 50%;
		background: radial-gradient(circle at 35% 28%, white, var(--accent-soft));
		color: var(--accent-strong);
		font-size: 1.45rem;
		font-weight: 900;
		box-shadow: 0 0 28px color-mix(in srgb, var(--accent) 32%, transparent);
	}
	.milestone-dialog h2,
	.milestone-dialog p {
		margin: 0;
	}
	.milestone-dialog h2 {
		font-size: 1.2rem;
	}
	.milestone-dialog p {
		color: var(--text-muted);
		font-size: 0.9rem;
		line-height: 1.6;
	}
	.milestone-track {
		inline-size: 100%;
		block-size: 9px;
		overflow: hidden;
		border-radius: 999px;
		background: var(--bg-inset);
	}
	.milestone-track i {
		display: block;
		block-size: 100%;
		border-radius: inherit;
		background: linear-gradient(90deg, var(--accent), var(--card-rarity-aar));
	}
	.milestone-actions {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		gap: 0.65rem 1rem;
	}
	.milestone-actions a {
		color: var(--accent-strong);
		font-size: 0.85rem;
		font-weight: 700;
	}
</style>
