<script lang="ts">
	import type { ActorView, NewsView, PostView } from '$lib/api/types';
	import { createPost, preparePostDraft, uploadPostAssets } from '$lib/atproto/records';
	import { crosspostToBluesky } from '$lib/crosspost/bluesky';
	import { getCrosspostEnabled, hasCrosspostScope } from '$lib/crosspost/preferences';
	import { session } from '$lib/oauth/session.svelte';
	import { m, dateLocale } from '$lib/i18n/i18n.svelte';
	import Icon from './shell/Icon.svelte';
	import ChatBubble from './ChatBubble.svelte';
	import ReactionBar from './ReactionBar.svelte';
	let { news, botActor }: { news: NewsView; botActor?: ActorView } = $props();
	let composing = $state(false),
		text = $state(''),
		busy = $state(false),
		error = $state(''),
		shared = $state(false);
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
		composing = !composing;
		error = '';
	}
	async function quote() {
		if (!$session || !text.trim() || busy) return;
		busy = true;
		error = '';
		const draft = preparePostDraft(
			text,
			undefined,
			{ uri: news.uri, cid: news.cid },
			[],
			[{ uri: news.url, title: news.title }],
		);
		try {
			const assets = await uploadPostAssets(draft);
			await createPost(draft, assets);
			if (getCrosspostEnabled() && (await hasCrosspostScope()))
				await crosspostToBluesky(draft, assets).catch((e) => {
					error = m.crosspostWarning({
						reason: e instanceof Error ? e.message : m.crosspostFailed(),
					});
				});
			text = '';
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
	{#if composing}<div class="news-composer">
			<label
				>{m.newsQuoteLabel()}<textarea
					bind:value={text}
					maxlength="3000"
					placeholder={m.quotePlaceholder()}
					disabled={busy}
				></textarea></label
			>
			<div>
				<button class="ghost" type="button" onclick={() => (composing = false)}>{m.cancel()}</button
				><button class="primary" type="button" disabled={busy || !text.trim()} onclick={quote}
					>{busy ? m.composerSubmitting() : m.composerSubmit()}</button
				>
			</div>
		</div>{/if}
	{#if error}<p class="error" role="alert">{error}</p>{/if}
</article>

<style>
	.news-card {
		padding: 1rem 1.1rem;
		border: 1px solid var(--line);
		border-radius: var(--radius-l);
		background: var(--bg-raised);
		box-shadow: var(--shadow-card);
	}
	.news-meta {
		display: flex;
		gap: 0.65rem;
		color: var(--text-muted);
		font-size: 0.78rem;
	}
	.news-meta time {
		margin-left: auto;
	}
	h2 {
		font-size: 1.08rem;
		line-height: 1.55;
		margin: 0.45rem 0 0.75rem;
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
	.news-composer {
		margin-top: 0.75rem;
	}
	.news-composer label {
		display: grid;
		gap: 0.35rem;
		font-size: 0.85rem;
	}
	.news-composer textarea {
		min-height: 6rem;
		resize: vertical;
		padding: 0.7rem;
		border: 1px solid var(--line);
		border-radius: 0.7rem;
		background: var(--bg-raised);
		color: var(--text);
	}
	.news-composer > div {
		display: flex;
		justify-content: flex-end;
		gap: 0.4rem;
		margin-top: 0.45rem;
	}
	.error {
		color: var(--danger);
	}
</style>
