<script lang="ts">
	import { m } from '$lib/i18n/i18n.svelte';
	import { SUPPORTED_VIDEO_TYPES } from '$lib/video';
	import { VideoAttachment } from '$lib/video-attachment.svelte';
	import Icon from './shell/Icon.svelte';

	let {
		video = $bindable(),
		disabled = false,
	}: { video: VideoAttachment | undefined; disabled?: boolean } = $props();
	let input: HTMLInputElement;

	function choose(event: Event) {
		const file = (event.currentTarget as HTMLInputElement).files?.[0];
		input.value = '';
		if (!file || video) return;
		const attachment = new VideoAttachment(file);
		video = attachment;
		void attachment.start();
	}
</script>

<div class="attachment-picker">
	<input
		class="visually-hidden"
		bind:this={input}
		type="file"
		accept={SUPPORTED_VIDEO_TYPES.join(',')}
		onchange={choose}
	/>
	<button
		class="ghost attachment-add"
		type="button"
		disabled={disabled || Boolean(video)}
		aria-label={m.videoAdd()}
		title={m.videoAdd()}
		onclick={() => input.click()}
	>
		<Icon name="video" size={18} />
	</button>
</div>
