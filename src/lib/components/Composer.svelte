<script lang="ts">
	import { createPost } from '$lib/atproto/records';
	import { m } from '$lib/i18n/i18n.svelte';
	import type { ImageAttachment } from '$lib/images';
	import ImageAttachmentEditor from './ImageAttachmentEditor.svelte';
	import LinkCardEditor from './LinkCardEditor.svelte';
	import type { LinkCardDraft } from '$lib/atproto/records';
	let { onposted }: { onposted: () => void | Promise<void> } = $props();
	let text = $state('');
	let busy = $state(false);
	let error = $state('');
	let attachments = $state<ImageAttachment[]>([]);
	let linkCards = $state<LinkCardDraft[]>([]);
	async function submit() {
		if ((!text.trim() && !attachments.length && !linkCards.length) || busy) return;
		busy = true;
		error = '';
		try {
			await createPost(text.trim(), undefined, undefined, attachments, linkCards);
			text = '';
			attachments = [];
			linkCards = [];
			await onposted();
		} catch (e) {
			error = e instanceof Error ? e.message : m.postFailed();
		} finally {
			busy = false;
		}
	}
</script>

<section class="composer">
	<textarea
		bind:value={text}
		maxlength="30000"
		placeholder={m.composerPlaceholder()}
		aria-label={m.composerAria()}
	></textarea>
	<ImageAttachmentEditor bind:attachments disabled={busy} />
	<LinkCardEditor {text} bind:cards={linkCards} disabled={busy} />
	<div class="composer-foot">
		<span
			>{[...new Intl.Segmenter('ja', { granularity: 'grapheme' }).segment(text)].length} / 3000</span
		><button
			class="submit"
			disabled={busy || (!text.trim() && !attachments.length && !linkCards.length)}
			onclick={submit}>{busy ? m.composerSubmitting() : m.composerSubmit()}</button
		>
	</div>
	{#if error}<p class="error">{error}</p>{/if}
</section>
