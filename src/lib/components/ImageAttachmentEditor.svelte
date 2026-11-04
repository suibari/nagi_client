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
		hideFirst = false,
		// 記事の入力欄の中に出している画像など、一覧に出さない添付の id。
		hiddenIds,
	}: {
		attachments: ImageAttachment[];
		disabled?: boolean;
		hideFirst?: boolean;
		hiddenIds?: ReadonlySet<string>;
	} = $props();
	let visibleAttachments = $derived(
		attachments.filter(
			(attachment, index) => !(hideFirst && index === 0) && !hiddenIds?.has(attachment.id),
		),
	);
	/** 一覧に出している添付だけを並べ替え、出していない添付の位置はそのままにする。 */
	function reorder(next: ImageAttachment[]) {
		const visible = new Set(visibleAttachments.map((attachment) => attachment.id));
		let index = 0;
		attachments = attachments.map((attachment) =>
			visible.has(attachment.id) ? next[index++] : attachment,
		);
	}
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

	onDestroy(() => tracked.forEach(releaseImage));
</script>

{#if visibleAttachments.length}
	<div class="attachment-editor">
		<SortableImageList items={visibleAttachments} {disabled} onreorder={reorder}>
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
