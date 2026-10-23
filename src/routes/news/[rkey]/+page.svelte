<script lang="ts">
	import { getNewsQuotes, getSimilarNews } from '$lib/api/appview';
	import type { ActorView, FeedItem, NewsView } from '$lib/api/types';
	import NewsCard from '$lib/components/NewsCard.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import ThreadUnit from '$lib/components/ThreadUnit.svelte';
	import { postedSignal } from '$lib/feed/posted-signal.svelte';
	import { i18n, m } from '$lib/i18n/i18n.svelte';
	import { safeNewsImageUrl } from '$lib/news/image';
	import { newsRkey } from '$lib/news/indexable';
	import { oauthReady } from '$lib/oauth/session.svelte';
	import { untrack } from 'svelte';

	let { data } = $props();

	/**
	 * 外からこのページへ直接来た人のための動線。記事1本で離脱させず、
	 * Nagi の中でこの話題がどう受け止められたか（みんなのコメント）と、
	 * 次に読める記事（似ているニュース）を記事の下に並べる。
	 * どちらもビューアごとに違う（ミュート・こっそり・年齢）ので、プリレンダせずに
	 * ハイドレーション後に取りに行く。
	 */
	let quotes = $state<FeedItem[]>([]);
	let quotesBotActor = $state<ActorView>();
	let quotesCursor = $state<string>();
	let quotesHasMore = $state(false);
	let quotesLoading = $state(true);
	let quotesError = $state('');
	let similar = $state<NewsView[]>([]);
	let loadedFor = '';

	const message = (cause: unknown) => (cause instanceof Error ? cause.message : m.loadFailed());

	// このページに並ぶのはこのニュースを引用した投稿だけなので、各投稿の引用カードは畳む。
	const withoutQuote = (item: FeedItem): FeedItem => ({ ...item, quote: undefined });

	async function loadQuotes(uri: string, more = false) {
		quotesLoading = true;
		quotesError = '';
		try {
			const page = await getNewsQuotes(uri, more ? quotesCursor : undefined);
			if (loadedFor !== uri) return;
			quotes = more ? [...quotes, ...page.items] : page.items;
			quotesBotActor = page.botActor ?? quotesBotActor;
			quotesCursor = page.cursor;
			quotesHasMore = page.hasMore;
		} catch (cause) {
			if (loadedFor === uri) quotesError = message(cause);
		} finally {
			if (loadedFor === uri) quotesLoading = false;
		}
	}

	async function loadSimilar(uri: string) {
		try {
			const page = await getSimilarNews(newsRkey(uri), i18n.locale);
			if (loadedFor === uri) similar = page.items;
		} catch {
			// 補助的な欄なので、取れなければ出さないだけにする。
			if (loadedFor === uri) similar = [];
		}
	}

	// 似ているニュースから別の記事へ移るとコンポーネントが使い回されるので、記事ごとに取り直す。
	$effect(() => {
		const uri = data.news.uri;
		if (!$oauthReady || loadedFor === uri) return;
		loadedFor = uri;
		quotes = [];
		similar = [];
		quotesCursor = undefined;
		quotesHasMore = false;
		void loadQuotes(uri);
		void loadSimilar(uri);
	});

	// ここからコメントしたら、その場で一覧に出す。
	let seenPosted = untrack(() => postedSignal.count);
	$effect(() => {
		if (postedSignal.count === seenPosted) return;
		seenPosted = postedSignal.count;
		if (loadedFor) void loadQuotes(loadedFor);
	});
</script>

<a class="news-back" href="/news">{m.newsBackToList()}</a>
<article class="news-permalink">
	<NewsCard news={data.news} botActor={data.botActor} showImage clampTitle={false} />
</article>

