<script lang="ts" module>
	/** 編集開始時に投稿へ付いていた動画。blob は PDS のレコード側にあるので、alt と CW だけ持つ。 */
	export type ExistingVideoEdit = {
		thumbnail: string;
		alt: string;
		contentWarning?: boolean;
	};
</script>

<script lang="ts">
	import { m } from '$lib/i18n/i18n.svelte';
	import type { VideoAttachment } from '$lib/video-attachment.svelte';
	import ContentWarningMask from './ContentWarningMask.svelte';
	import VideoAttachmentEditor from './VideoAttachmentEditor.svelte';
	import Icon from './shell/Icon.svelte';

	let {
		existing = $bindable(),
		video = $bindable(),
		disabled = false,
		contentWarningEnabled = false,
	}: {
		existing: ExistingVideoEdit | undefined;
		video: VideoAttachment | undefined;
		disabled?: boolean;
		contentWarningEnabled?: boolean;
	} = $props();

	function setAlt(alt: string) {
		if (!existing) return;
		existing = {
			...existing,
			alt: [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(alt)]
				.slice(0, 1000)
				.map((segment) => segment.segment)
				.join(''),
		};
	}
</script>

{#if existing}
	<div class="existing-video">
		<div class="attachment-preview">
			{#if existing.contentWarning}
				<ContentWarningMask kind="image" interactive={false}
					><img src={existing.thumbnail} alt="" /></ContentWarningMask
				>
			{:else}
				<img src={existing.thumbnail} alt="" />
			{/if}
			<span class="existing-video-play" aria-hidden="true"><Icon name="play" size={18} /></span>
			<button
				class="attachment-remove"
				type="button"
				aria-label={m.videoRemove()}
				{disabled}
				onclick={() => (existing = undefined)}><Icon name="close" size={16} /></button
			>
		</div>
		{#if contentWarningEnabled}
			<button
				class="ghost attachment-cw"
				class:active={existing.contentWarning}
				type="button"
				aria-pressed={Boolean(existing.contentWarning)}
				{disabled}
				onclick={() =>
					existing && (existing = { ...existing, contentWarning: !existing.contentWarning })}
				><Icon name="warning" size={16} /><span>{m.contentWarningImage()}</span></button
			>
		{/if}
		<label>
			<span>{m.videoAltLabel()}</span>
			<input
				type="text"
				value={existing.alt}
				maxlength="10000"
				{disabled}
				oninput={(event) => setAlt((event.currentTarget as HTMLInputElement).value)}
				placeholder={m.videoAltPlaceholder()}
			/>
		</label>
	</div>
{:else}
	<VideoAttachmentEditor bind:video {disabled} {contentWarningEnabled} />
{/if}

<style>
	.existing-video {
		display: grid;
		gap: 8px;
		margin-top: 8px;
	}
	.existing-video .attachment-preview {
		position: relative;
		width: min(100%, 240px);
	}
	.existing-video-play {
		position: absolute;
		inset: 50% auto auto 50%;
		display: grid;
		place-items: center;
		width: 36px;
		height: 36px;
		padding-left: 3px;
		border-radius: 50%;
		background: rgb(0 0 0 / 62%);
		color: white;
		transform: translate(-50%, -50%);
		pointer-events: none;
	}
	.existing-video label {
		display: grid;
		gap: 4px;
		font-size: 13px;
	}
	.existing-video > button {
		justify-self: start;
	}
</style>
