<script lang="ts">
	import { m } from '$lib/i18n/i18n.svelte';
	import {
		ImageProcessingError,
		MAX_IMAGE_COUNT,
		processImage,
		type ImageAttachment,
	} from '$lib/images';
	import type { GifCompressionProgress } from '$lib/gif-compression';
	import Icon from './shell/Icon.svelte';

	let {
		attachments = $bindable(),
		disabled = false,
	}: { attachments: ImageAttachment[]; disabled?: boolean } = $props();
	let processing = $state(false);
	let compressionProgress = $state<GifCompressionProgress | null>(null);
	let errors = $state<string[]>([]);
	const processingLabel = $derived(
		compressionProgress ? m.postGifProcessing(compressionProgress) : m.postImageProcessing(),
	);
	let input: HTMLInputElement;

	function errorMessage(file: File, error: unknown) {
		const name = file.name || m.postPastedImageName();
		if (!(error instanceof ImageProcessingError)) return m.imageProcessFailedNamed({ name });
		if (error.code === 'type') return m.postImageTypeError({ name });
		if (error.code === 'input-size') return m.postImageInputSizeError({ name });
		if (error.code === 'gif-size') return m.postGifSizeError({ name });
		return m.postImageCompressError({ name });
	}

	async function addFiles(files: File[]) {
		if (!files.length || processing) return;
		errors = [];
		const available = MAX_IMAGE_COUNT - attachments.length;
		if (files.length > available) errors = [m.postImageCountError()];
		if (available <= 0) return;
		processing = true;
		try {
			for (const file of files.slice(0, available)) {
				compressionProgress = null;
				try {
					attachments = [
						...attachments,
						await processImage(file, (progress) => (compressionProgress = progress)),
					];
				} catch (error) {
					errors = [...errors, errorMessage(file, error)];
				}
			}
		} finally {
			compressionProgress = null;
			processing = false;
		}
	}

	async function choose(event: Event) {
		const files = [...((event.currentTarget as HTMLInputElement).files ?? [])];
		await addFiles(files);
		input.value = '';
	}

	export function handlePaste(event: ClipboardEvent) {
		if (disabled || !event.clipboardData) return;
		const itemFiles = [...event.clipboardData.items]
			.filter((item) => item.kind === 'file' && item.type.startsWith('image/'))
			.flatMap((item) => {
				const file = item.getAsFile();
				return file ? [file] : [];
			});
		const files = itemFiles.length
			? itemFiles
			: [...event.clipboardData.files].filter((file) => file.type.startsWith('image/'));
		if (!files.length) return;
		// 画像と一緒に入っている HTML や代替テキストを本文へ貼り付けない。
		event.preventDefault();
		if (processing) return;
		void addFiles(files);
	}
</script>

<div class="attachment-picker">
	<input
		class="visually-hidden"
		bind:this={input}
		type="file"
		accept="image/jpeg,image/png,image/webp,image/gif"
		multiple
		onchange={choose}
	/>
	<button
		class="ghost attachment-add"
		type="button"
		disabled={disabled || processing || attachments.length >= MAX_IMAGE_COUNT}
		aria-label={processing ? processingLabel : m.postImageAdd()}
		title={processing ? processingLabel : m.postImageAdd()}
		onclick={() => input.click()}
	>
		{#if processing}
			<span class="attachment-processing-spinner" aria-hidden="true"></span>
			<span>{processingLabel}</span>
		{:else}
			<Icon name="image" size={18} />
			<span>{attachments.length}/{MAX_IMAGE_COUNT}</span>
		{/if}
	</button>
	<span class="visually-hidden" aria-live="polite">{processing ? processingLabel : ''}</span>
	{#each errors as error}<p class="error attachment-error" role="alert">{error}</p>{/each}
</div>
