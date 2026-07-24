<script lang="ts">
	import type { ActorView, NewsView, PostView } from '$lib/api/types';
	import {
		createPost,
		preparePostDraft,
		uploadPostAssets,
		type LinkCardDraft,
	} from '$lib/atproto/records';
	import type { MentionSelection } from '$lib/atproto/facets';
	import type { ImageAttachment } from '$lib/images';
	import { session } from '$lib/oauth/session.svelte';
	import { m, dateLocale } from '$lib/i18n/i18n.svelte';
	import Icon from './shell/Icon.svelte';
	import ChatBubble from './ChatBubble.svelte';
	import InlinePostComposer from './InlinePostComposer.svelte';
	import ReactionBar from './ReactionBar.svelte';
	let { news, botActor }: { news: NewsView; botActor?: ActorView } = $props();
	let composing = $state(false),
		text = $state(''),
		busy = $state(false),
		error = $state(''),
		shared = $state(false);
	let attachments = $state<ImageAttachment[]>([]);
	let linkCards = $state<LinkCardDraft[]>([]);
	let mentions = $state<MentionSelection[]>([]);
	let safeUrl = $derived.by(() => {
		try {
			const u = new URL(news.url);
			return ['http:', 'https:'].includes(u.protocol) ? u.href : undefined;
		} catch {
			return undefined;
		}
	});
	let botPost = $derived<PostView>({
		uri: `${news.uri}#bot-comment`,
		cid: news.cid,
		author: botActor ?? {
			did: 'did:unknown:bot-tan',
			handle: 'bot-tan',
			displayName: 'Botたん',
			isBot: true,
		},
		text: news.botComment,
		langs: [news.lang],
		createdAt: news.createdAt,
		indexedAt: news.indexedAt,
		reactions: [],
		isBot: true,
		isAffirmation: false,
	});
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
			if ((e as DOMException)?.name !== 'AbortError') error = m.newsShareFailed();
		}
	}
	function openQuote() {
		if (!$session) {
			location.href = '/login';
			return;
		}
		error = '';
		if (composing) cancelQuote();
		else composing = true;
	}
	function clearQuote() {
		text = '';
		attachments = [];
		linkCards = [];
		mentions = [];
	}
	function cancelQuote() {
		composing = false;
		clearQuote();
	}
	async function quote() {
		if (!$session || (!text.trim() && !attachments.length && !linkCards.length) || busy) return;
		busy = true;
		error = '';
		const draft = preparePostDraft(
			text,
			undefined,
			{ uri: news.uri, cid: news.cid },
			attachments,
			linkCards,
			mentions,
		);
		try {
			const assets = await uploadPostAssets(draft);
			// ニュース引用もNagi内レコードを参照するため、Blueskyへはクロスポストしない。
			await createPost(draft, assets);
			clearQuote();
			composing = false;
		} catch (e) {
			error = e instanceof Error ? e.message : m.postFailed();
		} finally {
			busy = false;
		}
	}
</script>

<article class="news-card">
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
	<h2>{news.title}</h2>
	<ChatBubble post={botPost} displayOnly />
	<ReactionBar uri={news.uri} cid={news.cid} reactions={news.reactions} />
	<div class="news-actions">
		{#if safeUrl}<a
				class="primary news-read"
				href={safeUrl}
				target="_blank"
				rel="noopener noreferrer">{m.newsReadArticle()}</a
			>{/if}
		<button
			class="ghost icon-action"
			type="button"
			onclick={openQuote}
			aria-label={m.newsQuote()}
			title={m.newsQuote()}><Icon name="quote" size={18} /></button
		>
		<button
			class="ghost icon-action"
			type="button"
			onclick={share}
			aria-label={shared ? m.newsCopied() : m.newsShare()}
			title={shared ? m.newsCopied() : m.newsShare()}><Icon name="share" size={18} /></button
		>
	</div>
	{#if composing}<InlinePostComposer
			id={`news-quote-${news.cid}`}
			label={m.newsQuoteLabel()}
			placeholder={m.quotePlaceholder()}
			bind:text
			bind:mentions
			bind:attachments
			bind:linkCards
			{busy}
			{error}
			onsubmit={() => void quote()}
			oncancel={cancelQuote}
		/>{/if}
	{#if error && !composing}<p class="error" role="alert">{error}</p>{/if}
</article>

<style>
	.news-card {
		min-inline-size: 0;
		max-inline-size: 100%;
		padding: 1rem 1.1rem;
		border: 1px solid var(--line);
		border-radius: var(--radius-l);
		background: var(--bg-raised);
		box-shadow: var(--shadow-card);
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
	h2 {
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
		margin-top: 0.85rem;
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
