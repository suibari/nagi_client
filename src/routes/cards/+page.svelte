<script lang="ts">
	import CardNewsList from '$lib/components/CardNewsList.svelte';
	import ZenkatsuDeck from '$lib/components/ZenkatsuDeck.svelte';
	import ZenkatsuBoard from '$lib/components/ZenkatsuBoard.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import { session } from '$lib/oauth/session.svelte';

	/**
	 * 全肯定カードのページ。3タブで役割を分ける。
	 * - ニュース: 今この瞬間の出来事（レアドローと、ゼンカツの珍しい回）
	 * - マイデッキ: 自分の図鑑・見つけたコンボ・トロフィー
	 * - ゼンカツ！: 今日のお題・プレイ・記録
	 */
	type TabId = 'news' | 'collection' | 'zenkatsu';
	const tabs: { id: TabId; label: () => string }[] = [
		{ id: 'news', label: () => m.cardsTabNews() },
		{ id: 'collection', label: () => m.cardsTabCollection() },
		{ id: 'zenkatsu', label: () => m.cardsTabZenkatsu() },
	];
	let tab = $state<TabId>('news');
</script>

<svelte:head><title>{m.cardsPageTitle()}</title></svelte:head>

<div class="tabs" role="tablist">
	{#each tabs as t (t.id)}
		<button role="tab" aria-selected={tab === t.id} class:active={tab === t.id} onclick={() => (tab = t.id)}
			>{t.label()}</button
		>
	{/each}
</div>

{#if tab === 'news'}
	<CardNewsList />
{:else if tab === 'collection'}
	{#if $session}
		<ZenkatsuDeck did={$session.did} />
	{:else}
		<div class="state">{m.zenkatsuSignInToPlay()}</div>
	{/if}
{:else}
	<ZenkatsuBoard />
{/if}

<style>
	.tabs {
		display: flex;
		gap: 4px;
		padding: 0 1rem;
		border-block-end: 1px solid var(--line);
	}
	.tabs button {
		flex: 0 0 auto;
		padding: 0.6rem 0.9rem;
		border: 0;
		border-block-end: 2px solid transparent;
		background: none;
		color: var(--text-faint);
		font-size: 0.9rem;
		font-weight: 700;
	}
	.tabs button.active {
		color: var(--text);
		border-block-end-color: var(--accent-strong);
	}
	.state {
		padding: 2rem 1rem;
		color: var(--text-faint);
		text-align: center;
	}
</style>
