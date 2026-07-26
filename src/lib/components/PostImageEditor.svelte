<script lang="ts">
	import { onDestroy } from 'svelte';
	import { APPVIEW_URL } from '$lib/api/appview';
	import { m } from '$lib/i18n/i18n.svelte';
	import {
		ImageProcessingError,
		MAX_IMAGE_COUNT,
		processImage,
		releaseImage,
		type PostEditImage,
	} from '$lib/images';
	import Icon from './shell/Icon.svelte';
	import SortableImageList from './SortableImageList.svelte';

	let {
		images = $bindable(),
		disabled = false,
		processing = $bindable(false),
	}: { images: PostEditImage[]; disabled?: boolean; processing?: boolean } = $props();

	let errors = $state<string[]>([]);
	let input: HTMLInputElement;
	let tracked = new Map<string, Extract<PostEditImage, { kind: 'new' }>>();
	let destroyed = false;

	const resolve = (url: string) => (url.startsWith('/') ? APPVIEW_URL + url : url);

	$effect(() => {
		const current = new Map(
			images
				.filter((image): image is Extract<PostEditImage, { kind: 'new' }> => image.kind === 'new')
				.map((image) => [image.id, image]),
		);
		for (const [id, image] of tracked) {
			if (!current.has(id)) releaseImage(image);
		}
		tracked = current;
	});

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
		const available = MAX_IMAGE_COUNT - images.length;
		if (files.length > available) errors = [m.postImageCountError()];
		if (available <= 0) return;
		processing = true;
		try {
			for (const file of files.slice(0, available)) {
				try {
					const image = await processImage(file);
					if (destroyed) {
						releaseImage(image);
						break;
					}
					images = [...images, { kind: 'new', ...image }];
				} catch (error) {
					if (destroyed) break;
					errors = [...errors, errorMessage(file, error)];
				}
			}
		} finally {
			if (!destroyed) processing = false;
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
		event.preventDefault();
		if (processing) return;
		void addFiles(files);
	}

	function remove(id: string) {
		images = images.filter((image) => image.id !== id);
	}

	function setAlt(id: string, alt: string) {
		const limited = [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(alt)]
			.slice(0, 1000)
			.map((segment) => segment.segment)
			.join('');
		images = images.map((image) => (image.id === id ? { ...image, alt: limited } : image));
	}

	onDestroy(() => {
		destroyed = true;
		processing = false;
		tracked.forEach(releaseImage);
	});
</script>

<div class="attachment-editor post-image-editor">
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
		disabled={disabled || processing || images.length >= MAX_IMAGE_COUNT}
		aria-label={processing ? m.postImageProcessing() : m.postImageAdd()}
		title={processing ? m.postImageProcessing() : m.postImageAdd()}
		onclick={() => input.click()}
	>
		<Icon name="image" size={18} />
		<span>{images.length}/{MAX_IMAGE_COUNT}</span>
	</button>
	{#if images.length}
		<SortableImageList bind:items={images} {disabled}>
			{#snippet children(image)}
				<div class="attachment-preview">
					<img
						src={image.kind === 'existing' ? resolve(image.previewUrl) : image.previewUrl}
						alt=""
					/>
					<button
						class="attachment-remove"
						type="button"
						aria-label={m.postImageRemove()}
						{disabled}
						onclick={() => remove(image.id)}><Icon name="close" size={16} /></button
					>
				</div>
				<label>
					<span>{m.postImageAltLabel()}</span>
					<input
						type="text"
						value={image.alt}
						maxlength="10000"
						{disabled}
						oninput={(event) => setAlt(image.id, (event.currentTarget as HTMLInputElement).value)}
						placeholder={m.postImageAltPlaceholder()}
					/>
				</label>
			{/snippet}
		</SortableImageList>
	{/if}
	{#each errors as error}<p class="error attachment-error" role="alert">{error}</p>{/each}
</div>
