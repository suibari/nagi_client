<script lang="ts">
	import { onMount } from 'svelte';
	import { m } from '$lib/i18n/i18n.svelte';

	let {
		busy = false,
		error = '',
		onconfirm,
		oncancel,
	}: {
		busy?: boolean;
		error?: string;
		onconfirm: () => void;
		oncancel: () => void;
	} = $props();
	let cancelButton: HTMLButtonElement;

	onMount(() => cancelButton.focus());

	function keydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && !busy) oncancel();
	}
	function backdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget && !busy) oncancel();
	}
</script>

<svelte:window onkeydown={keydown} />
<div class="delete-backdrop" role="presentation" onclick={backdropClick}>
	<div class="delete-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-title">
		<h2 id="delete-title">{m.deletePostTitle()}</h2>
		<p>{m.deletePostConfirmation()}</p>
		{#if error}<p class="delete-error" role="alert">{error}</p>{/if}
		<div class="delete-actions">
			<button
				bind:this={cancelButton}
				type="button"
				class="ghost"
				disabled={busy}
				onclick={oncancel}>{m.cancel()}</button
			>
			<button type="button" class="danger" disabled={busy} onclick={onconfirm}>
				{busy ? m.deletingPost() : m.deletePostConfirm()}
			</button>
		</div>
	</div>
</div>
