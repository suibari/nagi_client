<script lang="ts">
	import type { NewsView } from '$lib/api/types';
	import { i18n, m } from '$lib/i18n/i18n.svelte';
	import LinkCard from '$lib/components/LinkCard.svelte';
	import ReactionBar from '$lib/components/ReactionBar.svelte';
	import BookmarkActions from '$lib/components/BookmarkActions.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import { composerHost } from '$lib/post/composer-host.svelte';
	import { safeNewsUrl } from './bot-post';
	import { safeNewsImageUrl } from './image';
	import { quoteNews, shareNews } from './actions';

	/**
	 * 右サイドバーの botたんニュース。botたんラジオ（RadioContent）と同じ枠・見出し・
	 * タイトル・コメント・リンクカードの並びにそろえ、ニュースだけの操作行を下に足す。
	 */
	let { news, unread = false }: { news: NewsView; unread?: boolean } = $props();

	const dateLabel = $derived(
		new Intl.DateTimeFormat(i18n.locale === 'ja' ? 'ja-JP' : 'en-US', {
			timeZone: 'Asia/Tokyo',
			dateStyle: 'long',
			timeStyle: 'short',
		}).format(new Date(news.createdAt)),
	);
	const source = $derived(news.sourceName ?? m.newsSourceUnknown());
	const articleUrl = $derived(safeNewsUrl(news.url));
	const thumb = $derived(safeNewsImageUrl(news.image));

	let reactionPickerOpen = $state(false);
	let reactionButton = $state<HTMLButtonElement>();
	let copied = $state(false);
	let shareError = $state('');

	function toggleReactionPicker() {
		if (!$session) {
			location.href = '/login';
			return;
		}
		reactionPickerOpen = !reactionPickerOpen;
	}
	async function share() {
		shareError = '';
		try {
			if (!(await shareNews(news))) return;
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			shareError = m.newsShareFailed();
		}
	}
</script>

<div class="news-content" class:is-unread={unread}>
	<div class="news-heading">
		<div class="news-station">
			<Icon name="newspaper" size={14} /><span>{m.sidebarNewsTitle()}</span>
		</div>
		<time datetime={news.createdAt}>{dateLabel}</time>
	</div>
	<div class="news-title">
		<strong title={news.title}>{news.title}</strong><span>{source}</span>
	</div>
	{#if news.botComment}<p class="news-comment">{news.botComment}</p>{/if}
	{#if articleUrl}
		<div class="news-link-card">
			<LinkCard card={{ uri: articleUrl, title: news.title, description: source, thumb }} />
		</div>
	{/if}
	<ReactionBar
		uri={news.uri}
		cid={news.cid}
		reactions={news.reactions}
		showReactors={false}
		bind:pickerOpen={reactionPickerOpen}
		pickerAnchor={reactionButton}
	/>
	<div class="news-actions">
		<button
			class="primary news-quote"
			class:active={composerHost.open && composerHost.quoteTarget?.news?.uri === news.uri}
			type="button"
			onclick={() => quoteNews(news)}><Icon name="quote" size={15} />{m.newsComment()}</button
		>
		<button
			bind:this={reactionButton}
			class="ghost icon-action timeline-action"
			class:active={reactionPickerOpen}
			type="button"
			aria-label={m.addReactionAria()}
			title={m.addReactionAria()}
			aria-expanded={reactionPickerOpen}
			onclick={toggleReactionPicker}><Icon name="emojiPlus" size={17} /></button
		>
		<BookmarkActions subject={{ kind: 'news', uri: news.uri }} />
		{#if articleUrl}<button
				class="ghost icon-action timeline-action"
				type="button"
				onclick={share}
				aria-label={copied ? m.newsCopied() : m.newsShare()}
				title={copied ? m.newsCopied() : m.newsShare()}><Icon name="share" size={17} /></button
			>{/if}
		<a class="news-more" href="/news">{m.sidebarNewsMore()}<Icon name="chevron" size={14} /></a>
	</div>
	{#if shareError}<p class="error" role="alert">{shareError}</p>{/if}
</div>

<style>
	/* 枠・見出し・文字サイズは RadioContent（sidebar）とそろえる。 */
	.news-content {
		background: var(--bg);
		border: 1px solid var(--line);
		border-radius: 16px;
		padding: 14px;
		font-size: 13px;
		min-width: 0;
	}
	.news-content.is-unread {
		box-shadow:
			inset 3px 0 0 var(--accent),
			var(--shadow-card);
	}
	.news-heading {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10px;
		gap: 8px 12px;
		color: var(--text);
	}
	.news-station {
		display: flex;
		align-items: center;
		gap: 6px;
		color: var(--text-muted);
		font-size: 11px;
	}
	.news-title {
		display: grid;
		gap: 2px;
		min-width: 0;
	}
	.news-title strong {
		display: -webkit-box;
		overflow: hidden;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow-wrap: anywhere;
		font-size: 14px;
	}
	.news-title span {
		color: var(--text-muted);
		font-size: 12px;
	}
	time {
		color: var(--text-muted);
		font-size: 11px;
		text-align: right;
		margin-left: auto;
	}
	.news-comment {
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		line-height: 1.65;
		margin: 10px 0;
		font-size: 13px;
	}
	.news-link-card :global(.link-card-copy strong) {
		font-size: 13px;
	}
	.news-link-card :global(.link-card-copy small) {
		font-size: 11px;
	}
	/* ラジオに無い、ニュースだけの操作行。サイドバー幅に1行で収める。 */
	.news-actions {
		display: flex;
		align-items: center;
		gap: 2px;
		margin-top: 8px;
		min-width: 0;
	}
	.news-actions .news-quote {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		min-height: 32px;
		margin-right: 4px;
		padding: 0.35rem 0.75rem;
		font-size: 12px;
	}
	.news-actions .icon-action {
		width: 32px;
		height: 32px;
	}
	.news-more {
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
	.news-more:hover {
		color: var(--accent-strong);
	}
	.error {
		margin: 6px 0 0;
		color: var(--danger);
		font-size: 12px;
	}
</style>
