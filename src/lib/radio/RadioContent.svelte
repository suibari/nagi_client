<script lang="ts">
	import type { RadioTrack } from '$lib/api/types';
	import { i18n, m } from '$lib/i18n/i18n.svelte';
	import LinkCard from '$lib/components/LinkCard.svelte';
	let { track }: { track: RadioTrack } = $props();
	const videoCard = $derived({
		uri: `https://www.youtube.com/watch?v=${track.videoId}`,
		title: `${track.artist} - ${track.title}`,
		thumb: `https://i.ytimg.com/vi/${track.videoId}/hqdefault.jpg`,
	});
</script>

<div class="radio-content">
	<div class="radio-heading">
		<strong>{m.radioTitle()}</strong>
	</div>
	<p class="radio-comment">
		{(i18n.locale === 'en' ? track.commentEn : track.commentJa) || track.comment}
	</p>
	<div class="radio-song"><strong>{track.title}</strong><span>{track.artist}</span></div>
	{#if /^[A-Za-z0-9_-]{11}$/.test(track.videoId)}
		<LinkCard card={videoCard} />
	{/if}
</div>

<style>
	.radio-content {
		background: var(--bg);
		border: 1px solid var(--line);
		border-radius: 16px;
		padding: 14px;
		min-width: 0;
	}
	.radio-heading {
		display: flex;
		align-items: center;
		gap: 8px;
		color: var(--text);
		font-size: 16px;
	}
	.radio-comment {
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		line-height: 1.65;
		margin: 12px 0;
	}
	.radio-song {
		display: grid;
		gap: 2px;
		margin: 0 0 10px;
	}
	.radio-song strong {
		overflow-wrap: anywhere;
	}
	.radio-song span {
		color: var(--text-muted);
		font-size: 13px;
	}
</style>
