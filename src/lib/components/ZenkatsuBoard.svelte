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
	import CardBotReview from './CardBotReview.svelte';
	import AvatarLink from './AvatarLink.svelte';
	import ZenkatsuPlay from './ZenkatsuPlay.svelte';
	import ZenkatsuHelp from './ZenkatsuHelp.svelte';

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
	let showGuide = $state(false);
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
			[...(collection?.cards ?? []), ...(collection?.anniversaryCards ?? [])].map((c) => [
				keyOf(c),
				c,
			]),
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

	async function submit(cards: { volume: number; id: number }[]) {
		if (!feed) throw new Error('Missing theme');
		const result = await createZenkatsu(feed.theme.themeDate, cards);
		// 提出後の再取得が失敗しても、成功した提出を再送させない。
		if (feed.viewer) feed = { ...feed, viewer: { ...feed.viewer, submitted: true } };
		void load();
		if ($session) void cardCollections.refresh($session.did).catch(() => {});
		return result.data.uri;
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
		<p class="theme-text">
			{i18n.locale === 'ja' ? feed.theme.textJa : feed.theme.textEn}
			<span class="theme-question">{m.zenkatsuThemeQuestion()}</span>
		</p>
		<p class="recommended-attribute">
			{m.zenkatsuRecommendedAttribute({ attribute: ATTRIBUTE_LABEL[feed.theme.attribute]() })}
		</p>
	</section>

	<section class="play">
		{#if !$session}
			<p class="note">{m.zenkatsuSignInToPlay()}</p>
		{:else if feed.viewer?.submitted}
			<p class="note">{m.zenkatsuPlayAgainTomorrow()}</p>
		{/if}
		<div class="play-controls">
			{#if canPlay && !picking}
				<button class="play-button" onclick={() => (picking = true)}>{m.zenkatsuPlay()}</button>
			{/if}
			<button
				class="guide-button"
				aria-expanded={showGuide}
				aria-haspopup="dialog"
				aria-controls="zenkatsu-guide"
				onclick={() => (showGuide = !showGuide)}>{m.zenkatsuHowToPlay()}</button
			>
		</div>
	</section>

	<section class="record">
		<h2>{m.zenkatsuRecordTitle()}</h2>
		{#if !feed.submissions.length}
			<p class="note">{m.zenkatsuRecordEmpty()}</p>
		{/if}
		<ul class="entries">
			{#each feed.submissions as s (s.uri)}
				<li class="entry">
					<div class="entry-author">
						<AvatarLink actor={s.author} size="small" />
						<p class="who">{s.author.displayName || s.author.handle}</p>
					</div>
					<ul class="played">
						{#each s.cards as card (card.volume + ':' + card.id)}
							<li><AffirmationCard {card} /></li>
						{/each}
					</ul>
					<CardBotReview
						comment={commentOf(s) || m.zenkatsuCommentPending()}
						pending={s.commentPending}
					/>
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

<!-- 提出後の一覧再取得中も、カットインと総評の画面を維持する。 -->
{#if showGuide}
	<ZenkatsuHelp id="zenkatsu-guide" {maxCards} onclose={() => (showGuide = false)} />
{/if}
{#if picking && feed}
	<ZenkatsuPlay
		{hand}
		{maxCards}
		theme={feed.theme}
		onsubmit={submit}
		onclose={() => (picking = false)}
	/>
{/if}

<style>
	.state,
	.note {
		padding: 1rem;
		color: var(--text-faint);
		text-align: center;
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
	.theme-question {
		display: block;
		margin-top: 0.35rem;
		color: var(--accent-strong);
	}
	.recommended-attribute {
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
		padding: 10px 18px;
		border: 0;
		border-radius: var(--r-md);
		background: var(--accent-strong);
		color: #fff;
		font-size: 1rem;
		font-weight: 700;
		min-height: 44px;
		letter-spacing: 0.02em;
	}
	.play-button:disabled {
		opacity: 0.5;
	}
	.play-controls {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.75rem;
	}
	.guide-button {
		min-height: 44px;
		padding: 10px 18px;
		border: 1px solid var(--line-strong);
		border-radius: var(--r-md);
		background: var(--bg-raised);
		color: var(--text);
		font-weight: 700;
		letter-spacing: 0.02em;
	}
	.ghost {
		padding: 10px 18px;
		border: 1px solid var(--line);
		border-radius: var(--r-md);
		background: none;
		color: var(--text-faint);
		font-weight: 600;
		min-height: 44px;
		letter-spacing: 0.02em;
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
		min-width: 0;
		margin: 0;
		overflow-wrap: anywhere;
		font-size: 0.85rem;
		font-weight: 700;
	}
	.entry-author {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin-block-end: 0.4rem;
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
		margin: 1rem auto 0;
	}
	.days {
		display: flex;
		justify-content: space-between;
		margin-block-start: 1.2rem;
	}
</style>
