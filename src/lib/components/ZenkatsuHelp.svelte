<script lang="ts">
	import { onMount } from 'svelte';
	import { m } from '$lib/i18n/i18n.svelte';

	let { id, maxCards, onclose }: { id: string; maxCards: number; onclose: () => void } = $props();
	let dialog: HTMLDialogElement;
	onMount(() => {
		const previousFocus = document.activeElement;
		dialog.showModal();
		const previous = document.documentElement.style.overflow;
		document.documentElement.style.overflow = 'hidden';
		return () => {
			dialog.close();
			document.documentElement.style.overflow = previous;
			queueMicrotask(() => {
				if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
					previousFocus.focus({ preventScroll: true });
			});
		};
	});
</script>

<dialog
	bind:this={dialog}
	{id}
	class="help"
	aria-labelledby={`${id}-title`}
	oncancel={(event) => {
		event.preventDefault();
		onclose();
	}}
>
	<header>
		<h2 id={`${id}-title`}>{m.zenkatsuHowToPlay()}</h2>
		<button class="help-close" aria-label={m.close()} onclick={onclose}>×</button>
	</header>
	<div class="help-body">
		<p>{m.zenkatsuGuidePick({ max: maxCards })}</p>
		<p>{m.zenkatsuGuideSubmit()}</p>
		<p>{m.zenkatsuGuideDaily()}</p>
		<h3>{m.zenkatsuGuideCooldownTitle()}</h3>
		<p>{m.zenkatsuGuideCooldown()}</p>
		<p>{m.zenkatsuGuideStock()}</p>
	</div>
</dialog>

<style>
	.help {
		width: min(620px, calc(100vw - 32px));
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
	.help::backdrop {
		background: rgb(0 0 0 / 0.72);
	}
	header {
		position: sticky;
		top: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.75rem 1.25rem;
		border-bottom: 1px solid var(--line);
		background: var(--bg-raised);
	}
	h2,
	h3 {
		margin: 0;
		font-size: 1rem;
	}
	.help-close {
		width: 44px;
		height: 44px;
		flex-shrink: 0;
		border: 1px solid var(--line);
		border-radius: var(--r-md);
		background: var(--bg);
		color: var(--text);
		font-size: 1.5rem;
	}
	.help-body {
		padding: 0.5rem 1.25rem 1.25rem;
		font-size: 0.9rem;
		line-height: 1.8;
		overflow-wrap: anywhere;
	}
	p {
		margin: 0.75rem 0 0;
	}
	h3 {
		margin-top: 1.25rem;
	}
</style>
