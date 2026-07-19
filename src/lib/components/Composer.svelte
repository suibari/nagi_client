<script lang="ts">
	import { createPost } from '$lib/atproto/records';
	import { m } from '$lib/i18n/i18n.svelte';
	import type { ImageAttachment } from '$lib/images';
	import ImageAttachmentEditor from './ImageAttachmentEditor.svelte';
	let { onposted }: { onposted: () => void | Promise<void> } = $props();
	let text = $state('');
	let busy = $state(false);
	let error = $state('');
	let attachments = $state<ImageAttachment[]>([]);
	async function submit() {
		if ((!text.trim() && !attachments.length) || busy) return;
		busy = true;
		error = '';
		try {
			await createPost(text.trim(), undefined, undefined, attachments);
			text = '';
			attachments = [];
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
	<div class="composer-foot">
		<span
			>{[...new Intl.Segmenter('ja', { granularity: 'grapheme' }).segment(text)].length} / 3000</span
		><button
			class="submit"
			disabled={busy || (!text.trim() && !attachments.length)}
			onclick={submit}>{busy ? m.composerSubmitting() : m.composerSubmit()}</button
		>
	</div>
	{#if error}<p class="error">{error}</p>{/if}
</section>
