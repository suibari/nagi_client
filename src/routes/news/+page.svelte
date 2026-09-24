<script lang="ts">
	import { getPositiveNews, searchNewsByQuery } from '$lib/api/appview';
	import type { ActorView, NewsView, RecommendedNewsView } from '$lib/api/types';
	import NewsCard from '$lib/components/NewsCard.svelte';
	import NewsSubmissionDialog from '$lib/components/NewsSubmissionDialog.svelte';
	import InfiniteScroll from '$lib/components/InfiniteScroll.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';
	import {
		i18n,
		m,
		dayHeading,
		dayKey,
		localeReady,
		stableDayHeading,
		stableDayKey,
	} from '$lib/i18n/i18n.svelte';
	import { byNewestFirst } from '$lib/news/order';
	import { openNewsUnreadView } from '$lib/news/unread.svelte';
	import { oauthReady, session } from '$lib/oauth/session.svelte';
	import { syncPreferences } from '$lib/preferences/sync.svelte';
	import type { UnreadView } from '$lib/unread/watermark.svelte';
	import { newsRkey } from '$lib/news/indexable';

	// プリレンダで焼いた1ページ目。クローラと初回表示はこれを読む。
	// ハイドレーション後は下の $effect が getPositiveNews で取り直す
	// （リアクション・ミュート・未読はビューアごとに違うため）。
	let { data } = $props();
	type NewsCategory =
		| 'all'
		| 'recommended'
		| 'entertainment'
		| 'animals'
		| 'food'
		| 'travel'
		| 'sports'
		| 'technology';
	const categories: Array<{ id: NewsCategory; query?: string; label: () => string }> = [
		{ id: 'all', label: () => m.newsCategoryAll() },
		{ id: 'recommended', label: () => m.newsCategoryRecommended() },
		{ id: 'entertainment', query: 'エンタメ', label: () => m.newsCategoryEntertainment() },
		{ id: 'animals', query: '動物', label: () => m.newsCategoryAnimals() },
		{ id: 'food', query: '料理', label: () => m.newsCategoryFood() },
		{ id: 'travel', query: '旅行', label: () => m.newsCategoryTravel() },
		{ id: 'sports', query: 'スポーツ', label: () => m.newsCategorySports() },
		{ id: 'technology', query: 'テクノロジー', label: () => m.newsCategoryTechnology() },
	];
	let activeCategory = $state<NewsCategory>('all');
	// data.seed は「初期値としてだけ」取り込む。以降はカテゴリ切り替えと
	// ハイドレーション後の再取得が items を置き換えるので、派生にはしない。
	// svelte-ignore state_referenced_locally
	let items = $state<Array<NewsView | RecommendedNewsView>>(data.seed),
		// svelte-ignore state_referenced_locally
		botActor = $state<ActorView | undefined>(data.seedBotActor),
		cursor = $state<string>(),
		hasMore = $state(false),
		loading = $state(false),
		error = $state(''),
		loadedLang = $state<string>();
	let submissionOpen = $state(false);
	let loadVersion = 0;
	// 既読基準は画面を開いた時点で凍結する。既読化しても表示中のマークは消えない。
	// 既読はアカウント同期＝DID ごとなので、OAuth の復元が終わるまで凍結を待つ。
	let unreadView = $state<UnreadView>();
	async function load(reset = false) {
		if (loading && !reset) return;
		const version = reset ? ++loadVersion : loadVersion;
		const category = categories.find((candidate) => candidate.id === activeCategory)!;
		const locale = i18n.locale;
		loading = true;
		error = '';
		try {
			const page = category.query
				? await searchNewsByQuery(category.query, locale, reset ? undefined : cursor)
				: await getPositiveNews(locale, reset ? undefined : cursor);
			if (version !== loadVersion) return;
			items = byNewestFirst(
				category.id === 'recommended'
					? (page.recommended ?? [])
					: reset
						? page.items
						: [...items, ...page.items],
			);
			botActor = page.botActor ?? botActor;
			cursor = category.id === 'recommended' ? undefined : page.cursor;
			hasMore = category.id === 'recommended' ? false : page.hasMore;
			loadedLang = locale;
			if (reset && category.id === 'all') unreadView?.advance(page.items[0]);
		} catch (e) {
			if (version !== loadVersion) return;
			error = e instanceof Error ? e.message : m.loadFailed();
		} finally {
			if (version === loadVersion) loading = false;
		}
	}
	function selectCategory(category: NewsCategory) {
		if (category === activeCategory) return;
		activeCategory = category;
		items = [];
		cursor = undefined;
		hasMore = false;
		void load(true);
	}
	let readyFor = $state<string | undefined>();
	async function initialize(key: string, did: string | undefined) {
		await syncPreferences(did);
		if (readyFor !== key) return;
		unreadView = openNewsUnreadView(did);
		void load(true);
	}
	$effect(() => {
		if (!$oauthReady) return;
		const did = $session?.did;
		const key = did ?? 'guest';
		if (readyFor === key) return;
		readyFor = key;
		unreadView = undefined;
		void initialize(key, did);
	});
	$effect(() => {
		const lang = i18n.locale;
		if (loadedLang && loadedLang !== lang) void load(true);
	});
	// 連続する同日をひとまとめにして日付見出しを出す。日付は botたんの投稿日(createdAt)。
	// items は常に日付降順なので、さらに読み込んでも見出しは重複しない。
	let grouped = $derived.by(() => {
		// マウント前は JST 固定・絶対日付で描く。閲覧者のタイムゾーンで日付を切ると
		// ビルド(UTC)と結果が変わり、「今日 / 昨日」はビルド日で固まってしまう。
		const ready = localeReady();
		let lastKey: string | undefined;
		return items.map((news) => {
			const iso = news.createdAt || news.indexedAt;
			const key = ready ? dayKey(iso) : stableDayKey(iso);
			if (!key || key === lastKey) return { news, heading: undefined };
			lastKey = key;
			return { news, heading: ready ? dayHeading(iso) : stableDayHeading(iso) };
		});
	});
	function openSubmission() {
		if (!$session) {
			location.href = '/login';
			return;
		}
		submissionOpen = true;
	}
