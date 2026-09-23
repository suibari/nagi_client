<script lang="ts">
	import type { RadioTrack } from '$lib/api/types';
	import { m } from '$lib/i18n/i18n.svelte';
	import LinkCard from '$lib/components/LinkCard.svelte';
	let { track }: { track: RadioTrack } = $props();
	const videoCard = $derived({
		uri: `https://www.youtube.com/watch?v=${track.videoId}`,
		title: `${track.artist} - ${track.title}`,
		thumb: `https://i.ytimg.com/vi/${track.videoId}/hqdefault.jpg`,
	});
	const sourceUrl = $derived(
		/^https?:\/\//.test(track.sourceUrl ?? '') ? track.sourceUrl : undefined,
	);
</script>

<div class="radio-content">
	<div class="radio-heading">
		<img src="/bot_dj_laugh.webp" alt="" width="48" height="48" /><strong
			>{m.radioTitle()}</strong
		>
	</div>
	<p class="radio-comment">{track.comment}</p>
	<div class="radio-song"><strong>{track.title}</strong><span>{track.artist}</span></div>
	{#if /^[A-Za-z0-9_-]{11}$/.test(track.videoId)}
		<LinkCard card={videoCard} />
		{#if sourceUrl}<a class="radio-link" href={sourceUrl} target="_blank" rel="noopener noreferrer"
				>{m.radioSource()}</a
			>{/if}
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
	.radio-heading img {
		object-fit: contain;
		width: 40px;
		height: 40px;
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
	.radio-link {
		display: inline-block;
		margin: 9px 10px 0 0;
		font-size: 12px;
		color: var(--accent-strong);
	}
</style>
