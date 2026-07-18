<script lang="ts">
	import { createPost } from '$lib/atproto/records';
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
			error = e instanceof Error ? e.message : '投稿できませんでした';
		} finally {
			busy = false;
		}
	}
</script>

<section class="composer">
	<textarea
		bind:value={text}
		maxlength="30000"
		placeholder="いま、どんな気持ち？"
		aria-label="投稿内容"
	></textarea>
	<div class="composer-foot">
		<span
			>{[...new Intl.Segmenter('ja', { granularity: 'grapheme' }).segment(text)].length} / 3000</span
		><button class="submit" disabled={busy || !text.trim()} onclick={submit}
			>{busy ? '送信中…' : '投稿する'}</button
		>
	</div>
	{#if error}<p class="error">{error}</p>{/if}
</section>
