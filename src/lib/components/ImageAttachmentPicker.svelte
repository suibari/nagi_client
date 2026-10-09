<script lang="ts">
	import Spinner from '$lib/components/Spinner.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import {
		ImageProcessingError,
		MAX_IMAGE_COUNT,
		processImage,
		type ImageAttachment,
	} from '$lib/images';
	import type { GifCompressionProgress } from '$lib/gif-compression';
	import {
		IMAGE_ACCEPT,
		MEDIA_ACCEPT,
		pastedMediaFiles,
		splitMediaSelection,
	} from '$lib/media-selection';
	import { VideoAttachment } from '$lib/video-attachment.svelte';
	import Icon from './shell/Icon.svelte';

	let {
		attachments = $bindable(),
		video = $bindable(),
		allowVideo = false,
		disabled = false,
	}: {
		attachments: ImageAttachment[];
		/** allowVideo のとき、選んだ動画をここへ入れる。画像とは同時に付けない。 */
		video?: VideoAttachment;
		allowVideo?: boolean;
		disabled?: boolean;
	} = $props();
	const accept = $derived(allowVideo ? MEDIA_ACCEPT : IMAGE_ACCEPT);
	const addLabel = $derived(allowVideo ? m.postMediaAdd() : m.postImageAdd());
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
		if (!files.length || processing || video) return;
		errors = [];
		const selection = splitMediaSelection(files, {
			allowVideo,
			hasImages: attachments.length > 0,
		});
		if (selection.kind === 'error') {
			errors = [selection.reason === 'video-count' ? m.videoOnlyOne() : m.videoWithImages()];
			return;
		}
		if (selection.kind === 'video') {
			const attachment = new VideoAttachment(selection.file);
			video = attachment;
			void attachment.start();
			return;
		}
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
		const files = pastedMediaFiles(event.clipboardData, allowVideo);
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
		{accept}
		multiple
		onchange={choose}
	/>
	<button
		class="ghost attachment-add"
		type="button"
		disabled={disabled || processing || Boolean(video) || attachments.length >= MAX_IMAGE_COUNT}
		aria-label={processing ? processingLabel : addLabel}
		title={processing ? processingLabel : addLabel}
		onclick={() => input.click()}
	>
		{#if processing}
			<Spinner inline size="sm" decorative />
			<span>{processingLabel}</span>
		{:else}
			<Icon name={allowVideo ? 'media' : 'image'} size={18} />
			<span>{attachments.length}/{MAX_IMAGE_COUNT}</span>
		{/if}
	</button>
	<span class="visually-hidden" aria-live="polite">{processing ? processingLabel : ''}</span>
	{#each errors as error}<p class="error attachment-error" role="alert">{error}</p>{/each}
</div>
