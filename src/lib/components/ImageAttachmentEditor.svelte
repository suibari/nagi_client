<script lang="ts">
	import { onDestroy } from 'svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import { releaseImage, type ImageAttachment } from '$lib/images';
	import Icon from './shell/Icon.svelte';
	import SortableImageList from './SortableImageList.svelte';
	import ContentWarningMask from './ContentWarningMask.svelte';

	let {
		attachments = $bindable(),
		disabled = false,
	}: { attachments: ImageAttachment[]; disabled?: boolean } = $props();
	let tracked = new Map<string, ImageAttachment>();

	$effect(() => {
		const current = new Map(attachments.map((attachment) => [attachment.id, attachment]));
		for (const [id, attachment] of tracked) {
			if (!current.has(id)) releaseImage(attachment);
		}
		tracked = current;
	});

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

{#if attachments.length}
	<div class="attachment-editor">
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
	</div>
{/if}
