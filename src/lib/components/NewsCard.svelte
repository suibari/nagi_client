<script lang="ts">
	import type { ActorView, NewsView } from '$lib/api/types';
	import { newsBotPost, safeNewsUrl } from '$lib/news/bot-post';
	import { NewsQuote } from '$lib/news/quote.svelte';
	import { m, dateLocale } from '$lib/i18n/i18n.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import { deleteOwnNews } from '$lib/atproto/records';
	import Icon from './shell/Icon.svelte';
	import ChatBubble from './ChatBubble.svelte';
	import { composerHost } from '$lib/post/composer-host.svelte';
	import ReactionBar from './ReactionBar.svelte';
	import BookmarkActions from './BookmarkActions.svelte';
	let {
		news,
		botActor,
		unread = false,
		embedded = false,
		clampTitle = true,
		reasonKeyword,
	}: {
		news: NewsView;
		botActor?: ActorView;
		/** 前回ニュース一覧を見た時点より新しいか。カード左端にマークを出す。 */
		unread?: boolean;
		/**
		 * 動的枠の「おすすめの理由」に出す単語。指定しなければラベル行ごと出ない
		 * （一覧・検索・プロフィール・カルーセルは従来どおり）。
		 */
		reasonKeyword?: string;
		/** 外側のセクション内に置くときは、カード自身の枠と影を持たせない。 */
		embedded?: boolean;
		/** カルーセルなど高さを揃える表示では、タイトルを2行に収める。 */
		clampTitle?: boolean;
	} = $props();
	const quote = new NewsQuote();
	let shared = $state(false);
	let shareError = $state('');
	let reactionPickerOpen = $state(false);
	let reactionButton = $state<HTMLButtonElement>();
	let deleting = $state(false);
	let deleted = $state(false);
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
	function toggleQuote() {
		if (!$session) {
			location.href = '/login';
			return;
		}
		composerHost.openQuoteNews(news);
	}
	function toggleReactionPicker() {
		if (!$session) {
			location.href = '/login';
			return;
		}
		reactionPickerOpen = !reactionPickerOpen;
	}
	async function removeNews() {
		if (deleting || !confirm(m.newsDeleteConfirm())) return;
		deleting = true;
		shareError = '';
		try {
			await deleteOwnNews(news.uri);
			deleted = true;
		} catch {
			shareError = m.newsDeleteFailed();
		} finally {
			deleting = false;
		}
	}
</script>

{#if !deleted}<article class="news-card" class:unread class:embedded>
		{#if reasonKeyword}<p class="news-reason">
				{m.newsRecommendedReason({ keyword: reasonKeyword })}
			</p>{/if}
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
		<h3
			class:clamped={clampTitle}
			class:has-submitter={Boolean(news.submittedBy)}
			title={news.title}
		>
			{news.title}
		</h3>
		{#if news.submittedBy}<a class="news-submitter" href={`/profile/${news.submittedBy.did}`}
				>{m.newsSubmittedBy({
					name: news.submittedBy.displayName ?? news.submittedBy.handle,
				})}</a
			>{/if}
		<ChatBubble post={botPost} displayOnly />
		<div class="news-footer">
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
					class:active={composerHost.open && composerHost.quoteTarget?.news?.uri === news.uri}
					type="button"
					onclick={toggleQuote}
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
					onclick={toggleReactionPicker}
				>
					<Icon name="emojiPlus" size={18} />
				</button>
				<BookmarkActions subject={{ kind: 'news', uri: news.uri }} />
				{#if news.submittedBy?.did === $session?.did}<button
						class="ghost icon-action timeline-action"
						type="button"
						disabled={deleting}
						onclick={() => void removeNews()}
						aria-label={m.newsDelete()}
						title={m.newsDelete()}><Icon name="trash" size={18} /></button
					>{/if}
				<button
					class="ghost icon-action timeline-action"
					type="button"
					onclick={share}
					aria-label={shared ? m.newsCopied() : m.newsShare()}
					title={shared ? m.newsCopied() : m.newsShare()}><Icon name="share" size={18} /></button
				>
			</div>
		</div>
		{#if shareError}<p class="error" role="alert">{shareError}</p>{/if}
	</article>{/if}

<style>
	.news-card {
		display: flex;
		flex-direction: column;
		min-inline-size: 0;
		max-inline-size: 100%;
		padding: 12px 0;
		border: 0;
		border-radius: 0;
		background: transparent;
		box-shadow: none;
	}
	/* 外枠を復活させず、未読だけ左のアクセントバーで示す。 */
	.news-reason {
		margin: 0 0 2px;
		font-size: 12px;
		color: var(--text-muted);
	}
	.news-card.unread {
		padding-inline-start: 12px;
		background: transparent;
		box-shadow: inset 3px 0 0 var(--accent);
	}
	.news-card.embedded {
		inline-size: 100%;
		block-size: 100%;
		box-sizing: border-box;
		border: 0;
		background: transparent;
		box-shadow: none;
	}
	.news-card.unread.embedded {
		padding-inline-start: 12px;
		background: transparent;
		box-shadow: inset 3px 0 0 var(--accent);
	}
	.news-meta {
		display: flex;
		gap: 0.65rem;
		min-inline-size: 0;
		color: var(--text-muted);
		font-size: 0.78rem;
	}
	.news-submitter {
		display: inline-block;
		align-self: flex-end;
		margin: 0 0 0.75rem;
		color: var(--text-muted);
		font-size: 0.8rem;
		font-weight: 650;
		text-decoration: none;
	}
	.news-submitter:hover {
		text-decoration: underline;
	}
	.news-meta > span {
		min-inline-size: 0;
		overflow-wrap: anywhere;
	}
	.news-meta time {
		margin-left: auto;
	}
	h3 {
		margin: 0.45rem 0 0.75rem;
		font-size: 1.08rem;
		line-height: 1.55;
		overflow-wrap: anywhere;
	}
	h3.clamped {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		min-block-size: 3.35rem;
		overflow: hidden;
	}
	h3.has-submitter {
		margin-bottom: 0.2rem;
	}
	.news-footer {
		margin-top: auto;
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
