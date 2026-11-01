<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	let {
		busy,
		error = '',
		onconfirm,
		oncancel,
	} = $props<{
		busy: boolean;
		error?: string;
		onconfirm: () => void;
		oncancel: () => void;
	}>();
	function backdropClick(event: MouseEvent) {
		if (!busy && event.target === event.currentTarget) oncancel();
	}
</script>

<div class="delete-backdrop" role="presentation" onclick={backdropClick}>
	<div class="delete-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-data-title">
		<h2 id="delete-data-title">{m.deleteDataDialogTitle()}</h2>
		<p>{m.deleteDataDialogBody()}</p>
		{#if error}<p class="delete-error" role="alert">{error}</p>{/if}
		<div class="delete-actions">
			<Button variant="secondary" type="button" onclick={oncancel} disabled={busy}
				>{m.cancel()}</Button
			>
			<Button variant="danger" type="button" onclick={onconfirm} disabled={busy}>
				{busy ? m.deleteDataDeleting() : m.deleteDataConfirm()}
			</Button>
		</div>
	</div>
</div>
