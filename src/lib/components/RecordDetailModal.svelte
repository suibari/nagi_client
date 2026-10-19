<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { m } from '$lib/i18n/i18n.svelte';

	let {
		id,
		title,
		onclose,
		children,
	}: {
		id: string;
		title: string;
		onclose: () => void;
		children: Snippet;
	} = $props();
	let dialog: HTMLDialogElement;
	let content: HTMLDivElement;

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
	{id}
	bind:this={dialog}
	aria-labelledby={`${id}-title`}
	oncancel={(event) => {
		event.preventDefault();
		onclose();
	}}
	onclick={(event) => {
		if (event.target === dialog) onclose();
	}}
>
	<div class="panel">
		<header>
			<h2 id={`${id}-title`}>{title}</h2>
			<button type="button" aria-label={m.close()} onclick={onclose}>×</button>
		</header>
		<div class="content" bind:this={content} tabindex="-1">{@render children()}</div>
	</div>
</dialog>

<style>
	dialog {
		width: min(560px, calc(100vw - 32px));
		max-width: none;
		max-height: calc(100dvh - 32px);
		margin: auto;
		padding: 0;
		border: 1px solid var(--line);
		border-radius: 20px;
		background: var(--bg-raised);
		color: var(--text);
		box-shadow: var(--shadow-pop);
		overscroll-behavior: contain;
	}
	dialog::backdrop {
		background: rgb(0 0 0 / 0.72);
	}
	.panel {
		display: flex;
		flex-direction: column;
		max-height: calc(100dvh - 34px);
	}
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.75rem 1.25rem;
		border-bottom: 1px solid var(--line);
	}
	h2 {
		margin: 0;
		font-size: 1.05rem;
		line-height: 1.4;
	}
	button {
		width: 44px;
		height: 44px;
		flex-shrink: 0;
		border: 0;
		border-radius: 50%;
		background: transparent;
		color: var(--text-faint);
		font-size: 1.5rem;
		cursor: pointer;
	}
	button:hover {
		background: var(--accent-softer);
	}
	button:focus-visible {
		outline: 3px solid var(--accent-strong);
		outline-offset: 2px;
	}
	.content {
		overflow: auto;
		min-height: 0;
		padding: 1rem 1.25rem;
		overscroll-behavior: contain;
	}
	.content:focus {
		outline: none;
	}
</style>
