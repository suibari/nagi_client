<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import {
		searchPosts,
		searchPostsByQuery,
		searchChannelsByQuery,
		searchNewsByQuery,
		searchActors,
		getBookmarkFolders,
		getBookmarks,
	} from '$lib/api/appview';
	import type {
		ActorView,
		BookmarkFolderView,
		BookmarkItemView,
		ChannelView,
		NewsView,
	} from '$lib/api/types';
	import { Feed, feedKey } from '$lib/feed/feed.svelte';
	import ThreadUnit from '$lib/components/ThreadUnit.svelte';
	import NewsCard from '$lib/components/NewsCard.svelte';
	import ChannelCard from '$lib/components/ChannelCard.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import InfiniteScroll from '$lib/components/InfiniteScroll.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';
	import BookmarkSearchSections from '$lib/components/BookmarkSearchSections.svelte';
	import { i18n, m } from '$lib/i18n/i18n.svelte';
	import { startVisiblePolling } from '$lib/polling';
	import { session } from '$lib/oauth/session.svelte';

	// 自由文検索(?q=)を優先。無ければタグ検索(?tag=、小文字で正規化して保存側と一致)。
	let q = $derived((page.url.searchParams.get('q') ?? '').trim());
	let tag = $derived(
		(page.url.searchParams.get('tag') ?? '')
			.trim()
			.replace(/^[#＃]+/, '')
			.toLowerCase(),
	);
	let hasQuery = $derived(Boolean(q || tag));

	// 自由文モードは対象ごとにタブを分ける。各タブの中は「一致」→「botたんの気まぐれ」の順に
	// 縦に並べ、一致側には見出しを付けない（タブ名から自明なため）。
	type TabId = 'posts' | 'users' | 'channels' | 'news' | 'bookmarks';
	const publicTabs: { id: TabId; label: () => string }[] = [
		{ id: 'posts', label: () => m.searchTabPosts() },
		{ id: 'users', label: () => m.searchTabUsers() },
		{ id: 'channels', label: () => m.searchTabChannels() },
		{ id: 'news', label: () => m.searchTabNews() },
	];
	let tabs = $derived(
		$session
			? [...publicTabs, { id: 'bookmarks' as const, label: () => m.searchTabBookmarks() }]
			: publicTabs,
	);
	let tab = $state<TabId>('posts');
	let tabsElement = $state<HTMLDivElement>();

	// 投稿は Feed に載せる（楽観投稿の突合・削除反映・ページングが乗るため）。
	let postsExact = $state<Feed>();
	let postsFuzzy = $state<Feed>();
	// タグモードは従来どおり投稿1本。
	let tagFeed = $state<Feed>();
	// 投稿以外は FeedItem ではないので素の配列で持つ。
	let usersExact = $state<ActorView[]>([]);
	let usersFuzzy = $state<ActorView[]>([]);
	let channelsExact = $state<ChannelView[]>([]);
	let channelsFuzzy = $state<ChannelView[]>([]);
	let newsExact = $state<{ items: NewsView[]; botActor?: ActorView }>({ items: [] });
	let newsFuzzy = $state<{ items: NewsView[]; botActor?: ActorView }>({ items: [] });
	let bookmarkItems = $state<BookmarkItemView[]>([]);
	let bookmarkFolders = $state<BookmarkFolderView[]>([]);
	let bookmarkBotActor = $state<ActorView>();
	let bookmarkCursor = $state<string>();
	let bookmarkHasMore = $state(false);
	let bookmarkLoadingMore = $state(false);
	let bookmarkError = $state('');
	// 描画用の「そのタブの結果が揃ったか」。未取得と0件を区別するために要る（投稿タブは Feed の
	// loading があるので使わない）。
	let readyExact = $state<Record<TabId, boolean>>({
		posts: false,
		users: false,
		channels: false,
		news: false,
		bookmarks: false,
	});
	let readyFuzzy = $state<Record<TabId, boolean>>({
		posts: false,
		users: false,
		channels: false,
		news: false,
		bookmarks: true,
	});
	// タブを自分で選んだらもう自動で移動しない。
	let tabPicked = $state(false);

	let currentKey = $state<string | null>(null);
	// 取得済みの記録。$state にすると読み書きが同じエフェクト内で回るので素の値で持つ。
	let loadedFuzzy: Record<string, boolean> = {};
	let loadedKey: string | null = null;

	function reset() {
		postsExact = undefined;
		postsFuzzy = undefined;
		tagFeed = undefined;
		usersExact = [];
		usersFuzzy = [];
		channelsExact = [];
		channelsFuzzy = [];
		newsExact = { items: [] };
		newsFuzzy = { items: [] };
		bookmarkItems = [];
		bookmarkFolders = [];
		bookmarkBotActor = undefined;
		bookmarkCursor = undefined;
		bookmarkHasMore = false;
		bookmarkError = '';
		readyExact = { posts: false, users: false, channels: false, news: false, bookmarks: false };
		readyFuzzy = { posts: false, users: false, channels: false, news: false, bookmarks: true };
		tabPicked = false;
		loadedFuzzy = {};
	}

	/**
	 * 一致は4タブぶん先に読む。埋め込みを使わない（＝Ollama を叩かない）ので安く、
	 * タブに件数を出して「別のタブに当たりがある」と分かるようにするために必要。
	 * これが無いと、既定のポストタブが0件なだけで「ヒットしない」に見えてしまう。
	 */
	function loadExact(at: string, locale: 'ja' | 'en') {
		const fresh = () => currentKey === at;
		postsExact = new Feed(
			(c) => searchPostsByQuery(q, c, 'exact'),
			() => false,
		);
		void postsExact.load().then(() => fresh() && (readyExact.posts = true));
		void searchActors(q, 20, 'exact')
			.then((r) => fresh() && (usersExact = r.actors))
			.catch(() => {})
			.finally(() => fresh() && (readyExact.users = true));
		void searchChannelsByQuery(q, undefined, 'exact')
			.then((r) => fresh() && (channelsExact = r.channels))
			.catch(() => {})
			.finally(() => fresh() && (readyExact.channels = true));
		void searchNewsByQuery(q, locale, undefined, 'exact')
			.then((r) => fresh() && (newsExact = { items: r.items, botActor: r.botActor }))
			.catch(() => {})
			.finally(() => fresh() && (readyExact.news = true));
		if ($session) {
			void Promise.all([getBookmarkFolders(locale), getBookmarks({ q, lang: locale, limit: 30 })])
				.then(([folderView, result]) => {
					if (!fresh()) return;
					bookmarkFolders = folderView.folders;
					bookmarkItems = result.items;
					bookmarkBotActor = result.botActor;
					bookmarkCursor = result.cursor;
					bookmarkHasMore = result.hasMore;
				})
				.catch(() => fresh() && (bookmarkError = m.loadFailed()))
				.finally(() => fresh() && (readyExact.bookmarks = true));
		} else {
			readyExact.bookmarks = true;
		}
	}

	/** 気まぐれ側は埋め込み生成が要るので、開いたタブのぶんだけ遅れて読む。 */
	function loadFuzzy(target: TabId, at: string, locale: 'ja' | 'en') {
		const fresh = () => currentKey === at;
		const done = () => fresh() && (readyFuzzy[target] = true);
		if (target === 'posts') {
			postsFuzzy = new Feed(
				(c) => searchPostsByQuery(q, c, 'semantic'),
				() => false,
			);
			void postsFuzzy.load().then(done);
		} else if (target === 'users') {
			void searchActors(q, 20, 'semantic')
				.then((r) => fresh() && (usersFuzzy = r.actors))
				.catch(() => {})
				.finally(done);
		} else if (target === 'channels') {
			void searchChannelsByQuery(q, undefined, 'semantic')
				.then((r) => fresh() && (channelsFuzzy = r.channels))
				.catch(() => {})
				.finally(done);
		} else if (target === 'news') {
			void searchNewsByQuery(q, locale, undefined, 'semantic')
				.then((r) => fresh() && (newsFuzzy = { items: r.items, botActor: r.botActor }))
				.catch(() => {})
				.finally(done);
		}
	}
	async function loadMoreBookmarks() {
		if (!bookmarkCursor || bookmarkLoadingMore) return;
		bookmarkLoadingMore = true;
		bookmarkError = '';
		try {
			const result = await getBookmarks({
				q,
				lang: i18n.locale,
				limit: 30,
				cursor: bookmarkCursor,
			});
			bookmarkItems = [...bookmarkItems, ...result.items];
			bookmarkCursor = result.cursor;
			bookmarkHasMore = result.hasMore;
			bookmarkBotActor = result.botActor ?? bookmarkBotActor;
		} catch {
			bookmarkError = m.loadFailed();
		} finally {
			bookmarkLoadingMore = false;
		}
	}

	// 閲覧は未認証（AppView 直読み）なのでセッション復元を待たない。
	$effect(() => {
		const locale = i18n.locale;
		const key = q
			? `q:${q}:${locale}:${$session?.did ?? 'public'}`
			: tag
				? `tag:${tag}:${locale}`
				: '';
		const target = tab;
		if (key !== currentKey) {
			currentKey = key;
			reset();
		}
		if (!key) return;
		if (!q) {
			if (loadedFuzzy.tag) return;
			loadedFuzzy.tag = true;
			tagFeed = new Feed(
				(c) => searchPosts(tag, c),
				() => false,
			);
			tagFeed.load();
			return;
		}
		if (loadedKey !== key) {
			loadedKey = key;
			loadExact(key, locale);
		}
		if (target === 'bookmarks' || loadedFuzzy[target]) return;
		loadedFuzzy[target] = true;
		loadFuzzy(target, key, locale);
	});

	// タブごとの一致ヒット数。0件のタブと当たりのあるタブを見分けるために出す。
	let exactCounts = $derived<Record<TabId, number>>({
		posts: postsExact?.visibleItems.length ?? 0,
		users: usersExact.length,
		channels: channelsExact.length,
		news: newsExact.items.length,
		bookmarks: bookmarkItems.length,
	});
	let allExactReady = $derived(
		readyExact.posts &&
			readyExact.users &&
			readyExact.channels &&
			readyExact.news &&
			readyExact.bookmarks,
	);
	// 自分でタブを選ぶ前に限り、当たりのあるタブへ寄せる。「チャンネルはあるのに検索して
	// ヒットしない」と見えてしまう事故を防ぐのが目的。
	$effect(() => {
		if (!allExactReady || tabPicked || exactCounts[tab] > 0) return;
		const hit = tabs.find((t) => exactCounts[t.id] > 0);
		if (hit) tab = hit.id;
	});
	$effect(() => {
		void tab;
		requestAnimationFrame(() =>
			tabsElement
				?.querySelector<HTMLElement>('[aria-selected="true"]')
				?.scrollIntoView({ inline: 'center', block: 'nearest' }),
		);
	});

	// 一致セクションだけ新着が効く。気まぐれは並びがスコア依存で揺れるので自動更新しない。
	onMount(() =>
		startVisiblePolling(() => (postsExact ?? tagFeed)?.refresh(), 30_000, { onReturn: true }),
	);

	let postsEmpty = $derived(
		Boolean(postsExact && !postsExact.loading && !postsExact.visibleItems.length),
	);
</script>

{#snippet postList(feed: Feed)}
	{#each feed.visibleItems as item (feedKey(item))}
		<ThreadUnit
			{item}
			botActor={feed.botActor}
			ondeleted={(u) => feed.removePost(u)}
			onposted={() => feed.refresh()}
		/>
	{/each}
{/snippet}

{#snippet feedState(feed: Feed)}
	{#if feed.loading && !feed.visibleItems.length}
		<div class="timeline-loading" role="status" aria-label={m.feedWaiting()}>
			<span class="spinner" aria-hidden="true"></span>
		</div>
	{:else if feed.error && !feed.visibleItems.length}
		<div class="state error">
			{feed.error}<button
				class="icon-action"
				type="button"
				aria-label={m.retry()}
				title={m.retry()}
				onclick={() => feed.load()}><Icon name="refresh" size={18} /></button
			>
		</div>
	{/if}
{/snippet}

{#snippet spinner()}
	<div class="timeline-loading" role="status" aria-label={m.feedWaiting()}>
		<span class="spinner" aria-hidden="true"></span>
	</div>
{/snippet}

{#snippet actorRows(actors: ActorView[])}
	<div class="actor-list">
		{#each actors as actor (actor.did)}
			<a class="actor-row" href={`/profile/${actor.did}`}>
				<Avatar {actor} size="small" />
				<span class="actor-name">
					<strong>{actor.displayName ?? actor.handle}</strong>
					<small>@{actor.handle}</small>
				</span>
			</a>
		{/each}
	</div>
{/snippet}

<!-- 気まぐれセクションの見出し。空でも「気まぐれには何もなかった」と分かるよう常に出す。 -->
{#snippet fuzzyHeading()}
	<h2><Icon name="bot" size={16} />{m.searchSectionFuzzy()}</h2>
{/snippet}

{#if q}
	<section class="page-title"><h1>{q}</h1></section>
{:else if tag}
	<section class="page-title">
		<h1 aria-label={m.searchTagAria({ tag })}>{m.searchTagTitle({ tag })}</h1>
	</section>
{/if}

{#if !hasQuery}
	<section class="timeline"><div class="state">{m.searchNoQuery()}</div></section>
{:else if q}
	<div bind:this={tabsElement} class="search-tabs" role="tablist">
		{#each tabs as t (t.id)}
			<button
				role="tab"
				aria-selected={tab === t.id}
				class:active={tab === t.id}
				onclick={(event) => {
					tabPicked = true;
					tab = t.id;
					(event.currentTarget as HTMLElement).scrollIntoView({
						inline: 'center',
						block: 'nearest',
					});
				}}
				>{t.label()}{#if readyExact[t.id]}<span
						class="tab-count"
						class:zero={exactCounts[t.id] === 0}
						>{exactCounts[
							t.id
						]}{#if (t.id === 'posts' && postsExact?.hasMore) || (t.id === 'bookmarks' && bookmarkHasMore)}+{/if}</span
					>{/if}</button
			>
		{/each}
	</div>

	{#if tab === 'posts'}
		<section class="search-section timeline" aria-busy={postsExact?.loading}>
			{#if postsExact}
				{@render feedState(postsExact)}
				{#if postsEmpty}
					<div class="state">{m.searchExactEmpty()}</div>
				{:else}
					{@render postList(postsExact)}
				{/if}
				<!-- 下の気まぐれセクションに到達できなくなるので無限スクロールにしない。 -->
				{#if postsExact.hasMore}
					<button
						class="search-more"
						type="button"
						disabled={postsExact.loading}
						onclick={() => postsExact?.loadMore()}>{m.searchLoadMore()}</button
					>
				{/if}
			{/if}
		</section>
		<section class="search-section timeline">
			{@render fuzzyHeading()}
			{#if postsFuzzy}
				{@render feedState(postsFuzzy)}
				{#if !postsFuzzy.loading && !postsFuzzy.visibleItems.length}
					<div class="state">{m.searchFuzzyEmpty()}</div>
				{:else}
					{@render postList(postsFuzzy)}
				{/if}
			{/if}
		</section>
	{:else if tab === 'users'}
		<section class="search-section">
			{#if !readyExact.users}
				{@render spinner()}
			{:else if !usersExact.length}
				<div class="state">{m.searchExactEmpty()}</div>
			{:else}
				{@render actorRows(usersExact)}
			{/if}
		</section>
		<section class="search-section">
			{@render fuzzyHeading()}
			{#if readyFuzzy.users && !usersFuzzy.length}
				<div class="state">{m.searchFuzzyEmpty()}</div>
			{:else}
				{@render actorRows(usersFuzzy)}
			{/if}
		</section>
	{:else if tab === 'channels'}
		<section class="search-section">
			{#if !readyExact.channels}
				{@render spinner()}
			{:else if !channelsExact.length}
				<div class="state">{m.searchExactEmpty()}</div>
			{:else}
				<div class="channels-list">
					{#each channelsExact as ch (ch.uri)}
						<ChannelCard channel={ch} />
					{/each}
				</div>
			{/if}
		</section>
		<section class="search-section">
			{@render fuzzyHeading()}
			{#if readyFuzzy.channels && !channelsFuzzy.length}
				<div class="state">{m.searchFuzzyEmpty()}</div>
			{:else}
				<div class="channels-list">
					{#each channelsFuzzy as ch (ch.uri)}
						<ChannelCard channel={ch} />
					{/each}
				</div>
			{/if}
		</section>
	{:else if tab === 'news'}
		<section class="search-section">
			{#if !readyExact.news}
				{@render spinner()}
			{:else if !newsExact.items.length}
				<div class="state">{m.searchExactEmpty()}</div>
			{:else}
				{#each newsExact.items as item (item.uri)}
					<NewsCard news={item} botActor={newsExact.botActor} />
				{/each}
			{/if}
		</section>
		<section class="search-section">
			{@render fuzzyHeading()}
			{#if readyFuzzy.news && !newsFuzzy.items.length}
				<div class="state">{m.searchFuzzyEmpty()}</div>
			{:else}
				{#each newsFuzzy.items as item (item.uri)}
					<NewsCard news={item} botActor={newsFuzzy.botActor} />
				{/each}
			{/if}
		</section>
	{:else if tab === 'bookmarks'}
		<section class="search-section bookmark-search-section" aria-busy={!readyExact.bookmarks}>
			{#if !readyExact.bookmarks}
				{@render spinner()}
			{:else if bookmarkError && !bookmarkItems.length}
				<div class="state error">
					{bookmarkError}<button class="search-more" onclick={() => location.reload()}
						>{m.retry()}</button
					>
				</div>
			{:else if !bookmarkItems.length}
				<div class="state">{m.searchBookmarksEmpty()}</div>
			{:else}
				<BookmarkSearchSections
					items={bookmarkItems}
					folders={bookmarkFolders}
					botActor={bookmarkBotActor}
				/>
				{#if bookmarkError}<div class="state error">{bookmarkError}</div>{/if}
				{#if bookmarkHasMore}
					<button
						class="search-more"
						disabled={bookmarkLoadingMore}
						onclick={() => void loadMoreBookmarks()}>{m.searchLoadMore()}</button
					>
				{/if}
			{/if}
		</section>
	{/if}
{:else}
	<!-- タグ検索モード（従来どおり投稿のみ・タブなし） -->
	<section class="timeline" aria-busy={tagFeed?.loading}>
		{#if tagFeed}
			{#if tagFeed.loading && !tagFeed.visibleItems.length}
				<div class="timeline-loading" role="status" aria-label={m.feedWaiting()}>
					<span class="spinner" aria-hidden="true"></span>
				</div>
			{:else if tagFeed.error && !tagFeed.visibleItems.length}
				<div class="state error">
					{tagFeed.error}<button
						class="icon-action"
						type="button"
						aria-label={m.retry()}
						title={m.retry()}
						onclick={() => tagFeed?.load()}><Icon name="refresh" size={18} /></button
					>
				</div>
			{:else if !tagFeed.visibleItems.length}
				<div class="state">{m.searchTagEmpty()}</div>
			{:else}
				{@render postList(tagFeed)}
				<InfiniteScroll
					hasMore={tagFeed.hasMore}
					loading={tagFeed.loading}
					error={tagFeed.error}
					onload={() => tagFeed?.loadMore()}
				/>
			{/if}
		{/if}
	</section>
{/if}

<style>
	.search-tabs {
		display: flex;
		gap: 4px;
		padding: 0 1rem;
		border-bottom: 1px solid var(--line);
		min-inline-size: 0;
	}
	.search-tabs button {
		flex: 0 0 auto;
		padding: 0.6rem 0.9rem;
		border: 0;
		border-bottom: 2px solid transparent;
		background: none;
		color: var(--text-faint);
		font-size: 0.9rem;
		font-weight: 700;
	}
	@media (max-width: 600px) {
		.search-tabs {
			overflow-x: auto;
			overflow-y: hidden;
			scroll-padding-inline: 1rem;
			overscroll-behavior-inline: contain;
			-webkit-overflow-scrolling: touch;
		}
		.search-tabs button {
			white-space: nowrap;
		}
	}
	.search-tabs button.active {
		color: var(--text);
		border-bottom-color: var(--accent-strong);
	}
	/* 件数。0件のタブは薄くして「当たりがあるタブ」を目で追えるようにする。 */
	.tab-count {
		margin-inline-start: 0.35em;
		font-size: 0.8em;
		font-weight: 600;
		color: var(--accent-strong);
	}
	.tab-count.zero {
		color: var(--text-faint);
		opacity: 0.6;
	}
	.search-section {
		padding: 0.5rem 0;
	}
	.search-section > h2 {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.85rem;
		font-weight: 700;
		opacity: 0.7;
		padding: 0.5rem 1rem;
		margin: 0;
	}
	.search-more {
		display: block;
		width: 100%;
		padding: 0.7rem 1rem;
		border: 0;
		background: none;
		color: var(--accent-strong);
		font-size: 0.9rem;
		font-weight: 700;
	}
	.search-more:hover:not(:disabled) {
		background: color-mix(in srgb, currentColor 6%, transparent);
	}
	.search-more:disabled {
		opacity: 0.5;
		cursor: default;
	}
	.actor-list {
		display: flex;
		flex-direction: column;
	}
	.actor-row {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.6rem 1rem;
		color: inherit;
		text-decoration: none;
	}
	.actor-row:hover {
		background: color-mix(in srgb, currentColor 6%, transparent);
	}
	.actor-name {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.actor-name small {
		opacity: 0.6;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
