<script lang="ts">
	import Spinner from '$lib/components/Spinner.svelte';
	import BluemojiMedia from './BluemojiMedia.svelte';
	import { emojiFileType, emojiNeedsPngConversion, processEmojiImage } from '$lib/atproto/bluemoji';
	import { m } from '$lib/i18n/i18n.svelte';
	let {
		file,
		name,
		class: className = '',
	}: { file: File; name: string; class?: string } = $props();
	let media = $state<{ url: string; mediaType: `image/${string}` | 'application/lottie+zip' }>();
	let failed = $state(false);
	$effect(() => {
		const selected = file;
		let disposed = false;
		let url: string | undefined;
		media = undefined;
		failed = false;
		async function prepare() {
			try {
				const convert = emojiNeedsPngConversion(selected);
				const blob = convert ? await processEmojiImage(selected) : selected;
				if (disposed) return;
				const mediaType = convert ? 'image/png' : emojiFileType(selected);
				if (!mediaType) return;
				url = URL.createObjectURL(blob);
				media = { url, mediaType };
			} catch {
				if (!disposed) failed = true;
			}
		}
		void prepare();
		return () => {
			disposed = true;
			if (url) URL.revokeObjectURL(url);
		};
	});
</script>

{#if media}
	<BluemojiMedia
		class={className}
		emoji={{ uri: 'preview', cid: 'preview', did: '', name: `:${name || 'preview'}:`, ...media }}
	/>
{:else if failed}
	<small class="error">{m.emojiCompressError()}</small>
{:else}
	<Spinner inline size="sm" />
{/if}
