<script lang="ts">
	import type { ActorView, NewsView } from '$lib/api/types';
	import { newsBotPost, safeNewsUrl } from '$lib/news/bot-post';
	import { NewsQuote } from '$lib/news/quote.svelte';
	import { m, dateLocale } from '$lib/i18n/i18n.svelte';
	import Icon from './shell/Icon.svelte';
	import ChatBubble from './ChatBubble.svelte';
	import InlinePostComposer from './InlinePostComposer.svelte';
	import ReactionBar from './ReactionBar.svelte';
	let {
		news,
		botActor,
		unread = false,
	}: {
		news: NewsView;
		botActor?: ActorView;
		/** 前回ニュース一覧を見た時点より新しいか。カード左端にマークを出す。 */
		unread?: boolean;
	} = $props();
	const quote = new NewsQuote();
	let shared = $state(false);
	let shareError = $state('');
	let reactionPickerOpen = $state(false);
	let reactionButton = $state<HTMLButtonElement>();
	let safeUrl = $derived(safeNewsUrl(news.url));
	let botPost = $derived(newsBotPost(news, botActor));
	async function share() {
		if (!safeUrl) return;
		try {
			if (navigator.share) await navigator.share({ title: news.title, url: safeUrl });
			else {
				await navigator.clipboard.writeText(safeUrl);
				shared = true;
				setTimeout(() => (shared = false), 2000);
			}
		} catch (e) {
			if ((e as DOMException)?.name !== 'AbortError') shareError = m.newsShareFailed();
		}
	}
</script>

<article class="news-card" class:unread>
	<div class="news-meta">
		<span>{news.sourceName ?? m.newsSourceUnknown()}</span>{#if news.publishedAt}<time
				>{new Date(news.publishedAt).toLocaleString(dateLocale(), {
					month: 'short',
					day: 'numeric',
					hour: '2-digit',
					minute: '2-digit',
				})}</time
			>{/if}
	</div>
	<h3>{news.title}</h3>
	<ChatBubble post={botPost} displayOnly />
	<ReactionBar
		uri={news.uri}
		cid={news.cid}
		reactions={news.reactions}
		bind:pickerOpen={reactionPickerOpen}
		pickerAnchor={reactionButton}
	/>
	<div class="news-actions">
		{#if safeUrl}<a
				class="primary news-read"
				href={safeUrl}
				target="_blank"
				rel="noopener noreferrer">{m.newsReadArticle()}</a
			>{/if}
		<button
			class="ghost icon-action timeline-action"
			type="button"
			onclick={() => quote.toggle()}
			aria-label={m.newsQuote()}
			title={m.newsQuote()}><Icon name="quote" size={18} /></button
		>
		<button
			bind:this={reactionButton}
			class="ghost icon-action timeline-action"
			class:active={reactionPickerOpen}
			type="button"
			aria-label={m.addReactionAria()}
			title={m.addReactionAria()}
			aria-expanded={reactionPickerOpen}
			onclick={() => (reactionPickerOpen = !reactionPickerOpen)}
		>
			<Icon name="emojiPlus" size={18} />
		</button>
		<button
			class="ghost icon-action timeline-action"
			type="button"
			onclick={share}
			aria-label={shared ? m.newsCopied() : m.newsShare()}
			title={shared ? m.newsCopied() : m.newsShare()}><Icon name="share" size={18} /></button
		>
	</div>
	{#if quote.composing}<InlinePostComposer
			id={`news-quote-${news.cid}`}
			label={m.newsQuoteLabel()}
			placeholder={m.quotePlaceholder()}
			bind:text={quote.text}
			bind:mentions={quote.mentions}
			bind:channels={quote.channels}
			bind:emojis={quote.emojis}
			channelSuggestionsEnabled
			bind:attachments={quote.attachments}
			bind:linkCards={quote.linkCards}
			busy={quote.busy}
			error={quote.error}
			onsubmit={() => void quote.submit(news)}
			oncancel={() => quote.cancel()}
		/>{/if}
	{#if shareError}<p class="error" role="alert">{shareError}</p>{/if}
</article>

<style>
	.news-card {
		min-inline-size: 0;
		max-inline-size: 100%;
		padding: 0.75rem;
		border: 1px solid var(--line);
		border-radius: var(--radius-l);
		background: var(--bg-raised);
		box-shadow: var(--shadow-card);
	}
	/* 未読は通知カードと同じ左のアクセントバー＋淡い地色。既読化後も表示中は残る。 */
	.news-card.unread {
		background: var(--accent-softer);
		box-shadow:
			inset 3px 0 0 var(--accent),
			var(--shadow-card);
	}
	.news-meta {
		display: flex;
		gap: 0.65rem;
		min-inline-size: 0;
		color: var(--text-muted);
		font-size: 0.78rem;
	}
	.news-meta > span {
		min-inline-size: 0;
		overflow-wrap: anywhere;
	}
	.news-meta time {
		margin-left: auto;
	}
	h3 {
		font-size: 1.08rem;
		line-height: 1.55;
		margin: 0.45rem 0 0.75rem;
		overflow-wrap: anywhere;
	}
	.news-actions {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		flex-wrap: wrap;
		margin-top: 0.5rem;
	}
	.news-actions .news-read {
		display: inline-flex;
		align-items: center;
		min-height: 36px;
		padding: 0.45rem 0.9rem;
		text-decoration: none;
	}
	.news-actions .icon-action {
		width: 36px;
		height: 36px;
	}
	.error {
		color: var(--danger);
	}
</style>
