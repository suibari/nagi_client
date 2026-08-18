<script lang="ts">
	import type { Snippet } from 'svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import Icon from './shell/Icon.svelte';

	let {
		open,
		mode = $bindable<'simple' | 'rich'>('simple'),
		sending = false,
		title = m.postModalTitle(),
		onclose,
		children,
	}: {
		open: boolean;
		mode?: 'simple' | 'rich';
		sending?: boolean;
		title?: string;
		onclose: () => void;
		children: Snippet;
	} = $props();
	let dialog = $state<HTMLDivElement>();

	$effect(() => {
		if (open) requestAnimationFrame(() => dialog?.focus());
	});

	function keydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && open && !sending) {
			event.preventDefault();
			onclose();
		}
	}
</script>

<svelte:window onkeydown={keydown} />
<div
	class="post-modal-backdrop"
	role="presentation"
	hidden={!open}
	onclick={(event) => event.target === event.currentTarget && !sending && onclose()}
>
	<div
		bind:this={dialog}
		class="post-modal"
		class:rich={mode === 'rich'}
		role="dialog"
		aria-modal="true"
		aria-labelledby="post-modal-title"
		tabindex="-1"
	>
		<header>
			<h2 id="post-modal-title" class="visually-hidden">{title}</h2>
			<div class="post-modal-modes" role="tablist" aria-label={m.postModalModesAria()}>
				<button
					type="button"
					role="tab"
					aria-selected={mode === 'simple'}
					class:active={mode === 'simple'}
					disabled={sending}
					onclick={() => (mode = 'simple')}>{m.postModeSimple()}</button
				>
				<button
					type="button"
					role="tab"
					aria-selected={mode === 'rich'}
					class:active={mode === 'rich'}
					disabled={sending}
					onclick={() => (mode = 'rich')}>{m.postModeRich()}</button
				>
			</div>
			<button
				class="icon-action post-modal-close"
				type="button"
				disabled={sending}
				aria-label={m.close()}
				title={m.close()}
				onclick={onclose}><Icon name="close" size={18} /></button
			>
		</header>
		<div class="post-modal-body">{@render children()}</div>
	</div>
</div>

<style>
	.post-modal-backdrop {
		position: fixed;
		inset: 0;
		z-index: 110;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding: 40px 16px 16px;
		overflow-y: auto;
		background: color-mix(in srgb, var(--bg) 82%, #000);
	}
	.post-modal-backdrop[hidden] {
		display: none;
	}
	.post-modal {
		display: flex;
		flex-direction: column;
		gap: 12px;
		width: min(100%, 620px);
		padding: 12px 16px 16px;
		border: 1px solid var(--line-strong);
		border-radius: var(--r-md);
		background: var(--surface-1);
		box-shadow: var(--shadow-pop);
	}
	.post-modal.rich {
		height: min(760px, calc(100dvh - 72px));
		overflow: hidden;
	}
	.post-modal:focus {
		outline: none;
	}
	.post-modal-body {
		display: flex;
		flex-direction: column;
		min-height: 0;
	}
	.post-modal.rich .post-modal-body {
		flex: 1;
	}
	header {
		display: flex;
		align-items: center;
		gap: 8px;
		padding-bottom: 10px;
		border-bottom: 1px solid var(--line);
	}
	.post-modal-modes {
		display: flex;
		gap: 4px;
	}
	.post-modal-close {
		margin-inline-start: auto;
	}
	.post-modal-modes button {
		min-height: 28px;
		padding: 4px 10px;
		border: 1px solid transparent;
		border-radius: var(--r-sm);
		background: transparent;
		color: var(--text-sub);
		font-size: 12px;
		font-weight: 700;
		cursor: pointer;
	}
	.post-modal-modes button.active {
		border-color: var(--line-strong);
		background: var(--surface-2);
		color: var(--text);
	}
	@media (max-width: 767px) {
		.post-modal-backdrop {
			padding: 8px 8px calc(8px + env(safe-area-inset-bottom));
		}
		.post-modal {
			padding: 10px 12px 12px;
		}
		.post-modal.rich {
			height: calc(100dvh - 16px - env(safe-area-inset-bottom));
		}
	}
</style>
