<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { m } from '$lib/i18n/i18n.svelte';

	let {
		mode,
		initialName = '',
		busy = false,
		error = '',
		onconfirm,
		oncancel,
	}: {
		mode: 'create' | 'rename';
		initialName?: string;
		busy?: boolean;
		error?: string;
		onconfirm: (name: string) => void;
		oncancel: () => void;
	} = $props();

	let name = $state('');
	let input = $state<HTMLInputElement>();
	const title = $derived(mode === 'create' ? m.bookmarkNewFolder() : m.bookmarkRenameFolder());

	onMount(async () => {
		name = initialName;
		await tick();
		input?.focus();
		input?.select();
	});
	function keydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && !busy) oncancel();
	}
	function backdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget && !busy) oncancel();
	}
</script>

<svelte:window onkeydown={keydown} />
<div class="folder-dialog-backdrop" role="presentation" onclick={backdropClick}>
	<div class="folder-dialog" role="dialog" aria-modal="true" aria-labelledby="folder-dialog-title">
		<h2 id="folder-dialog-title">{title}</h2>
		<form
			onsubmit={(event) => {
				event.preventDefault();
				onconfirm(name);
			}}
		>
			<label>
				<span>{m.bookmarkFolderName()}</span>
				<input bind:this={input} bind:value={name} maxlength="80" disabled={busy} />
			</label>
			{#if error}<p class="folder-dialog-error" role="alert">{error}</p>{/if}
			<div class="folder-dialog-actions">
				<button type="button" disabled={busy} onclick={oncancel}>{m.cancel()}</button>
				<button class="primary" type="submit" disabled={busy || !name.trim()}>{m.save()}</button>
			</div>
		</form>
	</div>
</div>

<style>
	.folder-dialog-backdrop {
		position: fixed;
		inset: 0;
		z-index: 150;
		display: grid;
		place-items: center;
		padding: 16px;
		background: rgba(0, 0, 0, 0.45);
	}
	.folder-dialog {
		inline-size: min(420px, 100%);
		padding: 20px;
		border: 1px solid var(--line);
		border-radius: var(--radius-l);
		background: var(--bg-raised);
		box-shadow: var(--shadow-pop);
	}
	h2 {
		margin: 0 0 16px;
		font-size: 18px;
	}
	form,
	label {
		display: grid;
		gap: 8px;
	}
	label span {
		font-size: 13px;
		font-weight: 700;
		color: var(--text-muted);
	}
	input {
		inline-size: 100%;
		min-inline-size: 0;
	}
	.folder-dialog-actions {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
		margin-top: 8px;
	}
	.folder-dialog-error {
		margin: 0;
		color: var(--danger);
		font-size: 13px;
	}
</style>
