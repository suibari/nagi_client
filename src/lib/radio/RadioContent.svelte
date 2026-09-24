<script lang="ts">
	import type { RadioTrack } from '$lib/api/types';
	import { i18n, m } from '$lib/i18n/i18n.svelte';
	import LinkCard from '$lib/components/LinkCard.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';
	import { radioSongCard } from './song-card';
	let { track, unread = false }: { track: RadioTrack; unread?: boolean } = $props();
	const songCard = $derived(radioSongCard(track));
	const dateLabel = $derived(new Intl.DateTimeFormat(i18n.locale === 'ja' ? 'ja-JP' : 'en-US', {
		timeZone: 'Asia/Tokyo', dateStyle: 'long', timeStyle: 'short',
	}).format(new Date(track.publishedAt)));
</script>

<div class="radio-content" class:is-unread={unread}>
	<div class="radio-heading">
		<div class="radio-station"><Icon name="music" size={18} /><span>{m.radioTitle()}</span></div>
		<div class="radio-title"><strong>{track.title}</strong><span>{track.artist}</span></div>
		<time datetime={track.publishedAt}>{dateLabel}</time>
	</div>
	<p class="radio-comment">
		{(i18n.locale === 'en' ? track.commentEn : track.commentJa) || track.comment}
	</p>
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
	.radio-content.is-unread {
		box-shadow: inset 3px 0 0 var(--accent), var(--shadow-card);
	}
	.radio-heading {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: start;
		gap: 8px 12px;
		color: var(--text);
	}
	.radio-station {
		display: none;
		align-items: center;
		gap: 6px;
		color: var(--text-muted);
		font-size: 12px;
	}
	.radio-title {
		display: grid;
		gap: 2px;
		min-width: 0;
	}
	.radio-title strong {
		overflow-wrap: anywhere;
		font-size: 16px;
	}
	.radio-title span {
		color: var(--text-muted);
		font-size: 13px;
	}
	time {
		color: var(--text-muted);
		font-size: 12px;
		text-align: right;
	}
	.radio-comment {
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		line-height: 1.65;
		margin: 12px 0;
	}
	@media (min-width: 900px) {
		.radio-heading {
			grid-template-columns: auto minmax(0, 1fr) auto;
			align-items: center;
		}
		.radio-station {
			display: flex;
		}
	}
</style>
