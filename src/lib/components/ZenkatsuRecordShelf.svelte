<script lang="ts">
	import type { CardAttribute, ZenkatsuComboView, ZenkatsuDeckView } from '$lib/api/types';
	import { i18n, m } from '$lib/i18n/i18n.svelte';
	import AffirmationCard from './AffirmationCard.svelte';
	import ZenkatsuTrophyGuide from './ZenkatsuTrophyGuide.svelte';

	/**
	 * レコードタブの表示部分。取得は呼び出し側に任せ、モックでも同じ見た目で確かめられるようにする。
	 *
	 * 一覧を縦に積むとトロフィーが増えるほど画面が流れていくので、
	 * - トロフィーは「種類ごとのメダル1枚＋獲得回数」に畳み、選んだメダルの日付だけを開く
	 * - コンボは全種類ぶんのマス目（未発見は伏せ札）に並べ、選んだ1つだけ詳しく出す
	 * という「棚」の形にしている。
	 */
	let { record }: { record: ZenkatsuDeckView } = $props();

	const ja = $derived(i18n.locale === 'ja');

	type Medal = { kind: string; label: () => string; glyph: string; color: string };
	/** 獲得条件ガイドと同じ並び。debut は廃止前の履歴があるときだけ出す。 */
	const MEDALS: Medal[] = [
		{ kind: 'bottan', label: () => m.trophyBottan(), glyph: '👑', color: 'var(--card-attr-light)' },
		{
			kind: 'adventure',
			label: () => m.trophyAdventure(),
			glyph: '🀄',
			color: 'var(--card-attr-fire)',
		},
		{ kind: 'solo', label: () => m.trophySolo(), glyph: '🎯', color: 'var(--card-attr-water)' },
		{
			kind: 'tailwind',
			label: () => m.trophyTailwind(),
			glyph: '🌈',
			color: 'var(--card-attr-earth)',
		},
		{ kind: 'combo', label: () => m.trophyCombo(), glyph: '🔗', color: 'var(--card-attr-dark)' },
		{ kind: 'debut', label: () => m.trophyDebut(), glyph: '🌱', color: 'var(--card-attr-wind)' },
	];
	const ATTRIBUTE_COLOR: Record<CardAttribute, string> = {
		light: 'var(--card-attr-light)',
		dark: 'var(--card-attr-dark)',
		fire: 'var(--card-attr-fire)',
		water: 'var(--card-attr-water)',
		wind: 'var(--card-attr-wind)',
		earth: 'var(--card-attr-earth)',
	};

	const byKind = $derived.by(() => {
		const map = new Map<string, ZenkatsuDeckView['trophies']>();
		for (const t of record.trophies) map.set(t.kind, [...(map.get(t.kind) ?? []), t]);
		for (const list of map.values()) list.sort((a, b) => b.themeDate.localeCompare(a.themeDate));
		return map;
	});
	const medals = $derived([
		...MEDALS.filter((medal) => medal.kind !== 'debut' || byKind.has('debut')),
		// サーバーが新しい賞を足しても、表示が追いつくまで消えないようにする。
		...[...byKind.keys()]
			.filter((kind) => !MEDALS.some((medal) => medal.kind === kind))
			.map((kind) => ({ kind, label: () => kind, glyph: '🏆', color: 'var(--accent-strong)' })),
	]);
	const latestDate = $derived(
		record.trophies.reduce<string | undefined>(
			(latest, t) => (!latest || t.themeDate > latest ? t.themeDate : latest),
			undefined,
		),
	);

	let openKind = $state<string>();
	let openTrophy = $state<string>();
	let openCombo = $state<string>();
	let showTrophyGuide = $state(false);

	const openList = $derived(openKind ? (byKind.get(openKind) ?? []) : []);
	const openMedal = $derived(medals.find((medal) => medal.kind === openKind));
	const selectedTrophy = $derived(openList.find((t) => t.submissionUri + t.kind === openTrophy));
	const comboKey = (combo: ZenkatsuComboView) => `${combo.volume}:${combo.id}`;
	const selectedCombo = $derived(record.combos.find((combo) => comboKey(combo) === openCombo));
	/** まだ見つかっていないコンボの数。中身は伏せられている。 */
	const hiddenCount = $derived(Math.max(0, record.comboTotal - record.combos.length));
	const ratio = $derived(record.comboTotal ? record.combos.length / record.comboTotal : 0);

	function toggleMedal(kind: string) {
		openKind = openKind === kind ? undefined : kind;
		const first = openKind ? byKind.get(openKind)?.[0] : undefined;
		openTrophy = first ? first.submissionUri + first.kind : undefined;
	}
	const shortDate = (date: string) => {
		const [, month, day] = date.split('-').map(Number);
		return `${month}/${day}`;
	};
