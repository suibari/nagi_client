<script lang="ts">
	import type { RadioTrack } from '$lib/api/types';
	import { i18n, m } from '$lib/i18n/i18n.svelte';
	import Button from '$lib/components/Button.svelte';
	import LinkCard from '$lib/components/LinkCard.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';
	import { radioSongCard } from './song-card';
	import { quoteRadio, radioComment, shareRadioTrack } from './share';
	let {
		track,
		unread = false,
		variant = 'sidebar',
	}: {
		track: RadioTrack;
		unread?: boolean;
		variant?: 'sidebar' | 'page';
	} = $props();
	const songCard = $derived(radioSongCard(track));
	let copied = $state(false);
	let shareError = $state('');
	async function share() {
		shareError = '';
		try {
			if (!(await shareRadioTrack(track))) return;
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			shareError = m.radioShareFailed();
		}
	}
	const dateLabel = $derived(
		new Intl.DateTimeFormat(i18n.locale === 'ja' ? 'ja-JP' : 'en-US', {
			timeZone: 'Asia/Tokyo',
			dateStyle: 'long',
			timeStyle: 'short',
		}).format(new Date(track.publishedAt)),
	);
</script>

<div class="radio-content" class:radio-page={variant === 'page'} class:is-unread={unread}>
	<div class="radio-heading">
		<div class="radio-station"><Icon name="music" size={14} /><span>{m.radioTitle()}</span></div>
		<time datetime={track.publishedAt}>{dateLabel}</time>
	</div>
	<div class="radio-title"><strong>{track.title}</strong><span>{track.artist}</span></div>
	<p class="radio-comment">{radioComment(track)}</p>
	{#if songCard}
		<div class="radio-song-card"><LinkCard card={songCard} /></div>
	{/if}
	<!-- ニュース（NewsSidebarContent）と同じ操作行。主ボタンはポスト、共有はアイコンで。 -->
	<div class="radio-actions">
		<Button
			variant="primary"
			size="sm"
			class="radio-post"
			type="button"
			onclick={() => quoteRadio(track)}><Icon name="quote" size={15} />{m.radioPost()}</Button
		>
		{#if songCard}<button
				class="ghost icon-action timeline-action"
				type="button"
				onclick={share}
				aria-label={copied ? m.radioCopied() : m.radioShare()}
				title={copied ? m.radioCopied() : m.radioShare()}><Icon name="share" size={17} /></button
			>{/if}
		{#if variant === 'sidebar'}
			<a class="radio-more" href="/radio">{m.radioMore()}<Icon name="chevron" size={14} /></a>
		{/if}
	</div>
	{#if shareError}<p class="error" role="alert">{shareError}</p>{/if}
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
		font-size: 13px;
		min-width: 0;
	}
	.radio-content.is-unread {
		box-shadow:
			inset 3px 0 0 var(--accent),
			var(--shadow-card);
	}
	.radio-heading {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10px;
		gap: 8px 12px;
		color: var(--text);
	}
	.radio-station {
		display: flex;
		align-items: center;
		gap: 6px;
		color: var(--text-muted);
		font-size: 11px;
	}
	.radio-title {
		display: grid;
		gap: 2px;
		min-width: 0;
	}
	.radio-title strong {
		overflow-wrap: anywhere;
		font-size: 14px;
	}
	.radio-title span {
		color: var(--text-muted);
		font-size: 12px;
	}
	time {
		color: var(--text-muted);
		font-size: 11px;
		text-align: right;
		margin-left: auto;
	}
	.radio-comment {
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		line-height: 1.65;
		margin: 10px 0;
		font-size: 13px;
	}
	/* ニュースの操作行（.news-actions）と同じ寸法。サイドバー幅に1行で収める。 */
	.radio-actions {
		display: flex;
		align-items: center;
		gap: 2px;
		margin-top: 8px;
		min-width: 0;
	}
	.radio-actions :global(.radio-post) {
		margin-right: 4px;
	}
	.radio-actions .icon-action {
		width: 32px;
		height: 32px;
	}
	.radio-more {
		display: inline-flex;
		align-items: center;
		gap: 2px;
		margin-left: auto;
		color: var(--text-muted);
		font-size: 11px;
		font-weight: 700;
		text-decoration: none;
		white-space: nowrap;
	}
	.radio-more:hover {
		color: var(--accent-strong);
	}
	.error {
		margin: 6px 0 0;
		color: var(--danger);
		font-size: 12px;
	}
	.radio-song-card :global(.link-card-copy strong) {
		font-size: 13px;
	}
	.radio-song-card :global(.link-card-copy small) {
		font-size: 11px;
	}
	.radio-page,
	.radio-page .radio-comment,
	.radio-page .radio-song-card :global(.link-card-copy strong) {
		font-size: 15px;
	}
	.radio-page .radio-title strong {
		font-size: 16px;
	}
	.radio-page .radio-title span {
		font-size: 14px;
	}
	.radio-page .radio-station,
	.radio-page time,
	.radio-page .radio-song-card :global(.link-card-copy small) {
		font-size: 12px;
	}
</style>
