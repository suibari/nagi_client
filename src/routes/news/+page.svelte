<script lang="ts">
	import { getPositiveNews } from '$lib/api/appview';
	import type { ActorView, NewsView, RecommendedNewsView } from '$lib/api/types';
	import NewsCard from '$lib/components/NewsCard.svelte';
	import NewsSubmissionDialog from '$lib/components/NewsSubmissionDialog.svelte';
	import InfiniteScroll from '$lib/components/InfiniteScroll.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';
	import { i18n, m, dayHeading, dayKey } from '$lib/i18n/i18n.svelte';
	import { openNewsUnreadView } from '$lib/news/unread.svelte';
	import { oauthReady, session } from '$lib/oauth/session.svelte';
	import { syncPreferences } from '$lib/preferences/sync.svelte';
	import type { UnreadView } from '$lib/unread/watermark.svelte';
	let items = $state<NewsView[]>([]),
		// 動的枠。items とは別枠なので、一覧の時系列も未読判定も従来のまま。
		recommended = $state<RecommendedNewsView[]>([]),
		botActor = $state<ActorView>(),
		cursor = $state<string>(),
		hasMore = $state(false),
		loading = $state(false),
		error = $state(''),
		loadedLang = $state<string>();
	let submissionOpen = $state(false);
	let refreshAfterLoad = false;
	// 既読基準は画面を開いた時点で凍結する。既読化しても表示中のマークは消えない。
	// 既読はアカウント同期＝DID ごとなので、OAuth の復元が終わるまで凍結を待つ。
	let unreadView = $state<UnreadView>();
	async function load(reset = false) {
		if (loading) {
			if (reset) refreshAfterLoad = true;
			return;
		}
		loading = true;
		error = '';
		try {
			const page = await getPositiveNews(i18n.locale, reset ? undefined : cursor);
			items = reset ? page.items : [...items, ...page.items];
			// 動的枠はサーバーが1ページ目にだけ載せる。追い読みでは触らない。
			if (reset) recommended = page.recommended ?? [];
			botActor = page.botActor ?? botActor;
			cursor = page.cursor;
			hasMore = page.hasMore;
			loadedLang = i18n.locale;
			if (reset) unreadView?.advance(page.items[0]);
		} catch (e) {
			error = e instanceof Error ? e.message : m.loadFailed();
		} finally {
			loading = false;
			if (refreshAfterLoad) {
				refreshAfterLoad = false;
				queueMicrotask(() => void load(true));
			}
		}
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
	{:else}{#if recommended.length}<section class="news-recommended">
				<h2 class="news-date">{m.newsRecommendedHeading()}</h2>
				{#each recommended as news (news.uri)}<NewsCard
						{news}
						{botActor}
						reasonKeyword={news.reason?.keyword}
						clampTitle={false}
					/>{/each}
			</section>{/if}{#each grouped as { news, heading } (news.uri)}{#if heading}<h2 class="news-date">
					{heading}
				</h2>{/if}<NewsCard
				{news}
				{botActor}
				unread={unreadView?.isUnread(news) ?? false}
				clampTitle={false}
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
	.news-feed {
		display: grid;
		gap: 14px;
	}
	.news-recommended {
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
