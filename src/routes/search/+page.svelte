<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import {
		searchPosts,
		searchPostsByQuery,
		searchChannelsByQuery,
		searchNewsByQuery,
		searchActors,
	} from '$lib/api/appview';
	import type { ActorView, ChannelView, NewsView } from '$lib/api/types';
	import { Feed } from '$lib/feed/feed.svelte';
	import ThreadUnit from '$lib/components/ThreadUnit.svelte';
	import NewsCard from '$lib/components/NewsCard.svelte';
	import ChannelCard from '$lib/components/ChannelCard.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';
	import { m } from '$lib/i18n/i18n.svelte';

	// 自由文検索(?q=)を優先。無ければタグ検索(?tag=、小文字で正規化して保存側と一致)。
	let q = $derived((page.url.searchParams.get('q') ?? '').trim());
	let tag = $derived((page.url.searchParams.get('tag') ?? '').trim().toLowerCase());
	let hasQuery = $derived(Boolean(q || tag));

	let feed = $state<Feed>();
	// q モードの横断結果（ユーザー/チャンネル/ニュース）。投稿は feed が担う。
	let users = $state<ActorView[]>([]);
	let channels = $state<ChannelView[]>([]);
	let news = $state<{ items: NewsView[]; botActor?: ActorView }>({ items: [] });

	// 閲覧は未認証（AppView 直読み）なのでセッション復元を待たない。
	let currentKey = $state<string | null>(null);
	$effect(() => {
		const key = q ? `q:${q}` : tag ? `tag:${tag}` : '';
		if (key === currentKey) return;
		currentKey = key;
		users = [];
		channels = [];
		news = { items: [] };
		if (!key) {
			feed = undefined;
			return;
		}
		const term = q || tag;
		const load = q
			? (cursor?: string) => searchPostsByQuery(term, cursor)
			: (cursor?: string) => searchPosts(term, cursor);
		feed = new Feed(load, () => false);
		feed.load();

		// 自由文モードだけ、ユーザー/チャンネル/ニュースも横断検索する。
		if (q) {
			const at = key;
			void searchActors(term, 10)
				.then((r) => key === at && (users = r.actors))
				.catch(() => {});
			void searchChannelsByQuery(term)
				.then((r) => key === at && (channels = r.channels))
				.catch(() => {});
			void searchNewsByQuery(term, 'ja')
				.then((r) => key === at && (news = { items: r.items, botActor: r.botActor }))
				.catch(() => {});
		}
	});

	// 全セクションが空なら「結果なし」を出すための判定（読み込み完了後の目安）。
	let nothingFound = $derived(
		Boolean(q) &&
			!feed?.loading &&
			!feed?.visibleItems.length &&
			!users.length &&
			!channels.length &&
			!news.items.length,
	);

	onMount(() => {
		const base = setInterval(() => {
			if (document.visibilityState === 'visible') feed?.refresh();
		}, 30_000);
		return () => clearInterval(base);
	});
</script>

{#if q}
	<section class="page-title"><h1>{q}</h1></section>
{:else if tag}
	<section class="page-title"><h1 aria-label={m.searchTagAria({ tag })}>{m.searchTagTitle({ tag })}</h1></section>
{/if}

{#if !hasQuery}
	<section class="timeline"><div class="state">{m.searchNoQuery()}</div></section>
{:else if q}
	<!-- 自由文モード: ユーザー/チャンネル/ニュース/投稿をセクション表示 -->
	{#if nothingFound}
		<section class="timeline"><div class="state">{m.searchQueryEmpty()}</div></section>
	{/if}

	{#if users.length}
		<section class="search-section">
			<h2>{m.searchSectionUsers()}</h2>
			<div class="actor-list">
				{#each users as actor (actor.did)}
					<a class="actor-row" href={`/profile/${actor.did}`}>
						<Avatar {actor} size="small" />
						<span class="actor-name">
							<strong>{actor.displayName ?? actor.handle}</strong>
							<small>@{actor.handle}</small>
						</span>
					</a>
				{/each}
			</div>
		</section>
	{/if}

	{#if channels.length}
		<section class="search-section">
			<h2>{m.searchSectionChannels()}</h2>
			<div class="channels-list">
				{#each channels as ch (ch.uri)}
					<ChannelCard channel={ch} />
				{/each}
			</div>
		</section>
	{/if}

	{#if news.items.length}
		<section class="search-section">
			<h2>{m.searchSectionNews()}</h2>
			{#each news.items as item (item.uri)}
				<NewsCard news={item} botActor={news.botActor} />
			{/each}
		</section>
	{/if}

	<section class="search-section timeline" aria-busy={feed?.loading}>
		<h2>{m.searchSectionPosts()}</h2>
		{#if feed}
			{#if feed.loading && !feed.visibleItems.length}
				<div class="timeline-loading" role="status" aria-label={m.feedWaiting()}>
					<span class="spinner" aria-hidden="true"></span>
				</div>
			{:else if feed.error && !feed.visibleItems.length}
				<div class="state error">
					{feed.error}<button class="icon-action" type="button" aria-label={m.retry()} title={m.retry()} onclick={() => feed?.load()}><Icon name="refresh" size={18} /></button>
				</div>
			{:else}
				{#each feed.visibleItems as item (item.uri)}
					<ThreadUnit {item} botActor={feed.botActor} ondeleted={(u) => feed?.removePost(u)} onposted={() => feed?.refresh()} />
				{/each}
				{#if feed.hasMore}
					<button class="more icon-action" type="button" aria-label={m.loadMore()} title={m.loadMore()} onclick={() => feed?.loadMore()}><Icon name="more" size={20} /></button>
				{/if}
			{/if}
		{/if}
	</section>
{:else}
	<!-- タグ検索モード（従来どおり投稿のみ） -->
	<section class="timeline" aria-busy={feed?.loading}>
		{#if feed}
			{#if feed.loading && !feed.visibleItems.length}
				<div class="timeline-loading" role="status" aria-label={m.feedWaiting()}>
					<span class="spinner" aria-hidden="true"></span>
				</div>
			{:else if feed.error && !feed.visibleItems.length}
				<div class="state error">
					{feed.error}<button class="icon-action" type="button" aria-label={m.retry()} title={m.retry()} onclick={() => feed?.load()}><Icon name="refresh" size={18} /></button>
				</div>
			{:else if !feed.visibleItems.length}
				<div class="state">{m.searchTagEmpty()}</div>
			{:else}
				{#each feed.visibleItems as item (item.uri)}
					<ThreadUnit {item} botActor={feed.botActor} ondeleted={(u) => feed?.removePost(u)} onposted={() => feed?.refresh()} />
				{/each}
				{#if feed.hasMore}
					<button class="more icon-action" type="button" aria-label={m.loadMore()} title={m.loadMore()} onclick={() => feed?.loadMore()}><Icon name="more" size={20} /></button>
				{/if}
			{/if}
		{/if}
	</section>
{/if}

<style>
	.search-section {
		padding: 0.5rem 0;
	}
	.search-section > h2 {
		font-size: 0.85rem;
		font-weight: 700;
		opacity: 0.7;
		padding: 0.5rem 1rem;
		margin: 0;
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
