<script lang="ts">
	import { onMount } from 'svelte';
	import { m } from '$lib/i18n/i18n.svelte';

	let {
		date,
		busy = false,
		error = '',
		onconfirm,
		oncancel,
	}: {
		/** 表示用に整形済みの生年月日。 */
		date: string;
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
	<div class="delete-dialog" role="dialog" aria-modal="true" aria-labelledby="age-confirm-title">
		<h2 id="age-confirm-title">{m.ageConfirmTitle()}</h2>
		<p>{m.ageConfirmBody({ date })}</p>
		<p class="private-note">{m.ageBirthDatePrivate()}</p>
		{#if error}<p class="delete-error" role="alert">{error}</p>{/if}
		<div class="delete-actions">
			<button bind:this={cancelButton} type="button" disabled={busy} onclick={oncancel}>
				{m.cancel()}
			</button>
			<button type="button" class="danger" disabled={busy} onclick={onconfirm}>
				{m.ageConfirmSubmit()}
			</button>
		</div>
	</div>
</div>

<style>
	.private-note {
		color: var(--text-muted);
		font-size: 0.85rem;
	}
</style>
