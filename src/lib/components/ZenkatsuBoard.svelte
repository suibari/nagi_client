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
	import ZenkatsuDevReset from './ZenkatsuDevReset.svelte';
	import ZenkatsuMarks from './ZenkatsuMarks.svelte';
	import ZenkatsuHelp from './ZenkatsuHelp.svelte';
	import ZenkatsuFlow from './ZenkatsuFlow.svelte';

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

	/**
	 * @param next  追加読み込みのカーソル。
	 * @param quiet 取り直している間も今の記録を出したままにする（「…」で画面を潰さない）。
	 */
	async function load(next?: string, quiet = false) {
		loading = !next && !quiet;
		error = '';
		try {
			const result = await getZenkatsu({
				...(date ? { date } : {}),
				...(next ? { cursor: next } : {}),
			});
			// 記録が欠けた応答でも盤面ごと落とさない。ここは /cards を開いて最初に出る画面。
			const submissions = result.submissions ?? [];
			feed =
				next && feed
					? { ...result, submissions: [...feed.submissions, ...submissions] }
					: { ...result, submissions };
		} catch {
			error = m.zenkatsuFetchFailed();
		} finally {
			loading = false;
			loadingMore = false;
		}
	}

	/**
	 * 取得済みの条件（日付＋見ている人）。
	 *
	 * OAuth の復元は **盤面を出したあとに**終わる。素で load() を呼び直すと、一度出した
	 * お題が「…」に戻り、ログインしている人だけ数秒の空白を見ることになる。お題は公開
	 * 情報で未ログインの取得と同じものが返るので、ここは静かに差し替える。日付を変えた
	 * ときは別の日を取りに行くので、今までどおり画面を伏せる。
	 */
	let loadedFor: string | undefined;
	$effect(() => {
		const day = date ?? '';
		const key = `${day}\u0000${$session?.did ?? ''}`;
		if (loadedFor === key) return;
		const sameDay = loadedFor?.startsWith(`${day}\u0000`) ?? false;
		loadedFor = key;
		void load(undefined, sameDay);
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

<!--
	ロゴはページの顔なので、読み込みを待たずに出す（空白から始めない）。
	ロゴの下に何のゲームかを一言と、流れを一行で置く。初見の人がここで足を止めないように。
-->
<section class="intro">
	<img class="logo" src="/zenkatsu-logo.png" alt={m.zenkatsuTitle()} width="1671" height="941" />
	<p class="tagline">{m.zenkatsuTagline()}</p>
	<p class="lead">{m.zenkatsuGuideSummary({ max: maxCards })}</p>
	<ZenkatsuFlow size="sm" />
</section>

{#if loading}
	<div class="state">…</div>
{:else if error}
	<div class="state">{error}</div>
{:else if feed}
	<section class="theme">
		<p class="theme-label">
			{m.zenkatsuThemeLabel()}<span class="theme-date">{feed.theme.themeDate}</span>
		</p>
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
		<!-- 開発時のみ。1日1回のロックを外すのではなく、消して出し直す（本物の経路を毎回通す）。 -->
		<ZenkatsuDevReset onReset={() => void load()} />
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
					<ZenkatsuMarks tailwindCount={s.tailwindCount} combos={s.combos} />
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
		onclose={() => {
			picking = false;
			/*
			 * 提出直後の再取得は総評の生成より早い。ゲーム側はそれを待ってから閉じるので、
			 * **閉じたときにもう一度引く**。ここを抜かすと記録欄が「考えているよ…」のまま残る。
			 */
			void load(undefined, true);
		}}
	/>
{/if}

<style>
	.state,
	.note {
		padding: 1rem;
		color: var(--text-faint);
		text-align: center;
	}
	.intro {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.45rem;
		padding: 0.5rem 1rem 1.2rem;
		text-align: center;
	}
	/* ロゴは原寸 1671x941。縦幅で効かせて、狭い画面でも溢れないようにする。 */
	.logo {
		inline-size: min(100%, 320px);
		block-size: auto;
	}
	.tagline {
		margin: 0;
		color: var(--accent-strong);
		font-size: 0.8rem;
		font-weight: 800;
		letter-spacing: 0.12em;
	}
	.lead {
		max-inline-size: 34em;
		margin: 0;
		color: var(--text-sub);
		font-size: 0.88rem;
		line-height: 1.8;
	}
	/* お題はこのページの焦点。枠で囲って、周りの説明文から切り離す。 */
	.theme {
		inline-size: min(100%, 560px);
		margin-inline: auto;
		padding: 1.1rem 1.25rem;
		border: 1px solid var(--line);
		border-radius: 16px;
		background: var(--bg-raised);
		text-align: center;
	}
	.theme-label {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.6rem;
		font-size: 0.72rem;
		font-weight: 800;
		letter-spacing: 0.16em;
		color: var(--accent-strong);
	}
	/* どの日を見ているかを必ず出す。前の日を開いたまま今日だと思い込めてしまう。 */
	.theme-date {
		color: var(--text-faint);
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		letter-spacing: 0.04em;
	}
	.theme-text {
		margin: 0.5rem 0 0;
		font-size: 1.2rem;
		font-weight: 700;
		line-height: 1.6;
		text-wrap: balance;
	}
	/*
	 * 「そんなとき？」はお題の一部。色を変えると別の情報に見えるので、
	 * 行を変えるだけにして地続きに読ませる。
	 */
	.theme-question {
		display: block;
	}
	.recommended-attribute {
		display: inline-block;
		margin-top: 0.8rem;
		padding: 4px 12px;
		border: 1px solid color-mix(in srgb, var(--accent-strong) 40%, transparent);
		border-radius: 999px;
		background: var(--accent-soft);
		color: var(--accent-strong);
		font-size: 0.75rem;
		font-weight: 700;
	}
	.play {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.6rem;
		padding: 1.2rem 1rem;
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
		inline-size: min(100%, 420px);
	}
	.play-controls button {
		flex: 1 1 auto;
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
		margin-block: 0.5rem 0.8rem;
		font-size: 0.8rem;
		font-weight: 800;
		letter-spacing: 0.16em;
		color: var(--accent-strong);
	}
	.entries {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.entry {
		padding: 0.9rem 1rem;
		border: 1px solid var(--line);
		border-radius: 14px;
		background: var(--bg-raised);
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
		inline-size: clamp(72px, 22vw, 96px);
	}
	.more {
		display: block;
		margin: 1rem auto 0;
	}
	.days {
		display: flex;
		gap: 0.6rem;
		margin-block-start: 1.2rem;
	}
	.days .ghost {
		flex: 1;
	}
</style>
