<script lang="ts">
	import { getZenkatsuDeck } from '$lib/api/appview';
	import type { ZenkatsuDeckView } from '$lib/api/types';
	import { i18n, m } from '$lib/i18n/i18n.svelte';
	import AffirmationCard from './AffirmationCard.svelte';
	import ZenkatsuTrophyGuide from './ZenkatsuTrophyGuide.svelte';

	/** 未発見のコンボはサーバーから中身が返らない。 */
	let { did }: { did: string } = $props();
	let record = $state<ZenkatsuDeckView>();
	let loading = $state(true);
	let error = $state(false);
	let showTrophyGuide = $state(false);

	$effect(() => {
		void did;
		let active = true;
		record = undefined;
		loading = true;
		error = false;
		getZenkatsuDeck()
			.then((result) => {
				if (active) record = result;
			})
			.catch(() => {
				if (active) error = true;
			})
			.finally(() => {
				if (active) loading = false;
			});
		return () => {
			active = false;
		};
	});

	const ja = $derived(i18n.locale === 'ja');
	const TROPHY_LABEL: Record<string, () => string> = {
		botan: () => m.trophyBotan(),
		adventure: () => m.trophyAdventure(),
		debut: () => m.trophyDebut(), // 廃止前に受け取った履歴の表示用
		solo: () => m.trophySolo(),
		tailwind: () => m.trophyTailwind(),
		combo: () => m.trophyCombo(),
	};
	const TROPHY_COLOR: Record<string, string> = {
		botan: 'var(--card-attr-light)',
		adventure: 'var(--card-attr-fire)',
		debut: 'var(--card-attr-wind)',
		solo: 'var(--card-attr-water)',
		tailwind: 'var(--card-attr-earth)',
		combo: 'var(--card-attr-dark)',
	};
</script>

{#if loading}
	<p class="state">…</p>
{:else if error || !record}
	<p class="state">{m.recordFetchFailed()}</p>
{:else}
	<section class="block">
		<h2>
			{m.deckCombosTitle()}
			<span class="progress"
				>{m.deckCombosProgress({ found: record.combos.length, total: record.comboTotal })}</span
			>
		</h2>
		{#if !record.combos.length}
			<p class="note">{m.deckCombosEmpty()}</p>
		{/if}
		<ul class="combos">
			{#each record.combos as combo (combo.volume + ':' + combo.id)}
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
		<h2 class="trophies-heading">
			{m.deckTrophiesTitle()}
			<button type="button" class="trophy-guide-trigger" onclick={() => (showTrophyGuide = true)}>
				{m.trophyGuideOpen()}
			</button>
		</h2>
		{#if !record.trophies.length}
			<p class="note">{m.deckTrophiesEmpty()}</p>
		{/if}
		<ul class="trophies">
			{#each record.trophies as t (t.themeDate + t.kind)}
				<li class="trophy" style:--trophy-accent={TROPHY_COLOR[t.kind] ?? 'var(--accent-strong)'}>
					<span class="trophy-icon" aria-hidden="true">🏆</span>
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

{#if showTrophyGuide}
	<ZenkatsuTrophyGuide onclose={() => (showTrophyGuide = false)} />
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
	.trophies-heading {
		align-items: center;
	}
	.trophy-guide-trigger {
		min-height: 36px;
		padding: 0.3rem 0.7rem;
		border: 1px solid var(--line);
		border-radius: var(--r-md);
		background: var(--surface-1);
		color: var(--accent-strong);
		font: inherit;
		font-size: 0.8rem;
		cursor: pointer;
	}
	.trophy-guide-trigger:focus-visible {
		outline: 3px solid var(--accent-strong);
		outline-offset: 2px;
	}
	.note,
	.state {
		padding: 0 1rem 1rem;
		color: var(--text-faint);
		font-size: 0.9rem;
	}
	.state {
		padding-block: 2rem;
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
	/* 1スロットに複数あるのは「どちらでもよい」。 */
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
		align-items: flex-start;
		gap: 0.7rem;
		margin: 0.5rem 1rem;
		padding: 0.8rem;
		border: 1px solid color-mix(in srgb, var(--trophy-accent) 45%, var(--line));
		border-inline-start: 4px solid var(--trophy-accent);
		border-radius: var(--r-md);
		background: color-mix(in srgb, var(--trophy-accent) 8%, var(--surface-1));
	}
	.trophy-icon {
		flex: 0 0 auto;
		padding: 0.2rem;
		border-radius: var(--r-sm);
		background: color-mix(in srgb, var(--trophy-accent) 20%, var(--surface-1));
		font-size: 1.3rem;
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
