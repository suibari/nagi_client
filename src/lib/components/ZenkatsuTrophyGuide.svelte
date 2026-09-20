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
		width: min(560px, calc(100vw - 32px));
		max-width: none;
		max-height: calc(100dvh - 32px);
		margin: auto;
		padding: 0;
		border: 1px solid var(--line);
		border-radius: 20px;
		background: var(--bg-raised);
		color: var(--text);
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
		padding: 0.75rem 1.25rem;
		border-bottom: 1px solid var(--line);
		background: var(--bg-raised);
	}
	h2,
	h3,
	p {
		margin: 0;
	}
	h2 {
		font-size: 1rem;
	}
	.close {
		width: 44px;
		height: 44px;
		flex-shrink: 0;
		border: 1px solid var(--line);
		border-radius: var(--r-md);
		background: var(--bg);
		color: var(--text);
		font-size: 1.5rem;
		cursor: pointer;
	}
	.close:focus-visible {
		outline: 3px solid var(--accent-strong);
		outline-offset: 2px;
	}
	.content {
		padding: 1.25rem;
		font-size: 0.9rem;
		line-height: 1.7;
	}
	.content:focus {
		outline: none;
	}
	.intro,
	.note {
		color: var(--text-faint);
	}
	ul {
		margin: 1rem 0;
		padding: 0;
		list-style: none;
	}
	li {
		padding: 0.75rem 0;
		border-block-start: 1px solid var(--line);
	}
	h3 {
		font-size: 0.95rem;
	}
	li p {
		margin-top: 0.2rem;
	}
	.note {
		font-size: 0.8rem;
	}
</style>
