<script lang="ts">
	import { onMount } from 'svelte';
	import { m } from '$lib/i18n/i18n.svelte';

	let { onclose }: { onclose: () => void } = $props();
	let closeButton: HTMLButtonElement;
	onMount(() => closeButton?.focus());

	function keydown(event: KeyboardEvent) {
		if (event.key === 'Escape') onclose();
	}
</script>

<svelte:window onkeydown={keydown} />
<div
	class="card-guide-backdrop"
	role="presentation"
	onclick={(event) => event.target === event.currentTarget && onclose()}
>
	<div class="card-guide" role="dialog" aria-modal="true" aria-labelledby="card-guide-title">
		<span class="card-guide-emoji" aria-hidden="true">💞</span>
		<h2 id="card-guide-title">{m.cardReactionGuideTitle()}</h2>
		<p>{m.cardReactionGuideBody()}</p>
		<p class="card-guide-note">{m.cardReactionGuideNote()}</p>
		<button bind:this={closeButton} type="button" class="primary" onclick={onclose}>
			{m.cardReactionGuideClose()}
		</button>
	</div>
</div>

<style>
	.card-guide-backdrop {
		position: fixed;
		inset: 0;
		z-index: 120;
		display: grid;
		place-items: center;
		padding: 20px;
		background: rgb(0 0 0 / 0.62);
	}
	.card-guide {
		display: grid;
		justify-items: center;
		gap: 0.75rem;
		inline-size: min(100%, 380px);
		padding: 1.4rem 1.25rem 1.2rem;
		border-radius: var(--radius-l);
		background: var(--bg-raised);
		box-shadow: var(--shadow-pop);
		text-align: center;
	}
	.card-guide-emoji {
		font-size: 2.4rem;
	}
	h2,
	p {
		margin: 0;
	}
	h2 {
		font-size: 1.15rem;
		color: var(--text-strong);
	}
	p {
		line-height: 1.7;
	}
	.card-guide-note {
		color: var(--text-muted);
		font-size: 0.85rem;
	}
	button {
		min-inline-size: 9rem;
	}
</style>
