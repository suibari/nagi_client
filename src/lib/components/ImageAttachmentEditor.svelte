<script lang="ts">
	import { onDestroy } from 'svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import {
		ImageProcessingError,
		MAX_IMAGE_COUNT,
		processImage,
		releaseImage,
		type ImageAttachment,
	} from '$lib/images';
	import Icon from './shell/Icon.svelte';
	import SortableImageList from './SortableImageList.svelte';
	import ContentWarningMask from './ContentWarningMask.svelte';

	let {
		attachments = $bindable(),
		disabled = false,
	}: { attachments: ImageAttachment[]; disabled?: boolean } = $props();
	let processing = $state(false);
	let errors = $state<string[]>([]);
	let input: HTMLInputElement;
	let tracked = new Map<string, ImageAttachment>();

	$effect(() => {
		const current = new Map(attachments.map((attachment) => [attachment.id, attachment]));
		for (const [id, attachment] of tracked) {
			if (!current.has(id)) releaseImage(attachment);
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
		const available = MAX_IMAGE_COUNT - attachments.length;
		if (files.length > available) errors = [m.postImageCountError()];
		if (available <= 0) return;
		processing = true;
		try {
			for (const file of files.slice(0, available)) {
				try {
					attachments = [...attachments, await processImage(file)];
				} catch (error) {
					errors = [...errors, errorMessage(file, error)];
				}
			}
		} finally {
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

	function remove(id: string) {
		attachments = attachments.filter((item) => item.id !== id);
	}

	function setAlt(id: string, alt: string) {
		const limited = [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(alt)]
			.slice(0, 1000)
			.map((segment) => segment.segment)
			.join('');
		attachments = attachments.map((item) => (item.id === id ? { ...item, alt: limited } : item));
	}

	function toggleContentWarning(id: string) {
		attachments = attachments.map((item) =>
			item.id === id ? { ...item, contentWarning: !item.contentWarning || undefined } : item,
		);
	}

	onDestroy(() => tracked.forEach(releaseImage));
</script>

<div class="attachment-editor">
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
		aria-label={processing ? m.postImageProcessing() : m.postImageAdd()}
		title={processing ? m.postImageProcessing() : m.postImageAdd()}
		onclick={() => input.click()}
	>
		<Icon name="image" size={18} />
		<span>{attachments.length}/{MAX_IMAGE_COUNT}</span>
	</button>
	{#if attachments.length}
		<SortableImageList bind:items={attachments} {disabled}>
			{#snippet children(attachment)}
				<div class="attachment-preview">
					{#if attachment.contentWarning}
						<ContentWarningMask kind="image" interactive={false}
							><img src={attachment.previewUrl} alt="" /></ContentWarningMask
						>
					{:else}
						<img src={attachment.previewUrl} alt="" />
					{/if}
					<button
						class="attachment-remove"
						type="button"
						aria-label={m.postImageRemove()}
						{disabled}
						onclick={() => remove(attachment.id)}><Icon name="close" size={16} /></button
					>
				</div>
				<button
					class="ghost attachment-cw"
					class:active={attachment.contentWarning}
					type="button"
					aria-pressed={Boolean(attachment.contentWarning)}
					{disabled}
					onclick={() => toggleContentWarning(attachment.id)}
					><Icon name="warning" size={16} /><span>{m.contentWarningImage()}</span></button
				>
				<label>
					<span>{m.postImageAltLabel()}</span>
					<input
						type="text"
						value={attachment.alt}
						maxlength="10000"
						{disabled}
						oninput={(event) =>
							setAlt(attachment.id, (event.currentTarget as HTMLInputElement).value)}
						placeholder={m.postImageAltPlaceholder()}
					/>
				</label>
			{/snippet}
		</SortableImageList>
	{/if}
	{#each errors as error}<p class="error attachment-error" role="alert">{error}</p>{/each}
</div>
