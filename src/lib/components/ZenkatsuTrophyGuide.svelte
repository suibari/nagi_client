<script lang="ts">
	import { onMount } from 'svelte';
	import { m } from '$lib/i18n/i18n.svelte';

	let { onclose }: { onclose: () => void } = $props();
	let dialog: HTMLDialogElement;
	let content: HTMLDivElement;

	const trophies = [
		{ name: () => m.trophyBotan(), description: () => m.trophyBotanDescription() },
		{ name: () => m.trophyAdventure(), description: () => m.trophyAdventureDescription() },
		{ name: () => m.trophySolo(), description: () => m.trophySoloDescription() },
		{ name: () => m.trophyTailwind(), description: () => m.trophyTailwindDescription() },
		{ name: () => m.trophyCombo(), description: () => m.trophyComboDescription() },
	];

	onMount(() => {
		const previousFocus = document.activeElement;
		dialog.showModal();
		content.focus({ preventScroll: true });
		return () => {
			dialog.close();
			queueMicrotask(() => {
				if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
					previousFocus.focus({ preventScroll: true });
			});
		};
	});
</script>

<dialog
	bind:this={dialog}
	class="trophy-guide"
	aria-labelledby="trophy-guide-title"
	oncancel={(event) => {
		event.preventDefault();
		onclose();
	}}
	onclick={(event) => {
		if (event.target === dialog) onclose();
	}}
>
	<header>
		<h2 id="trophy-guide-title">{m.trophyGuideTitle()}</h2>
		<button type="button" class="close" aria-label={m.close()} onclick={onclose}>×</button>
	</header>
	<div class="content" bind:this={content} tabindex="-1">
		<p class="intro">{m.trophyGuideIntro()}</p>
		<ul>
			{#each trophies as trophy (trophy.name())}
				<li>
					<h3>{trophy.name()}</h3>
					<p>{trophy.description()}</p>
				</li>
			{/each}
		</ul>
		<p class="note">{m.trophyGuideNote()}</p>
	</div>
</dialog>

<style>
	.trophy-guide {
		width: min(520px, calc(100vw - 24px));
		max-width: none;
		max-height: calc(100dvh - 24px);
		margin: auto;
		padding: 0;
		border: 0;
		border-radius: 20px;
		background: var(--bg-raised);
		color: var(--text);
		box-shadow: var(--shadow-pop);
		overscroll-behavior: contain;
	}
	.trophy-guide::backdrop {
		background: rgb(0 0 0 / 0.72);
	}
	header {
		position: sticky;
		top: 0;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1.1rem 1.25rem 0.4rem;
		background: var(--bg-raised);
	}
	h2,
	h3,
	p {
		margin: 0;
	}
	h2 {
		font-size: 1.15rem;
		line-height: 1.4;
	}
	.close {
		width: 44px;
		height: 44px;
		flex-shrink: 0;
		border: 0;
		border-radius: var(--r-full);
		background: transparent;
		color: var(--text-faint);
		font-size: 1.5rem;
		cursor: pointer;
	}
	.close:hover {
		background: var(--accent-softer);
		color: var(--text);
	}
	.close:focus-visible {
		outline: 3px solid var(--accent-strong);
		outline-offset: 2px;
	}
	.content {
		padding: 0.3rem 1.25rem 1.25rem;
		font-size: 0.9rem;
		line-height: 1.6;
	}
	.content:focus {
		outline: none;
	}
	.intro {
		color: var(--text-faint);
	}
	ul {
		display: grid;
		gap: 0.55rem;
		margin: 1.2rem 0 1rem;
		padding: 0;
		list-style: none;
	}
	li {
		padding: 0.85rem 1rem;
		border-radius: var(--r-bubble);
		background: color-mix(in srgb, var(--accent-strong) 5%, var(--bg-raised));
	}
	li:first-child {
		background: color-mix(in srgb, var(--accent-strong) 11%, var(--bg-raised));
	}
	h3 {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		font-size: 0.95rem;
		line-height: 1.4;
	}
	h3::before {
		content: '';
		width: 0.4rem;
		height: 0.4rem;
		flex: 0 0 auto;
		border-radius: 50%;
		background: var(--accent-strong);
	}
	li p {
		margin: 0.35rem 0 0 0.95rem;
		font-size: 0.875rem;
	}
	.note {
		padding-inline: 0.25rem;
		color: var(--text-faint);
		font-size: 0.82rem;
	}
</style>
