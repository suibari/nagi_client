<script lang="ts">
	import CardNewsList from '$lib/components/CardNewsList.svelte';
	import ZenkatsuDeck from '$lib/components/ZenkatsuDeck.svelte';
	import ZenkatsuRecord from '$lib/components/ZenkatsuRecord.svelte';
	import ZenkatsuBoard from '$lib/components/ZenkatsuBoard.svelte';
	import CardShareBoard from '$lib/components/CardShareBoard.svelte';
	import { page } from '$app/state';
	import { m } from '$lib/i18n/i18n.svelte';
	import { session } from '$lib/oauth/session.svelte';

	/**
	 * 全肯定カードのページ。5タブで役割を分ける。
	 * - あそぶ: ゼンカツ！の今日のお題・プレイ・記録
	 * - おすそわけ: だぶったカードを置いて Ƶ をもらい、持っていないカードを受け取る
	 * - ニュース: 今この瞬間の出来事（レアドローと、ゼンカツの珍しい回）
	 * - レコード: 見つけたコンボ・受け取ったトロフィー
	 * - マイデッキ: 自分のカード図鑑
	 *
	 * 遊ぶ・交換するの「手を動かす」タブを左に、眺めるタブを右に寄せる。
	 * ゼンカツを先頭に置く。**1日1回しかできない**のはこのタブだけで、
	 * 遅れて気づくほど損をする。ニュースとデッキはいつ見ても同じものが見られる。
	 */
	type TabId = 'news' | 'record' | 'collection' | 'zenkatsu' | 'board';
	const tabs: { id: TabId; label: () => string }[] = [
		{ id: 'zenkatsu', label: () => m.cardsTabZenkatsu() },
		{ id: 'board', label: () => m.cardsTabBoard() },
		{ id: 'news', label: () => m.cardsTabNews() },
		{ id: 'record', label: () => m.cardsTabRecord() },
		{ id: 'collection', label: () => m.cardsTabCollection() },
	];
	// 「カードが届きました」通知からはおすそわけタブへ直接来る（?tab=board）。
	const requested = page.url.searchParams.get('tab');
	let tab = $state<TabId>(tabs.some((t) => t.id === requested) ? (requested as TabId) : 'zenkatsu');
</script>

<div class="tabs" role="tablist">
	{#each tabs as t (t.id)}
		<button
			role="tab"
			aria-selected={tab === t.id}
			class:active={tab === t.id}
			onclick={() => (tab = t.id)}>{t.label()}</button
		>
	{/each}
</div>

{#if tab === 'news'}
	<CardNewsList />
{:else if tab === 'record'}
	{#if $session}
		<ZenkatsuRecord did={$session.did} />
	{:else}
		<div class="state">{m.zenkatsuSignInToPlay()}</div>
	{/if}
{:else if tab === 'board'}
	{#if $session}
		<CardShareBoard did={$session.did} />
	{:else}
		<div class="state">{m.zenkatsuSignInToPlay()}</div>
	{/if}
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
		overflow-x: auto;
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
