<script lang="ts">
	import { onMount } from 'svelte';
	import { getPositiveNews } from '$lib/api/appview';
	import type { ActorView, NewsView } from '$lib/api/types';
	import FeedTabs from '$lib/components/shell/FeedTabs.svelte';
	import NewsCard from '$lib/components/NewsCard.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';
	import { i18n, m } from '$lib/i18n/i18n.svelte';
	import { markNewsSeen } from '$lib/news/unread.svelte';
	let items = $state<NewsView[]>([]), botActor = $state<ActorView>(), cursor = $state<string>(), hasMore = $state(false), loading = $state(false), error = $state(''), loadedLang = $state<string>();
	async function load(reset = false) {
		if (loading) return; loading = true; error = '';
		try { const page = await getPositiveNews(i18n.locale, reset ? undefined : cursor); items = reset ? page.items : [...items, ...page.items]; botActor = page.botActor ?? botActor; cursor = page.cursor; hasMore = page.hasMore; loadedLang = i18n.locale; if (reset) markNewsSeen(page.items[0]); }
		catch (e) { error = e instanceof Error ? e.message : m.loadFailed(); }
		finally { loading = false; }
	}
	onMount(() => { void load(true); });
	$effect(() => { const lang = i18n.locale; if (loadedLang && loadedLang !== lang) void load(true); });
</script>
<FeedTabs />
<section class="news-feed" aria-busy={loading}>
	{#if loading && !items.length}<div class="timeline-loading" role="status"><span class="spinner"></span></div>
	{:else if error && !items.length}<div class="state error">{error}<button class="icon-action" onclick={() => load(true)} aria-label={m.retry()}><Icon name="refresh" size={18}/></button></div>
	{:else if !items.length}<div class="state">{m.newsEmpty()}</div>
	{:else}{#each items as news (news.uri)}<NewsCard {news} {botActor}/>{/each}{#if hasMore}<button class="more icon-action" disabled={loading} onclick={() => load()} aria-label={m.loadMore()}><Icon name="more" size={20}/></button>{/if}{/if}
</section>
<style>
	.news-feed{display:grid;gap:14px}
</style>