</script>

<section class="page-title news-title">
	<h1>{m.navNews()}</h1>
	<button type="button" class="primary" onclick={openSubmission}>{m.newsAdd()}</button>
</section>
<p class="news-intro">{m.newsIntro()}</p>
<div class="news-category-tabs" role="tablist" aria-label={m.newsCategoriesAria()}>
	{#each categories as category (category.id)}
		<button
			type="button"
			role="tab"
			aria-selected={activeCategory === category.id}
			class:active={activeCategory === category.id}
			onclick={() => selectCategory(category.id)}>{category.label()}</button
		>
	{/each}
</div>
<section class="news-feed" aria-busy={loading}>
	{#if loading && !items.length}<div class="timeline-loading" role="status">
			<span class="spinner"></span>
		</div>
	{:else if error && !items.length}<div class="state error">
			{error}<button class="icon-action" onclick={() => load(true)} aria-label={m.retry()}
				><Icon name="refresh" size={18} /></button
			>
		</div>
	{:else if !items.length}<div class="state">
			{activeCategory === 'recommended' ? m.newsRecommendedEmpty() : m.newsEmpty()}
		</div>
	{:else if activeCategory === 'recommended'}
		{#each items as news (news.uri)}
			<NewsCard
				{news}
				{botActor}
				showImage
				unread={unreadView?.isUnread(news) ?? false}
				reasonGenre={'reason' in news ? (news.reason?.genre ?? news.reason?.keyword) : undefined}
				clampTitle={false}
			/>
		{/each}
	{:else}{#each grouped as { news, heading } (news.uri)}{#if heading}<h2 class="news-date">
					{heading}
				</h2>{/if}<NewsCard
				{news}
				{botActor}
				showImage
				unread={unreadView?.isUnread(news) ?? false}
				clampTitle={false}
				permalink={`/news/${newsRkey(news.uri)}`}
			/>{/each}<InfiniteScroll {hasMore} {loading} {error} onload={() => load()} />{/if}
</section>
{#if submissionOpen}<NewsSubmissionDialog
		onclose={() => (submissionOpen = false)}
		onapproved={() => void load(true)}
	/>{/if}

<style>
	.news-title {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}
	.news-intro {
		margin: 0 0 14px;
		color: var(--text-muted);
		font-size: 0.85rem;
		line-height: 1.7;
	}
	.news-category-tabs {
		display: flex;
		overflow-x: auto;
		margin-block-end: 14px;
		border-block-end: 1px solid var(--line);
		scrollbar-width: none;
		-ms-overflow-style: none;
	}
	.news-category-tabs::-webkit-scrollbar {
		display: none;
	}
	.news-category-tabs button {
		position: relative;
		flex: 0 0 auto;
		padding: 10px;
		border: 0;
		background: transparent;
		color: var(--text-muted);
		font: inherit;
		font-size: 0.86rem;
		font-weight: 700;
		white-space: nowrap;
		cursor: pointer;
	}
	.news-category-tabs button:hover,
	.news-category-tabs button:focus-visible,
	.news-category-tabs button.active {
		color: var(--accent-strong);
	}
	.news-category-tabs button.active::after {
		content: '';
		position: absolute;
		inset-inline: 8px;
		inset-block-end: -1px;
		block-size: 3px;
		border-radius: 3px 3px 0 0;
		background: var(--accent);
	}
	.news-feed {
		display: grid;
		gap: 14px;
	}
	.news-date {
		margin: 6px 2px -4px;
		font-size: 13px;
		font-weight: 700;
		color: var(--text-muted);
	}
</style>
