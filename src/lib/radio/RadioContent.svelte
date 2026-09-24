<script lang="ts">
	import type { RadioTrack } from '$lib/api/types';
	import { i18n, m } from '$lib/i18n/i18n.svelte';
	import LinkCard from '$lib/components/LinkCard.svelte';
	import { radioSongCard } from './song-card';
	let { track }: { track: RadioTrack } = $props();
	const songCard = $derived(radioSongCard(track));
</script>

<div class="radio-content">
	<div class="radio-heading">
		<strong>{m.radioTitle()}</strong>
	</div>
	<p class="radio-comment">
		{(i18n.locale === 'en' ? track.commentEn : track.commentJa) || track.comment}
	</p>
	<div class="radio-song"><strong>{track.title}</strong><span>{track.artist}</span></div>
	{#if songCard}
		<div class="radio-song-card"><LinkCard card={songCard} /></div>
	{/if}
</div>

<style>
	/* 正方形のジャケットを切り抜かず、画像全体を見せる。 */
	.radio-song-card :global(.link-card > img) {
		width: 108px;
		height: 108px;
		object-fit: contain;
		align-self: center;
	}

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
