<script lang="ts">
	import { getCardNews } from '$lib/api/appview';
	import type { CardNewsFeed, CardNewsItem, CardView } from '$lib/api/types';
	import { dayHeading, dayKey, i18n, m } from '$lib/i18n/i18n.svelte';
	import AffirmationCard from './AffirmationCard.svelte';
	import CardDetailDialog from './CardDetailDialog.svelte';
	import CardItemReactions from './CardItemReactions.svelte';
	import ZenkatsuMarks from './ZenkatsuMarks.svelte';
	import AvatarLink from './AvatarLink.svelte';
	import CardBotReview from './CardBotReview.svelte';

	/**
	 * 全肯定カードのニュース。R以上のドローと、ゼンカツのハイライトだけが並ぶ。
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
			feed = cursor && feed ? { ...result, items: [...feed.items, ...result.items] } : result;
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

	/**
	 * 拡大表示。**他人のカードなので `draw` も `actor` も渡さない**
	 * （ドロー演出は自分が引いた瞬間のもので、botたんコメントは持ち主にしか出ない）。
	 */
	let opened = $state<CardView>();

	const comboHeadline = (item: CardNewsItem) => {
		const found = item.pioneerCombos ?? [];
		const first = found[0];
		if (!first) return '';
		const name = i18n.locale === 'ja' ? first.nameJa : first.nameEn;
		return found.length > 1
			? m.cardNewsComboFoundMany({ name, n: found.length - 1 })
			: m.cardNewsComboFound({ name });
	};
</script>

{#snippet playedCard(card: CardView)}
	<button type="button" class="card-slot" onclick={() => (opened = card)}>
		<AffirmationCard {card} />
		<span class="visually-hidden">{m.cardOpenDetail()}</span>
	</button>
{/snippet}

{#if loading}
	<div class="state">…</div>
{:else if error}
	<div class="state">{error}</div>
{:else if !feed?.items.length}
	<div class="state">{m.cardNewsEmpty()}</div>
{:else}
	<ul class="news">
		{#each feed.items as item, index (item.uri)}
			{#if dayKey(item.at) && (index === 0 || dayKey(item.at) !== dayKey(feed.items[index - 1].at))}
				<li class="day-heading">
					<h2><time datetime={dayKey(item.at)}>{dayHeading(item.at)}</time></h2>
				</li>
			{/if}
			<li class="item">
				<div class="author">
					<AvatarLink actor={item.author} size="small" />
					<p class="who">{item.author.displayName || item.author.handle}</p>
				</div>
				{#if item.type === 'cardGet' && item.card}
					<p class="headline">
						{m.cardNewsGot({ name: i18n.locale === 'ja' ? item.card.nameJa : item.card.nameEn })}
					</p>
					<div class="one">{@render playedCard(item.card)}</div>
				{:else}
					<!-- comboFound はゼンカツの回そのもの。中身は同じで、見出しだけが変わる。 -->
					{#if item.type === 'comboFound'}
						<p class="headline pioneer">{comboHeadline(item)}</p>
					{/if}
					{#if item.themeJa}<p class="theme">
							{i18n.locale === 'ja' ? item.themeJa : (item.themeEn ?? item.themeJa)}
						</p>{/if}
					<ul class="played">
						{#each item.cards ?? [] as card (card.volume + ':' + card.id)}
							<li>{@render playedCard(card)}</li>
						{/each}
					</ul>
					<ZenkatsuMarks
						tailwindCount={item.tailwindCount}
						combos={item.combos}
						pioneerCombos={item.pioneerCombos}
					/>
					{#if item.commentJa || item.commentEn}
						<CardBotReview
							comment={(i18n.locale === 'ja' ? item.commentJa : item.commentEn) ||
								item.commentJa ||
								item.commentEn ||
								''}
						/>
					{/if}
				{/if}
				<CardItemReactions uri={item.uri} cid={item.cid} reactions={item.reactions} />
			</li>
		{/each}
	</ul>
	{#if opened}
		<CardDetailDialog initial={opened} onclose={() => (opened = undefined)} />
	{/if}
	{#if feed.cursor}
		<button
			class="more"
			disabled={loadingMore}
			onclick={() => ((loadingMore = true), load(feed?.cursor))}>{m.zenkatsuLoadMore()}</button
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
	.day-heading {
		padding: 0.8rem 1rem 0.4rem;
		background: var(--bg-raised);
	}
	.day-heading h2 {
		margin: 0;
		color: var(--text-faint);
		font-size: 0.8rem;
		font-weight: 600;
	}
	.item {
		padding: 0.9rem 1rem;
		border-block-end: 1px solid var(--line);
	}
	.author {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin-block-end: 0.4rem;
	}
	.who {
		min-width: 0;
		margin: 0;
		overflow-wrap: anywhere;
		font-size: 0.85rem;
		font-weight: 700;
	}
	.headline {
		margin-block: 0.2rem;
		font-size: 0.9rem;
	}
	/* 世界初の発見だけは、ニュースの中で一段強い見出しにする。 */
	.headline.pioneer {
		color: var(--accent-strong);
		font-weight: 700;
	}
	/* 拡大表示のトリガ。カードの寸法は親の li が決めるので、ボタン側は素通しにする。 */
	.card-slot {
		display: block;
		inline-size: 100%;
		padding: 0;
		border: 0;
		border-radius: var(--radius-s);
		background: none;
		color: inherit;
		font: inherit;
		text-align: start;
		cursor: pointer;
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
