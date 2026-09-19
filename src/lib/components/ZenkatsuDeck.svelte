<script lang="ts">
	import { getZenkatsuDeck } from '$lib/api/appview';
	import type { ZenkatsuDeckView } from '$lib/api/types';
	import { i18n, m } from '$lib/i18n/i18n.svelte';
	import AffirmationCard from './AffirmationCard.svelte';
	import CardCollection from './CardCollection.svelte';

	/**
	 * マイデッキ。図鑑・見つけたコンボ・トロフィーを1枚にまとめる。
	 *
	 * **未発見のコンボは中身を出さない。** 総数だけ出して「26種のうち3種」と示す。
	 * 名前入りで並べてしまうと、隠し要素にした意味が無くなる。
	 */
	let { did }: { did: string } = $props();

	let deck = $state<ZenkatsuDeckView | undefined>();
	let loading = $state(true);

	$effect(() => {
		void did;
		loading = true;
		getZenkatsuDeck()
			.then((result) => (deck = result))
			// デッキが取れなくても図鑑は出したいので、ここでは黙って諦める。
			.catch(() => (deck = undefined))
			.finally(() => (loading = false));
	});

	const ja = $derived(i18n.locale === 'ja');
	const TROPHY_LABEL: Record<string, () => string> = {
		botan: () => m.trophyBotan(),
		adventure: () => m.trophyAdventure(),
		debut: () => m.trophyDebut(),
		solo: () => m.trophySolo(),
		tailwind: () => m.trophyTailwind(),
		combo: () => m.trophyCombo(),
	};
</script>

<section class="block">
	<h2>{m.deckCardsTitle()}</h2>
	<CardCollection {did} isSelf />
</section>

{#if !loading && deck}
	<section class="block">
		<h2>
			{m.deckCombosTitle()}
			<span class="progress"
				>{m.deckCombosProgress({ found: deck.combos.length, total: deck.comboTotal })}</span
			>
		</h2>
		{#if !deck.combos.length}
			<p class="note">{m.deckCombosEmpty()}</p>
		{/if}
		<ul class="combos">
			{#each deck.combos as combo (combo.volume + ':' + combo.id)}
				<li class="combo">
					<p class="combo-name">
						{ja ? combo.nameJa : combo.nameEn}
						{#if combo.isPioneer}<span class="pioneer">{m.deckComboPioneer()}</span>{/if}
					</p>
					<p class="combo-desc">{ja ? combo.descJa : combo.descEn}</p>
					<div class="slots">
						{#each combo.slots as slot, index (index)}
							<div class="slot">
								{#each slot as card (card.volume + ':' + card.id)}
									<div class="slot-card"><AffirmationCard {card} /></div>
								{/each}
							</div>
						{/each}
					</div>
					<p class="combo-meta">
						{m.deckComboFound({ date: combo.firstPlayedDate })}
						{#if !combo.isPioneer && combo.pioneer}
							· {m.deckComboPioneerBy({
								name: combo.pioneer.displayName || combo.pioneer.handle,
							})}
						{/if}
					</p>
				</li>
			{/each}
		</ul>
	</section>

	<section class="block">
		<h2>{m.deckTrophiesTitle()}</h2>
		{#if !deck.trophies.length}
			<p class="note">{m.deckTrophiesEmpty()}</p>
		{/if}
		<ul class="trophies">
			{#each deck.trophies as t (t.themeDate + t.kind)}
				<li class="trophy">
					<span class="trophy-icon">🏆</span>
					<div>
						<p class="trophy-kind">{(TROPHY_LABEL[t.kind] ?? (() => t.kind))()}</p>
						<p class="trophy-date">{t.themeDate}</p>
						{#if t.commentJa || t.commentEn}
							<p class="trophy-comment">{(ja ? t.commentJa : t.commentEn) || t.commentJa}</p>
						{/if}
					</div>
				</li>
			{/each}
		</ul>
	</section>
{/if}

<style>
	.block {
		padding-block-end: 1.5rem;
	}
	h2 {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
		padding: 1rem 1rem 0.5rem;
		font-size: 0.95rem;
	}
	.progress {
		color: var(--text-faint);
		font-size: 0.8rem;
		font-weight: 400;
	}
	.note {
		padding: 0 1rem 1rem;
		color: var(--text-faint);
		font-size: 0.9rem;
	}
	.combos,
	.trophies,
	.slots,
	.slot {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.combo {
		padding: 0.9rem 1rem;
		border-block-start: 1px solid var(--line);
	}
	.combo-name {
		font-weight: 700;
	}
	.pioneer {
		margin-inline-start: 0.5em;
		padding: 1px 8px;
		border-radius: 999px;
		background: var(--accent-soft);
		color: var(--accent-strong);
		font-size: 0.75rem;
	}
	.combo-desc {
		margin-block: 0.2rem 0.5rem;
		color: var(--text-faint);
		font-size: 0.85rem;
		line-height: 1.6;
	}
	.slots {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
	}
	/* 1スロットに複数あるのは「どちらでもよい」。縦に重ねて1枠に見せる。 */
	.slot {
		display: flex;
		gap: 0.2rem;
	}
	.slot-card {
		inline-size: 72px;
	}
	.combo-meta {
		margin-block-start: 0.5rem;
		color: var(--text-faint);
		font-size: 0.75rem;
	}
	.trophy {
		display: flex;
		gap: 0.7rem;
		padding: 0.8rem 1rem;
		border-block-start: 1px solid var(--line);
	}
	.trophy-icon {
		font-size: 1.4rem;
	}
	.trophy-kind {
		font-weight: 700;
		font-size: 0.9rem;
	}
	.trophy-date {
		color: var(--text-faint);
		font-size: 0.75rem;
	}
	.trophy-comment {
		margin-block-start: 0.3rem;
		font-size: 0.85rem;
		line-height: 1.6;
	}
</style>
