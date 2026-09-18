<script lang="ts">
	import { getZenkatsu } from '$lib/api/appview';
	import type {
		CardAttribute,
		CardView,
		ZenkatsuFeed,
		ZenkatsuPlayableCard,
		ZenkatsuSubmissionView,
	} from '$lib/api/types';
	import { cardCollections } from '$lib/cards/collection.svelte';
	import { createZenkatsu } from '$lib/atproto/records';
	import { i18n, m } from '$lib/i18n/i18n.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import AffirmationCard from './AffirmationCard.svelte';

	/** 属性名はカード面と同じ訳語を使う（「追い風: dark」と生で出さない）。 */
	const ATTRIBUTE_LABEL: Record<CardAttribute, () => string> = {
		light: m.cardAttributeLight,
		dark: m.cardAttributeDark,
		fire: m.cardAttributeFire,
		water: m.cardAttributeWater,
		wind: m.cardAttributeWind,
		earth: m.cardAttributeEarth,
	};

	/**
	 * ゼンカツ！の盤面。お題 → プレイ → その日の記録（新着順）。
	 *
	 * **スコアも順位も出さない。** 出した札と botたんの総評だけを並べる。順位を出した瞬間に
	 * 下位を黙って否定することになり、全肯定と正面から衝突する（docs/zenkatsu.md 1章）。
	 */

	let feed = $state<ZenkatsuFeed | undefined>();
	let loading = $state(true);
	let error = $state('');
	/** 見ている日付。undefined なら今日。 */
	let date = $state<string | undefined>();
	let picking = $state(false);
	let picked = $state<{ volume: number; id: number }[]>([]);
	let confirming = $state(false);
	let submitting = $state(false);
	let submitError = $state('');
	let loadingMore = $state(false);

	const keyOf = (c: { volume: number; id: number }) => `${c.volume}:${c.id}`;

	async function load(next?: string) {
		loading = !next;
		error = '';
		try {
			const result = await getZenkatsu({
				...(date ? { date } : {}),
				...(next ? { cursor: next } : {}),
			});
			feed =
				next && feed
					? { ...result, submissions: [...feed.submissions, ...result.submissions] }
					: result;
		} catch {
			error = m.zenkatsuFetchFailed();
		} finally {
			loading = false;
			loadingMore = false;
		}
	}

	$effect(() => {
		void date;
		void $session?.did;
		void load();
	});

	// 手札の定義は図鑑（getCards）から引く。playable は「どれを何枚出せるか」だけを持つ。
	let collection = $derived($session ? cardCollections.view($session.did) : undefined);
	let cardByKey = $derived(
		new Map<string, CardView>(
			[...(collection?.cards ?? []), ...(collection?.anniversaryCards ?? [])].map(
				(c) => [keyOf(c), c],
			),
		),
	);
	let playable = $derived(feed?.viewer?.playable ?? []);
	// 出せるものを先に、おやすみ中は後ろへ。図鑑の順は崩さない。
	let hand = $derived(
		playable
			.map((p) => ({ p, card: cardByKey.get(keyOf(p)) }))
			.filter((e): e is { p: ZenkatsuPlayableCard; card: CardView } => !!e.card)
			.sort((a, b) => (b.p.available > 0 ? 1 : 0) - (a.p.available > 0 ? 1 : 0)),
	);
	let maxCards = $derived(feed?.viewer?.maxCards ?? 3);
	let canPlay = $derived(!!$session && !!feed?.viewer && !feed.viewer.submitted && !date);

	function toggle(entry: { p: ZenkatsuPlayableCard; card: CardView }) {
		if (entry.p.available < 1) return;
		const key = keyOf(entry.p);
		const at = picked.findIndex((c) => keyOf(c) === key);
		if (at >= 0) picked = picked.filter((_, i) => i !== at);
		else if (picked.length < maxCards)
			picked = [...picked, { volume: entry.p.volume, id: entry.p.id }];
	}

	async function submit() {
		if (!feed || !picked.length) return;
		submitting = true;
		submitError = '';
		try {
			await createZenkatsu(feed.theme.themeDate, picked);
			picking = false;
			confirming = false;
			picked = [];
			await load();
			// 出した札はおやすみに入るので、手札の残りを取り直す。
			if ($session) await cardCollections.refresh($session.did);
		} catch {
			submitError = m.zenkatsuSubmitFailed();
		} finally {
			submitting = false;
		}
	}

	const commentOf = (s: ZenkatsuSubmissionView) =>
		(i18n.locale === 'ja' ? s.commentJa : s.commentEn) || s.commentJa || s.commentEn;
	const shiftDate = (base: string, days: number) => {
		const d = new Date(`${base}T00:00:00Z`);
		d.setUTCDate(d.getUTCDate() + days);
		return d.toISOString().slice(0, 10);
	};