<section class="news-related" aria-labelledby="news-quotes-heading">
	<h2 id="news-quotes-heading">{m.newsQuotesHeading()}</h2>
	{#if quotes.length}
		<div class="news-quotes">
			{#each quotes as item (item.uri)}
				<div class="news-quote-item">
					<ThreadUnit
						item={withoutQuote(item)}
						botActor={quotesBotActor ?? data.botActor}
						onposted={() => loadQuotes(data.news.uri)}
					/>
				</div>
			{/each}
		</div>
	{/if}
	{#if quotesLoading}
		<Spinner />
	{:else if quotesError}
		<p class="news-related-state error" role="alert">{quotesError}</p>
	{:else if !quotes.length}
		<p class="news-related-state">{m.newsQuotesEmpty()}</p>
	{:else if quotesHasMore}
		<button
			class="ghost news-quotes-more"
			type="button"
			onclick={() => loadQuotes(data.news.uri, true)}>{m.loadMore()}</button
		>
	{/if}
</section>

{#if similar.length}
	<section class="news-related" aria-labelledby="news-similar-heading">
		<h2 id="news-similar-heading">{m.newsSimilarHeading()}</h2>
		<ul class="news-similar">
			{#each similar as item (item.uri)}
				{@const image = safeNewsImageUrl(item.image)}
				<li>
					<a href={`/news/${newsRkey(item.uri)}`}>
						{#if image}<img
								src={image}
								alt=""
								loading="lazy"
								decoding="async"
								referrerpolicy="no-referrer"
							/>{/if}
						<span class="news-similar-text">
							<span class="news-similar-title">{item.title}</span>
							{#if item.sourceName}<span class="news-similar-source">{item.sourceName}</span>{/if}
						</span>
					</a>
				</li>
			{/each}
		</ul>
	</section>
{/if}

<style>
	.news-back {
		display: inline-flex;
		align-items: center;
		gap: 2px;
		margin-block-end: 12px;
		color: var(--text-muted);
		font-size: 0.86rem;
		font-weight: 700;
		text-decoration: none;
	}
	.news-back:hover,
	.news-back:focus-visible {
		color: var(--accent-strong);
	}
	.news-permalink {
		display: grid;
		gap: 14px;
	}
	.news-related {
		margin-block-start: 24px;
		min-inline-size: 0;
	}
	.news-related h2 {
		margin: 0 0 8px;
		padding-block-end: 8px;
		border-block-end: 1px solid var(--line);
		color: var(--text-strong);
		font-size: 13px;
		font-weight: 700;
		letter-spacing: 0.04em;
	}
	.news-related-state {
		margin: 0;
		padding: 12px 4px;
		color: var(--text-muted);
		font-size: 12px;
		line-height: 1.55;
	}
	.news-related-state.error {
		color: var(--danger);
	}
	.news-quote-item {
		min-inline-size: 0;
		padding: 10px 4px;
	}
	.news-quote-item + .news-quote-item {
		border-block-start: 1px solid var(--panel-divider);
	}
	.news-quote-item :global(> .thread-unit) {
		background: transparent;
		border-radius: 0;
	}
	.news-quotes-more {
		display: block;
		margin: 8px auto 0;
	}
	.news-similar {
		display: grid;
		gap: 4px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.news-similar a {
		display: flex;
		align-items: center;
		gap: 12px;
		min-inline-size: 0;
		padding: 8px 4px;
		border-radius: var(--r-md);
		color: inherit;
		text-decoration: none;
	}
	.news-similar a:hover,
	.news-similar a:focus-visible {
		background: var(--surface-soft);
	}
	.news-similar img {
		flex: 0 0 auto;
		inline-size: 96px;
		aspect-ratio: 1.91 / 1;
		border: 1px solid var(--line);
		border-radius: var(--r-sm);
		object-fit: cover;
		background: var(--surface-soft);
	}
	.news-similar-text {
		display: grid;
		gap: 2px;
		min-inline-size: 0;
	}
	.news-similar-title {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
		font-size: 0.92rem;
		font-weight: 700;
		line-height: 1.5;
		overflow-wrap: anywhere;
	}
	.news-similar-source {
		color: var(--text-muted);
		font-size: 0.78rem;
		overflow-wrap: anywhere;
	}
</style>