</script>

<div class="shelf">
	<header class="summary">
		<div class="ring" style:--ratio={ratio} aria-hidden="true">
			<span>{record.combos.length}</span>
		</div>
		<div class="summary-copy">
			<p class="summary-main">
				{m.deckCombosTitle()}
				<span
					>{m.deckCombosProgress({ found: record.combos.length, total: record.comboTotal })}</span
				>
			</p>
			<p class="summary-sub">
				🏆 {m.recordTrophyTotal({ n: record.trophies.length })}
				{#if latestDate}<span class="dot">·</span>{m.recordLatest({ date: latestDate })}{/if}
			</p>
		</div>
	</header>

	<section class="block" aria-labelledby="record-trophies">
		<div class="block-head">
			<h2 id="record-trophies">{m.deckTrophiesTitle()}</h2>
			<button type="button" class="text-button" onclick={() => (showTrophyGuide = true)}>
				{m.trophyGuideOpen()}
			</button>
		</div>
		<ul class="medals">
			{#each medals as medal (medal.kind)}
				{@const count = byKind.get(medal.kind)?.length ?? 0}
				<li>
					<button
						type="button"
						class="medal"
						class:earned={count > 0}
						class:open={openKind === medal.kind}
						style:--medal={medal.color}
						disabled={count === 0}
						aria-expanded={openKind === medal.kind}
						aria-controls="record-trophy-history"
						title={count ? medal.label() : `${medal.label()} — ${m.recordTrophyNone()}`}
						onclick={() => toggleMedal(medal.kind)}
					>
						<span class="coin" aria-hidden="true">{medal.glyph}</span>
						<span class="medal-name">{medal.label()}</span>
						{#if count}<span class="count">{m.recordTrophyCount({ n: count })}</span>{/if}
					</button>
				</li>
			{/each}
		</ul>
		{#if !record.trophies.length}
			<p class="note">{m.deckTrophiesEmpty()}</p>
		{/if}
		{#if openMedal && openList.length}
			<div class="history" id="record-trophy-history" style:--medal={openMedal.color}>
				<p class="history-title" aria-hidden="true">
					{m.recordTrophyHistory({ name: openMedal.label() })}
				</p>
				<div
					class="dates"
					role="group"
					aria-label={m.recordTrophyHistory({ name: openMedal.label() })}
				>
					{#each openList as t (t.submissionUri + t.kind)}
						<button
							type="button"
							class="date"
							class:active={openTrophy === t.submissionUri + t.kind}
							aria-pressed={openTrophy === t.submissionUri + t.kind}
							onclick={() => (openTrophy = t.submissionUri + t.kind)}
						>
							<time datetime={t.themeDate}>{shortDate(t.themeDate)}</time>
						</button>
					{/each}
				</div>
				{#if selectedTrophy}
					<div class="ticket">
						<p class="ticket-date">{selectedTrophy.themeDate}</p>
						{#if selectedTrophy.themeJa || selectedTrophy.themeEn}
							<p class="ticket-theme">
								{(ja ? selectedTrophy.themeJa : selectedTrophy.themeEn) || selectedTrophy.themeJa}
							</p>
						{/if}
						{#if selectedTrophy.commentJa || selectedTrophy.commentEn}
							<p class="ticket-comment">
								{(ja ? selectedTrophy.commentJa : selectedTrophy.commentEn) ||
									selectedTrophy.commentJa}
							</p>
						{/if}
					</div>
				{/if}
			</div>
		{/if}
	</section>

	<section class="block" aria-labelledby="record-combos">
		<div class="block-head">
			<h2 id="record-combos">{m.deckCombosTitle()}</h2>
			<span class="progress">
				{m.deckCombosProgress({ found: record.combos.length, total: record.comboTotal })}
			</span>
		</div>
		{#if !record.combos.length}
			<p class="note">{m.deckCombosEmpty()}</p>
		{/if}
		<ul class="stamps">
			{#each record.combos as combo (comboKey(combo))}
				<li>
					<button
						type="button"
						class="stamp"
						class:open={openCombo === comboKey(combo)}
						aria-expanded={openCombo === comboKey(combo)}
						aria-controls="record-combo-detail"
						onclick={() =>
							(openCombo = openCombo === comboKey(combo) ? undefined : comboKey(combo))}
					>
						<span class="pips" aria-hidden="true">
							{#each combo.slots as slot, index (index)}
								<span
									class="pip"
									style:--pip={ATTRIBUTE_COLOR[slot[0]?.attribute ?? 'light']}
									style:--tilt={`${(index - (combo.slots.length - 1) / 2) * 12}deg`}
								></span>
							{/each}
						</span>
						<span class="stamp-name">{ja ? combo.nameJa : combo.nameEn}</span>
						{#if combo.isPioneer}<span class="crown" title={m.deckComboPioneer()}>★</span>{/if}
					</button>
				</li>
			{/each}
			<!-- 未発見ぶんは1枚の伏せ札の山にまとめる。総数が多くても棚が伸びない。 -->
			{#if hiddenCount}
				<li>
					<span class="stamp hidden">
						<span class="pile" aria-hidden="true"><i></i><i></i><i>？</i></span>
						<span class="stamp-name">{m.recordComboUnknown({ n: hiddenCount })}</span>
					</span>
				</li>
			{/if}
		</ul>
		{#if selectedCombo}
			<article class="combo-detail" id="record-combo-detail">
				<div class="combo-head">
					<h3>{ja ? selectedCombo.nameJa : selectedCombo.nameEn}</h3>
					<button
						type="button"
						class="text-button"
						aria-label={m.recordComboClose()}
						onclick={() => (openCombo = undefined)}>✕</button
					>
				</div>
				{#if selectedCombo.isPioneer}<p class="pioneer">{m.deckComboPioneer()}</p>{/if}
				<p class="combo-desc">{ja ? selectedCombo.descJa : selectedCombo.descEn}</p>
				<div class="slots">
					{#each selectedCombo.slots as slot, index (index)}
						<div class="slot">
							{#each slot as card (card.volume + ':' + card.id)}
								<div class="slot-card"><AffirmationCard {card} /></div>
							{/each}
						</div>
					{/each}
				</div>
				<p class="combo-meta">
					{m.deckComboFound({ date: selectedCombo.firstPlayedDate })}
					{#if !selectedCombo.isPioneer && selectedCombo.pioneer}
						· {m.deckComboPioneerBy({
							name: selectedCombo.pioneer.displayName || selectedCombo.pioneer.handle,
						})}
					{/if}
				</p>
			</article>
		{/if}
	</section>
</div>

{#if showTrophyGuide}
	<ZenkatsuTrophyGuide onclose={() => (showTrophyGuide = false)} />
{/if}

<style>
	.shelf {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 0.25rem;
		padding-block-end: 1.5rem;
	}
	.summary {
		display: flex;
		align-items: center;
		gap: 0.9rem;
		margin: 1rem 1rem 0.25rem;
		padding: 0.8rem 1rem;
		border: 1px solid var(--line);
		border-radius: var(--r-md);
		background: linear-gradient(120deg, var(--accent-softer), var(--surface-1) 70%);
	}
	/* 発見率を円グラフの輪で見せる。中の数字は見つけた数。 */
	.ring {
		display: grid;
		flex: 0 0 auto;
		place-items: center;
		inline-size: 52px;
		block-size: 52px;
		border-radius: 50%;
		background:
			radial-gradient(closest-side, var(--surface-1) 76%, transparent 78%),
			conic-gradient(var(--accent-strong) calc(var(--ratio) * 1turn), var(--line) 0);
		font-weight: 800;
	}
	.summary-copy {
		display: grid;
		gap: 0.15rem;
		min-inline-size: 0;
	}
	.summary-main {
		font-weight: 700;
	}
	.summary-main span,
	.summary-sub {
		color: var(--text-faint);
		font-size: 0.8rem;
		font-weight: 400;
	}
	.dot {
		margin-inline: 0.35em;
	}
	.block {
		padding-block-start: 0.5rem;
	}
	.block-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.6rem;
		padding: 0.6rem 1rem 0.4rem;
	}
	h2 {
		font-size: 0.95rem;
	}
	.progress,
	.note {
		color: var(--text-faint);
		font-size: 0.8rem;
	}
	.note {
		padding: 0 1rem 0.5rem;
	}
	.text-button {
		min-block-size: 32px;
		padding: 0.2rem 0.6rem;
		border: 1px solid var(--line);
		border-radius: var(--r-md);
		background: var(--surface-1);
		color: var(--accent-strong);
		font: inherit;
		font-size: 0.8rem;
		cursor: pointer;
	}
	button:focus-visible {
		outline: 3px solid var(--accent-strong);
		outline-offset: 2px;
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	/* --- メダルケース --- */
	.medals {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
		gap: 0.5rem;
		padding: 0 1rem;
	}
	.medal {
		position: relative;
		display: grid;
		justify-items: center;
		gap: 0.3rem;
		inline-size: 100%;
		padding: 0.6rem 0.3rem 0.5rem;
		border: 1px solid var(--line);
		border-radius: var(--r-md);
		background: var(--surface-1);
		color: var(--text);
		font: inherit;
		cursor: pointer;
		transition:
			transform 0.15s,
			border-color 0.15s;
	}
	.medal:disabled {
		cursor: default;
		opacity: 0.55;
	}
	.medal.earned:hover {
		transform: translateY(-2px);
	}
	.medal.open {
		border-color: var(--medal);
		background: color-mix(in srgb, var(--medal) 10%, var(--surface-1));
	}
	.coin {
		display: grid;
		place-items: center;
		inline-size: 40px;
		block-size: 40px;
		border-radius: 50%;
		background: radial-gradient(
			circle at 30% 30%,
			color-mix(in srgb, var(--medal) 35%, white),
			var(--medal)
		);
		box-shadow:
			inset 0 0 0 3px color-mix(in srgb, var(--medal) 60%, white),
			0 2px 0 color-mix(in srgb, var(--medal) 60%, black);
		font-size: 1.2rem;
	}
	.medal:not(.earned) .coin {
		background: var(--bg-inset);
		box-shadow: inset 0 0 0 2px var(--line);
		filter: grayscale(1);
	}
	.medal-name {
		font-size: 0.7rem;
		line-height: 1.3;
		text-align: center;
	}
	.count {
		position: absolute;
		inset-block-start: 0.3rem;
		inset-inline-end: 0.3rem;
		padding: 0 0.35rem;
		border-radius: 999px;
		background: var(--medal);
		color: var(--text-on-accent);
		font-size: 0.65rem;
		font-weight: 800;
	}
	.history {
		margin: 0.6rem 1rem 0;
		padding: 0.7rem;
		border-inline-start: 3px solid var(--medal);
		border-radius: var(--r-md);
		background: color-mix(in srgb, var(--medal) 7%, var(--surface-1));
	}
	.history-title {
		margin-block-end: 0.5rem;
		color: var(--text-faint);
		font-size: 0.75rem;
	}
	.dates {
		display: flex;
		gap: 0.3rem;
		overflow-x: auto;
		padding-block-end: 0.2rem;
	}
	.date {
		flex: 0 0 auto;
		padding: 0.2rem 0.55rem;
		border: 1px solid var(--line);
		border-radius: 999px;
		background: var(--surface-1);
		color: var(--text);
		font: inherit;
		font-size: 0.75rem;
		font-variant-numeric: tabular-nums;
		cursor: pointer;
	}
	.date.active {
		border-color: var(--medal);
		background: var(--medal);
		color: var(--text-on-accent);
		font-weight: 700;
	}
	.ticket {
		margin-block-start: 0.6rem;
	}
	.ticket-date {
		color: var(--text-faint);
		font-size: 0.7rem;
	}
	.ticket-theme {
		font-weight: 700;
		font-size: 0.85rem;
	}
	.ticket-comment {
		margin-block-start: 0.3rem;
		font-size: 0.85rem;
		line-height: 1.6;
		white-space: pre-wrap;
	}

	/* --- コンボ図鑑（スタンプ帳） --- */
	.stamps {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(92px, 1fr));
		gap: 0.5rem;
		padding: 0 1rem;
	}
	.stamp {
		position: relative;
		display: grid;
		align-content: start;
		justify-items: center;
		gap: 0.35rem;
		inline-size: 100%;
		block-size: 100%;
		min-block-size: 92px;
		padding: 0.55rem 0.35rem;
		border: 1px solid var(--line);
		border-radius: var(--r-md);
		background: var(--surface-1);
		color: var(--text);
		font: inherit;
		cursor: pointer;
	}
	.stamp.open {
		border-color: var(--accent-strong);
		box-shadow: 0 0 0 2px var(--accent-soft);
	}
	.stamp.hidden {
		border-style: dashed;
		background: var(--bg-inset);
		color: var(--text-faint);
		cursor: default;
	}
	.pile {
		position: relative;
		inline-size: 24px;
		block-size: 36px;
	}
	.pile i {
		position: absolute;
		inset: 4px 0 0;
		display: grid;
		place-items: center;
		border: 2px dashed var(--line-strong);
		border-radius: 4px;
		background: var(--surface-1);
		font-style: normal;
		font-weight: 800;
	}
	.pile i:nth-child(1) {
		transform: translate(-6px, 2px) rotate(-12deg);
	}
	.pile i:nth-child(2) {
		transform: translate(6px, 2px) rotate(12deg);
	}
	/* 構成札をトランプの手札のように扇形に重ねる。色はスロットの代表属性。 */
	.pips {
		display: flex;
		justify-content: center;
		block-size: 36px;
		padding-block-start: 4px;
	}
	.pip {
		inline-size: 20px;
		block-size: 30px;
		margin-inline: -4px;
		border: 2px solid var(--surface-1);
		border-radius: 4px;
		background: linear-gradient(160deg, color-mix(in srgb, var(--pip) 55%, white), var(--pip));
		transform: rotate(var(--tilt));
		transform-origin: 50% 120%;
	}
	.stamp-name {
		display: -webkit-box;
		overflow: hidden;
		font-size: 0.72rem;
		font-weight: 700;
		line-height: 1.35;
		text-align: center;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
	}
	.crown {
		position: absolute;
		inset-block-start: 0.2rem;
		inset-inline-end: 0.35rem;
		color: var(--card-attr-light);
		font-size: 0.8rem;
	}
	.combo-detail {
		margin: 0.6rem 1rem 0;
		padding: 0.8rem;
		border: 1px solid var(--accent-strong);
		border-radius: var(--r-md);
		background: var(--surface-1);
	}
	.combo-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.5rem;
	}
	h3 {
		font-size: 0.95rem;
	}
	.pioneer {
		display: inline-block;
		margin-block-start: 0.2rem;
		padding: 1px 8px;
		border-radius: 999px;
		background: var(--accent-soft);
		color: var(--accent-strong);
		font-size: 0.72rem;
	}
	.combo-desc {
		margin-block: 0.3rem 0.6rem;
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
	@media (prefers-reduced-motion: reduce) {
		.medal {
			transition: none;
		}
	}
</style>
