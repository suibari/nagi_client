<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { m, dateLocale } from '$lib/i18n/i18n.svelte';
	import { drafts } from '$lib/drafts/drafts.svelte';
	import type { StoredDraft } from '$lib/drafts/storage';
	import Icon from './shell/Icon.svelte';

	let { onrestore, onclose }: { onrestore: (id: string) => void; onclose: () => void } = $props();
	let confirmingId = $state<string | null>(null);
	let closeButton: HTMLButtonElement;

	// サムネイル用の object URL はこのダイアログが所有する（Composer 側の
	// previewUrl とは別物なので、閉じるときにここで解放する）。
	const thumbnails = new Map<string, string>();
	let previews = $state<Record<string, string>>({});

	$effect(() => {
		const wanted = new Map<string, Blob>();
		for (const draft of drafts.entries) {
			const blob =
				draft.images[0]?.blob ?? draft.linkCards.find((card) => card.thumbnail)?.thumbnail;
			if (blob) wanted.set(draft.id, blob);
		}
		for (const [id, url] of thumbnails) {
			if (!wanted.has(id)) {
				URL.revokeObjectURL(url);
				thumbnails.delete(id);
			}
		}
		for (const [id, blob] of wanted) {
			if (!thumbnails.has(id)) thumbnails.set(id, URL.createObjectURL(blob));
		}
		previews = Object.fromEntries(thumbnails);
	});

	onMount(() => closeButton.focus());
	onDestroy(() => thumbnails.forEach((url) => URL.revokeObjectURL(url)));

	const summary = (draft: StoredDraft) => {
		const text = draft.text.trim();
		if (text) return text;
		if (draft.images.length) return m.draftImagesOnly({ count: draft.images.length });
		return m.draftLinkOnly();
	};
	const timestamp = (draft: StoredDraft) =>
		new Date(draft.updatedAt).toLocaleString(dateLocale(), {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});

	function keydown(event: KeyboardEvent) {
		if (event.key === 'Escape') onclose();
	}
	function backdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) onclose();
	}
	function remove(id: string) {
		if (confirmingId !== id) {
			confirmingId = id;
			return;
		}
		confirmingId = null;
		void drafts.remove(id);
	}
</script>

<svelte:window onkeydown={keydown} />
<div class="draft-backdrop" role="presentation" onclick={backdropClick}>
	<div class="draft-dialog" role="dialog" aria-modal="true" aria-labelledby="draft-title">
		<header class="draft-dialog-head">
			<h2 id="draft-title">{m.draftListTitle()}</h2>
			<button
				bind:this={closeButton}
				type="button"
				class="icon-action"
				aria-label={m.draftListClose()}
				title={m.draftListClose()}
				onclick={onclose}><Icon name="close" size={18} /></button
			>
		</header>
		{#if !drafts.entries.length}
			<p class="draft-empty">{m.draftListEmpty()}</p>
		{:else}
			<ul class="draft-list">
				{#each drafts.entries as draft (draft.id)}
					<li class="draft-item">
						{#if previews[draft.id]}<img class="draft-thumb" src={previews[draft.id]} alt="" />{/if}
						<div class="draft-body">
							<p class="draft-text">{summary(draft)}</p>
							<small>{timestamp(draft)}</small>
						</div>
						<div class="draft-item-actions">
							<button type="button" class="ghost" onclick={() => onrestore(draft.id)}
								>{m.draftRestore()}</button
							>
							<button
								type="button"
								class="ghost draft-delete"
								class:confirming={confirmingId === draft.id}
								aria-label={m.draftDelete()}
								title={confirmingId === draft.id ? m.draftDeleteConfirm() : m.draftDelete()}
								onclick={() => remove(draft.id)}
								onblur={() => (confirmingId === draft.id ? (confirmingId = null) : undefined)}
							>
								{#if confirmingId === draft.id}{m.draftDeleteConfirm()}{:else}<Icon
										name="trash"
										size={16}
									/>{/if}
							</button>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
		<p class="draft-note">{m.draftLocalOnlyNote()}</p>
	</div>
</div>
