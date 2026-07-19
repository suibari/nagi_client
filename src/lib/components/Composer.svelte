<script lang="ts">
	import { createPost } from '$lib/atproto/records';
	import { m } from '$lib/i18n/i18n.svelte';
	let { onposted }: { onposted: () => void | Promise<void> } = $props();
	let text = $state('');
	let busy = $state(false);
	let error = $state('');
	async function submit() {
		if (!text.trim() || busy) return;
		busy = true;
		error = '';
		try {
			await createPost(text.trim());
			text = '';
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
	<div class="composer-foot">
		<span
			>{[...new Intl.Segmenter('ja', { granularity: 'grapheme' }).segment(text)].length} / 3000</span
		><button class="submit" disabled={busy || !text.trim()} onclick={submit}
			>{busy ? m.composerSubmitting() : m.composerSubmit()}</button
		>
	</div>
	{#if error}<p class="error">{error}</p>{/if}
</section>