</script>

<!-- ロゴはページの顔なので、読み込みを待たずに出す（空白から始めない）。 -->
<section class="play">
	<img class="logo" src="/zenkatsu-logo.png" alt={m.zenkatsuTitle()} width="1671" height="941" />
</section>

{#if loading}
	<div class="state">…</div>
{:else if error}
	<div class="state">{error}</div>
{:else if feed}
	<section class="theme">
		<p class="theme-label">{m.zenkatsuThemeLabel()}</p>
		<p class="theme-text">{i18n.locale === 'ja' ? feed.theme.textJa : feed.theme.textEn}</p>
		<p class="tailwind">{m.zenkatsuTailwind({ attribute: ATTRIBUTE_LABEL[feed.theme.attribute]() })}</p>
	</section>

	<section class="play">
		{#if !$session}
			<p class="note">{m.zenkatsuSignInToPlay()}</p>
		{:else if feed.viewer?.submitted}
			<p class="note">{m.zenkatsuPlayAgainTomorrow()}</p>
		{:else if canPlay && !picking}
			<button class="play-button" onclick={() => (picking = true)}>{m.zenkatsuPlay()}</button>
		{/if}
	</section>

	{#if picking}
		<section class="picker">
			<p class="pick-prompt">{m.zenkatsuPickPrompt({ max: maxCards })}</p>
			{#if !hand.length}
				<p class="note">{m.zenkatsuNoCards()}</p>
			{/if}
			<ul class="hand">
				{#each hand as entry (keyOf(entry.p))}
					{@const chosen = picked.some((c) => keyOf(c) === keyOf(entry.p))}
					<li>
						<button
							class="hand-card"
							class:chosen
							class:resting={entry.p.available < 1}
							disabled={entry.p.available < 1}
							aria-pressed={chosen}
							onclick={() => toggle(entry)}
						>
							<AffirmationCard card={entry.card} />
							{#if entry.p.available < 1}
								<span class="badge resting-badge"
									>{entry.p.restingDays
										? m.zenkatsuResting({ days: entry.p.restingDays })
										: m.zenkatsuRestingShort()}</span
								>
							{:else if entry.p.available > 1}
								<span class="badge">{m.zenkatsuStock({ n: entry.p.available })}</span>
							{/if}
						</button>
					</li>
				{/each}
			</ul>
			<div class="picker-actions">
				<span class="count">{m.zenkatsuPickedCount({ picked: picked.length, max: maxCards })}</span>
				<button class="ghost" onclick={() => ((picking = false), (picked = []))}
					>{m.zenkatsuCancel()}</button
				>
				<button class="play-button" disabled={!picked.length} onclick={() => (confirming = true)}
					>{m.zenkatsuSubmit()}</button
				>
			</div>
			{#if submitError}<p class="note error">{submitError}</p>{/if}
		</section>
	{/if}

	{#if confirming}
		<div class="confirm" role="dialog" aria-modal="true">
			<div class="confirm-body">
				<p class="confirm-title">{m.zenkatsuConfirmTitle()}</p>
				<p class="confirm-note">{m.zenkatsuConfirmBody()}</p>
				<div class="confirm-actions">
					<button class="ghost" onclick={() => (confirming = false)}>{m.zenkatsuCancel()}</button>
					<button class="play-button" disabled={submitting} onclick={submit}
						>{submitting ? m.zenkatsuSubmitting() : m.zenkatsuConfirmOk()}</button
					>
				</div>
			</div>
		</div>
	{/if}

	<section class="record">
		<h2>{m.zenkatsuRecordTitle()}</h2>
		{#if !feed.submissions.length}
			<p class="note">{m.zenkatsuRecordEmpty()}</p>
		{/if}
		<ul class="entries">
			{#each feed.submissions as s (s.uri)}
				<li class="entry">
					<p class="who">{s.author.displayName || s.author.handle}</p>
					<ul class="played">
						{#each s.cards as card (card.volume + ':' + card.id)}
							<li><AffirmationCard {card} /></li>
						{/each}
					</ul>
					<p class="comment" class:pending={s.commentPending}>
						{commentOf(s) || m.zenkatsuCommentPending()}
					</p>
				</li>
			{/each}
		</ul>
		{#if feed.cursor}
			<button
				class="ghost more"
				disabled={loadingMore}
				onclick={() => ((loadingMore = true), load(feed?.cursor))}>{m.zenkatsuLoadMore()}</button
			>
		{/if}
		<nav class="days">
			<button class="ghost" onclick={() => (date = shiftDate(feed?.theme.themeDate ?? '', -1))}
				>‹ {m.zenkatsuPrevDay()}</button
			>
			{#if date}
				<button class="ghost" onclick={() => (date = undefined)}>{m.zenkatsuNextDay()} ›</button>
			{/if}
		</nav>
	</section>
{/if}

<style>
	.state,
	.note {
		padding: 1rem;
		color: var(--text-faint);
		text-align: center;
	}
	.note.error {
		color: var(--danger, #c0392b);
	}
	.theme {
		padding: 1rem;
		text-align: center;
	}
	.theme-label {
		font-size: 0.8rem;
		color: var(--text-faint);
	}
	.theme-text {
		margin: 0.3rem 0;
		font-size: 1.15rem;
		font-weight: 700;
		line-height: 1.5;
	}
	.tailwind {
		font-size: 0.85rem;
		color: var(--text-faint);
	}
	.play {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.6rem;
		padding: 0 1rem 1rem;
	}
	/* ロゴは原寸 1671x941。縦幅で効かせて、狭い画面でも溢れないようにする。 */
	.logo {
		inline-size: min(100%, 320px);
		block-size: auto;
	}
	.play-button {
		padding: 0.7rem 2rem;
		border: 0;
		border-radius: 999px;
		background: var(--accent-strong);
		color: #fff;
		font-size: 1rem;
		font-weight: 700;
	}
	.play-button:disabled {
		opacity: 0.5;
	}
	.ghost {
		padding: 0.5rem 1rem;
		border: 1px solid var(--line);
		border-radius: 999px;
		background: none;
		color: var(--text-faint);
		font-weight: 600;
	}
	.picker {
		padding: 0 1rem 1rem;
	}
	.pick-prompt {
		margin-block-end: 0.6rem;
		font-size: 0.9rem;
		color: var(--text-faint);
	}
	.hand,
	.played,
	.entries {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.hand {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
		gap: 0.5rem;
	}
	.hand-card {
		position: relative;
		inline-size: 100%;
		padding: 0;
		border: 2px solid transparent;
		border-radius: 10px;
		background: none;
	}
	.hand-card.chosen {
		border-color: var(--accent-strong);
	}
	/* 「使用不可」に見せない。休んでいるだけ、が伝わる薄さに留める。 */
	.hand-card.resting {
		opacity: 0.45;
	}
	.badge {
		position: absolute;
		inset-block-end: 4px;
		inset-inline-start: 50%;
		translate: -50% 0;
		padding: 1px 8px;
		border-radius: 999px;
		background: rgb(0 0 0 / 0.65);
		color: #fff;
		font-size: 0.7rem;
		white-space: nowrap;
	}
	.picker-actions {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.5rem;
		margin-block-start: 0.8rem;
	}
	.count {
		margin-inline-end: auto;
		color: var(--text-faint);
		font-size: 0.85rem;
	}
	.confirm {
		position: fixed;
		inset: 0;
		display: grid;
		place-items: center;
		background: rgb(0 0 0 / 0.5);
		z-index: 50;
	}
	.confirm-body {
		inline-size: min(90vw, 320px);
		padding: 1.2rem;
		border-radius: 14px;
		background: var(--bg, #fff);
		text-align: center;
	}
	.confirm-title {
		font-weight: 700;
	}
	.confirm-note {
		margin-block: 0.5rem 1rem;
		color: var(--text-faint);
		font-size: 0.85rem;
	}
	.confirm-actions {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
	}
	.record {
		padding: 0 1rem 2rem;
	}
	.record h2 {
		margin-block: 1rem 0.6rem;
		font-size: 0.95rem;
	}
	.entry {
		padding-block: 0.9rem;
		border-block-start: 1px solid var(--line);
	}
	.who {
		font-size: 0.85rem;
		font-weight: 700;
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
	.comment.pending {
		color: var(--text-faint);
	}
	.more {
		display: block;
		margin: 1rem auto 0;
	}
	.days {
		display: flex;
		justify-content: space-between;
		margin-block-start: 1.2rem;
	}
</style>
