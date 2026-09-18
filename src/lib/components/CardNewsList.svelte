<script lang="ts">
	import { getCardNews } from '$lib/api/appview';
	import type { CardNewsFeed } from '$lib/api/types';
	import { i18n, m } from '$lib/i18n/i18n.svelte';
	import AffirmationCard from './AffirmationCard.svelte';

	/**
	 * 全肯定カードのニュース。SR以上のドローと、ゼンカツのハイライトだけが並ぶ。
	 * ゼンカツを全件流すとニュースの約8割がゼンカツになり、レアドローが埋もれるため。
	 */
	let feed = $state<CardNewsFeed | undefined>();
	let loading = $state(true);
	let error = $state('');
	let loadingMore = $state(false);

	async function load(cursor?: string) {
		if (!cursor) loading = true;
		error = '';
		try {
			const result = await getCardNews(cursor ? { cursor } : {});
			feed =
				cursor && feed ? { ...result, items: [...feed.items, ...result.items] } : result;
		} catch {
			error = m.cardNewsFetchFailed();
		} finally {
			loading = false;
			loadingMore = false;
		}
	}
	$effect(() => {
		void load();
	});
</script>

{#if loading}
	<div class="state">…</div>
{:else if error}
	<div class="state">{error}</div>
{:else if !feed?.items.length}
	<div class="state">{m.cardNewsEmpty()}</div>
{:else}
	<ul class="news">
		{#each feed.items as item (item.uri)}
			<li class="item">
				<p class="who">{item.author.displayName || item.author.handle}</p>
				{#if item.type === 'cardGet' && item.card}
					<p class="headline">{m.cardNewsGot({ name: i18n.locale === 'ja' ? item.card.nameJa : item.card.nameEn })}</p>
					<div class="one"><AffirmationCard card={item.card} /></div>
				{:else}
					{#if item.themeJa}<p class="theme">{i18n.locale === 'ja' ? item.themeJa : (item.themeEn ?? item.themeJa)}</p>{/if}
					<ul class="played">
						{#each item.cards ?? [] as card (card.volume + ':' + card.id)}
							<li><AffirmationCard {card} /></li>
						{/each}
					</ul>
					{#if item.commentJa || item.commentEn}
						<p class="comment">
							{(i18n.locale === 'ja' ? item.commentJa : item.commentEn) ||
								item.commentJa ||
								item.commentEn}
						</p>
					{/if}
				{/if}
			</li>
		{/each}
	</ul>
	{#if feed.cursor}
		<button class="more" disabled={loadingMore} onclick={() => ((loadingMore = true), load(feed?.cursor))}
			>{m.zenkatsuLoadMore()}</button
		>
	{/if}
{/if}

<style>
	.state {
		padding: 2rem 1rem;
		color: var(--text-faint);
		text-align: center;
	}
	.news,
	.played {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.item {
		padding: 0.9rem 1rem;
		border-block-end: 1px solid var(--line);
	}
	.who {
		font-size: 0.85rem;
		font-weight: 700;
	}
	.headline {
		margin-block: 0.2rem;
		font-size: 0.9rem;
	}
	.theme {
		margin-block: 0.2rem;
		color: var(--text-faint);
		font-size: 0.85rem;
	}
	.one {
		inline-size: 96px;
		margin-block-start: 0.4rem;
	}
	.played {
		display: flex;
		gap: 0.4rem;
		margin-block: 0.5rem;
	}
	.played li {
		inline-size: 84px;
	}
	.comment {
		font-size: 0.9rem;
		line-height: 1.6;
	}
	.more {
		display: block;
		margin: 1rem auto;
		padding: 0.5rem 1rem;
		border: 1px solid var(--line);
		border-radius: 999px;
		background: none;
		color: var(--text-faint);
		font-weight: 600;
	}
</style>
