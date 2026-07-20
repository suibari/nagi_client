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
		if (!(error instanceof ImageProcessingError))
			return m.imageProcessFailedNamed({ name: file.name });
		if (error.code === 'type') return m.postImageTypeError({ name: file.name });
		if (error.code === 'input-size') return m.postImageInputSizeError({ name: file.name });
		if (error.code === 'gif-size') return m.postGifSizeError({ name: file.name });
		return m.postImageCompressError({ name: file.name });
	}

	async function choose(event: Event) {
		const files = [...((event.currentTarget as HTMLInputElement).files ?? [])];
		if (!files.length || processing) return;
		errors = [];
		const available = MAX_IMAGE_COUNT - attachments.length;
		if (files.length > available) errors = [m.postImageCountError()];
		processing = true;
		for (const file of files.slice(0, available)) {
			try {
				attachments = [...attachments, await processImage(file)];
			} catch (error) {
				errors = [...errors, errorMessage(file, error)];
			}
		}
		processing = false;
		input.value = '';
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
		<div class="attachment-list">
			{#each attachments as attachment (attachment.id)}
				<div class="attachment-item">
					<div class="attachment-preview">
						<img src={attachment.previewUrl} alt="" />
						<button
							class="attachment-remove"
							type="button"
							aria-label={m.postImageRemove()}
							{disabled}
							onclick={() => remove(attachment.id)}><Icon name="close" size={16} /></button
						>
					</div>
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
				</div>
			{/each}
		</div>
	{/if}
	{#each errors as error}<p class="error attachment-error" role="alert">{error}</p>{/each}
</div>
