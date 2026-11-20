<script lang="ts">
	import Spinner from '$lib/components/Spinner.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import { MAX_IMAGE_COUNT, type ImageAttachment } from '$lib/images';
	import { processSelectedImage } from '$lib/image-selection';
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
		maxCount = MAX_IMAGE_COUNT,
		processing = $bindable(false),
	}: {
		attachments: ImageAttachment[];
		/** 画像の上限。ブログは standard.site に上限が無いので Infinity を渡す。 */
		maxCount?: number;
		processing?: boolean;
		/** allowVideo のとき、選んだ動画（1本まで）をここへ入れる。画像と併用できる。 */
		video?: VideoAttachment;
		allowVideo?: boolean;
		disabled?: boolean;
	} = $props();
	const accept = $derived(allowVideo && !video ? MEDIA_ACCEPT : IMAGE_ACCEPT);
	/** 画像が上限で、動画もこれ以上足せないときだけボタンを止める。 */
	const full = $derived(attachments.length >= maxCount && (!allowVideo || Boolean(video)));
	const addLabel = $derived(allowVideo ? m.postMediaAdd() : m.postImageAdd());
	let compressionProgress = $state<GifCompressionProgress | null>(null);
	let errors = $state<string[]>([]);
	const processingLabel = $derived(
		compressionProgress ? m.postGifProcessing(compressionProgress) : m.postImageProcessing(),
	);
	let input: HTMLInputElement;

	async function addFiles(files: File[]) {
		if (!files.length || processing) return;
		errors = [];
		const selection = splitMediaSelection(files, { allowVideo, hasVideo: Boolean(video) });
		if (selection.kind === 'error') {
			errors = [m.videoOnlyOne()];
			return;
		}
		if (selection.video) {
			const attachment = new VideoAttachment(selection.video);
			video = attachment;
			void attachment.start();
		}
		files = selection.images;
		if (!files.length) return;
		const available = maxCount - attachments.length;
		if (files.length > available) errors = [m.postImageCountError()];
		if (available <= 0) return;
		processing = true;
		try {
			for (const file of files.slice(0, available)) {
				compressionProgress = null;
				const result = await processSelectedImage(
					file,
					(progress) => (compressionProgress = progress),
				);
				if (result.image) attachments = [...attachments, result.image];
				else errors = [...errors, result.error];
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
		disabled={disabled || processing || full}
		aria-label={processing ? processingLabel : addLabel}
		title={processing ? processingLabel : addLabel}
		onclick={() => input.click()}
	>
		{#if processing}
			<Spinner inline size="sm" decorative />
			<span>{processingLabel}</span>
		{:else}
			<Icon name={allowVideo ? 'media' : 'image'} size={18} />
			<span
				>{Number.isFinite(maxCount)
					? `${attachments.length}/${maxCount}`
					: attachments.length || ''}</span
			>
		{/if}
	</button>
	<span class="visually-hidden" aria-live="polite">{processing ? processingLabel : ''}</span>
	{#each errors as error}<p class="error attachment-error" role="alert">{error}</p>{/each}
</div>
