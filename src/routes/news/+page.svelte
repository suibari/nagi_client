<script lang="ts">
	import { onMount } from 'svelte';
	import { getPositiveNews } from '$lib/api/appview';
	import type { ActorView, NewsView } from '$lib/api/types';
	import NewsCard from '$lib/components/NewsCard.svelte';
	import InfiniteScroll from '$lib/components/InfiniteScroll.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';
	import { i18n, m, dayHeading, dayKey } from '$lib/i18n/i18n.svelte';
	import { openNewsUnreadView } from '$lib/news/unread.svelte';
	let items = $state<NewsView[]>([]),
		botActor = $state<ActorView>(),
		cursor = $state<string>(),
		hasMore = $state(false),
		loading = $state(false),
		error = $state(''),
		loadedLang = $state<string>();
	// 既読基準は画面を開いた時点で凍結する。既読化しても表示中のマークは消えない。
	const unreadView = openNewsUnreadView();
	async function load(reset = false) {
		if (loading) return;
		loading = true;
		error = '';
		try {
			const page = await getPositiveNews(i18n.locale, reset ? undefined : cursor);
			items = reset ? page.items : [...items, ...page.items];
			botActor = page.botActor ?? botActor;
			cursor = page.cursor;
			hasMore = page.hasMore;
			loadedLang = i18n.locale;
			if (reset) unreadView.advance(page.items[0]);
		} catch (e) {
			error = e instanceof Error ? e.message : m.loadFailed();
		} finally {
			loading = false;
		}
	}
	onMount(() => {
		void load(true);
	});
	$effect(() => {
		const lang = i18n.locale;
		if (loadedLang && loadedLang !== lang) void load(true);
	});
	// 連続する同日をひとまとめにして日付見出しを出す。日付は botたんの投稿日(createdAt)。
	// indexedAt DESC の並びは崩さないので、さらに読み込んでも見出しは重複しない。
	let grouped = $derived.by(() => {
		let lastKey: string | undefined;
		return items.map((news) => {
			const iso = news.createdAt || news.indexedAt;
			const key = dayKey(iso);
			if (!key || key === lastKey) return { news, heading: undefined };
			lastKey = key;
			return { news, heading: dayHeading(iso) };
		});
	});
</script>

<section class="page-title"><h1>{m.navNews()}</h1></section>
<section class="news-feed" aria-busy={loading}>
	{#if loading && !items.length}<div class="timeline-loading" role="status">
			<span class="spinner"></span>
		</div>
	{:else if error && !items.length}<div class="state error">
			{error}<button class="icon-action" onclick={() => load(true)} aria-label={m.retry()}
				><Icon name="refresh" size={18} /></button
			>
		</div>
	{:else if !items.length}<div class="state">{m.newsEmpty()}</div>
	{:else}{#each grouped as { news, heading } (news.uri)}{#if heading}<h2 class="news-date">
					{heading}
				</h2>{/if}<NewsCard
				{news}
				{botActor}
				unread={unreadView.isUnread(news)}
			/>{/each}<InfiniteScroll {hasMore} {loading} {error} onload={() => load()} />{/if}
</section>

<style>
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
