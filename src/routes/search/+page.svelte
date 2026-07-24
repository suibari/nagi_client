<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { searchPosts } from '$lib/api/appview';
	import { Feed } from '$lib/feed/feed.svelte';
	import ThreadUnit from '$lib/components/ThreadUnit.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';
	import { m } from '$lib/i18n/i18n.svelte';

	// タグ検索は小文字で正規化する（保存側と一致させる）。将来 ?q= 等を足す時もこの画面に相乗り。
	let tag = $derived((page.url.searchParams.get('tag') ?? '').trim().toLowerCase());

	let feed = $state<Feed>();
	// 閲覧は未認証（AppView 直読み）なのでセッション復元を待たない。
	let currentTag = $state<string | null>(null);
	$effect(() => {
		if (tag !== currentTag) {
			currentTag = tag;
			if (!tag) {
				feed = undefined;
				return;
			}
			const target = tag;
			feed = new Feed(
				(cursor) => searchPosts(target, cursor),
				() => false,
			);
			feed.load();
		}
	});

	onMount(() => {
		const base = setInterval(() => {
			if (document.visibilityState === 'visible') feed?.refresh();
		}, 30_000);
		return () => clearInterval(base);
	});
</script>

{#if tag}
	<section class="page-title"><h1 aria-label={m.searchTagAria({ tag })}>{m.searchTagTitle({ tag })}</h1></section>
{/if}

<section class="timeline" aria-busy={feed?.loading}>
	{#if !tag}
		<div class="state">{m.searchNoQuery()}</div>
	{:else if feed}
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
					onclick={() => feed?.load()}><Icon name="refresh" size={18} /></button
				>
			</div>
		{:else if !feed.visibleItems.length}
			<div class="state">{m.searchTagEmpty()}</div>
		{:else}
			{#each feed.visibleItems as item (item.uri)}
				<ThreadUnit
					{item}
					botActor={feed.botActor}
					ondeleted={(u) => feed?.removePost(u)}
					onposted={() => feed?.refresh()}
				/>
			{/each}
			{#if feed.hasMore}
				<button
					class="more icon-action"
					type="button"
					aria-label={m.loadMore()}
					title={m.loadMore()}
					onclick={() => feed?.loadMore()}><Icon name="more" size={20} /></button
				>
			{/if}
		{/if}
	{/if}
</section>
