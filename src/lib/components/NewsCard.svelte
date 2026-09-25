<script lang="ts">
	import type { ActorView, NewsView } from '$lib/api/types';
	import { newsBotPost, safeNewsUrl } from '$lib/news/bot-post';
	import { safeNewsImageUrl } from '$lib/news/image';
	import { NewsQuote } from '$lib/news/quote.svelte';
	import { m, dateLocale, localeReady, stableDateTime } from '$lib/i18n/i18n.svelte';
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
		reasonGenre,
		showImage = false,
		permalink,
	}: {
		news: NewsView;
		botActor?: ActorView;
		/** 前回ニュース一覧を見た時点より新しいか。カード左端にマークを出す。 */
		unread?: boolean;
		/**
		 * 動的枠の「おすすめの理由」に出す関心ジャンル。指定しなければラベル行ごと出ない
		 * （一覧・検索・プロフィール・カルーセルは従来どおり）。
		 */
		reasonGenre?: string;
		/** OGP画像を配信元から直接読み込む。ニュースページでだけ有効にする。 */
		showImage?: boolean;
		/** 外側のセクション内に置くときは、カード自身の枠と影を持たせない。 */
		embedded?: boolean;
		/** カルーセルなど高さを揃える表示では、タイトルを2行に収める。 */
		clampTitle?: boolean;
		/**
		 * この記事の Nagi 内ページ（`/news/<rkey>`）。渡すと見出しがそのリンクになる。
		 * 一覧からパーマリンクへ内部リンクが張られ、検索エンジンが sitemap 以外の
		 * 経路でも記事ページへ辿り着ける。
		 */
		permalink?: string;
	} = $props();
	const quote = new NewsQuote();
	let shared = $state(false);
	let shareError = $state('');
	let reactionPickerOpen = $state(false);
	let reactionButton = $state<HTMLButtonElement>();
	let deleting = $state(false);
	let deleted = $state(false);
	let safeUrl = $derived(safeNewsUrl(news.url));
	let safeImage = $derived(safeNewsImageUrl(news.image));
	let imageFailed = $state(false);
	let botPost = $derived(newsBotPost(news, botActor));
	// プリレンダとハイドレーション直後は JST・日本語で固定し、マウント後に閲覧者の
	// ロケールとタイムゾーンへ切り替える。固定しないとビルド(UTC)と閲覧者(JST)で
	// 時刻表示が9時間ずれ、全カードが静かに描き変わる。
	let publishedLabel = $derived(
		news.publishedAt
			? localeReady()
				? new Date(news.publishedAt).toLocaleString(dateLocale(), {
						month: 'short',
						day: 'numeric',
						hour: '2-digit',
						minute: '2-digit',
					})
				: stableDateTime(news.publishedAt)
			: '',
	);
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
		{#if reasonGenre}<p class="news-reason">
				<Icon name="heart" size={13} /><span>{m.newsRecommendedReason({ genre: reasonGenre })}</span
				>
			</p>{/if}
		<div class="news-meta">
			<span>{news.sourceName ?? m.newsSourceUnknown()}</span>{#if news.publishedAt}<time
					datetime={news.publishedAt}>{publishedLabel}</time
				>{/if}
		</div>
		<h3
			class:clamped={clampTitle}
			class:has-submitter={Boolean(news.submittedBy)}
			title={news.title}
		>
			{#if permalink}<a class="news-permalink-link" href={permalink}>{news.title}</a
				>{:else}{news.title}{/if}
		</h3>
		{#if showImage && safeImage && safeUrl && !imageFailed}<a
				class="news-image"
				href={safeUrl}
				target="_blank"
				rel="noopener noreferrer"
				><img
					src={safeImage}
					alt=""
					loading="lazy"
					decoding="async"
					referrerpolicy="no-referrer"
					onerror={() => (imageFailed = true)}
				/></a
			>{/if}
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
				showReactors={false}
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
	/* おすすめの理由は、通常カードと見分けられるようアクセント色のピルで出す。 */
	.news-reason {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		align-self: flex-start;
		max-inline-size: 100%;
		margin: 0 0 6px;
		padding: 2px 10px 2px 8px;
		border: 1px solid var(--accent-border);
		border-radius: 999px;
		background: var(--accent-soft);
		color: var(--accent-strong);
		font-size: 12px;
		font-weight: 700;
		line-height: 1.5;
	}
	.news-reason span {
		min-inline-size: 0;
		overflow-wrap: anywhere;
	}
	.news-reason :global(svg) {
		flex: none;
	}
	/* 外枠を復活させず、未読だけ左のアクセントバーで示す。 */
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
	.news-image {
		display: block;
		inline-size: 100%;
		aspect-ratio: 1.91 / 1;
		margin-block: 8px 12px;
		overflow: hidden;
		border: 1px solid var(--line);
		border-radius: var(--r-md);
		background: var(--surface-soft);
	}
	.news-image img {
		display: block;
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}
	h3 {
		margin: 0.45rem 0 0.75rem;
		font-size: 1.08rem;
		line-height: 1.55;
		overflow-wrap: anywhere;
	}
	.news-card h3 :global(a.news-permalink-link) {
		color: inherit;
		text-decoration: none;
	}
	.news-card h3 :global(a.news-permalink-link):hover,
	.news-card h3 :global(a.news-permalink-link):focus-visible {
		text-decoration: underline;
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
