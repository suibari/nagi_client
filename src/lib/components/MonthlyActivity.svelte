<script lang="ts">
	import { getDiaries } from '$lib/api/appview';
	import type { ActorView, DiaryMoodView, DiaryView } from '$lib/api/types';
	import {
		buildDiaryGraphForMonth,
		currentMonth,
		monthLastDate,
		monthOf,
		shiftMonth,
	} from '$lib/diary/calendar';
	import { formatValence, moodColor, summarizeMoodDays } from '$lib/diary/mood';
	import { m, dateLocale } from '$lib/i18n/i18n.svelte';
	import { untrack } from 'svelte';
	import DiaryDayDetail from './DiaryDayDetail.svelte';
	import DiaryMoodChart from './DiaryMoodChart.svelte';
	import MoodCalendar from './MoodCalendar.svelte';
	import MoodDayPosts from './MoodDayPosts.svelte';
	import Spinner from './Spinner.svelte';
	import Icon from './shell/Icon.svelte';

	/**
	 * 月間アクティビティ。月カレンダー（色相は気分、濃淡は投稿量）と、その月の感情グラフを
	 * 日記の上に並べ、どちらで日付を選んでも同じ日を指す。
	 * 選んだ日の botたんの日記と、その日の投稿の気分を詳細欄に出す。
	 *
	 * データの取得範囲は従来どおり1年ぶんを共有する。
	 * month と selected は日記ページが持ち、URL の ?month= / ?date= に書き戻す。
	 */
	let {
		did,
		month = $bindable(),
		selected = $bindable(),
		botActor,
	}: {
		did: string;
		month: string;
		selected?: string;
		botActor?: ActorView;
	} = $props();

	type Loaded = { moods: DiaryMoodView[]; entries: DiaryView[]; pending: number };

	const graph = $derived(buildDiaryGraphForMonth(month));
	const thisMonth = currentMonth();
	let loaded = $state<Loaded>({ moods: [], entries: [], pending: 0 });
	let loading = $state(true);
	let error = $state('');
	let loadVersion = 0;
	const cache = new Map<string, Loaded>();

	$effect(() => {
		const actor = did;
		const { from, to } = graph;
		if (!actor) return;
		const key = `${actor}:${from}:${to}`;
		const cached = cache.get(key);
		if (cached) {
			loaded = cached;
			loading = false;
			error = '';
			return;
		}
		const version = ++loadVersion;
		loading = true;
		error = '';
		getDiaries(actor, { from, to, moods: true })
			.then((page) => {
				if (version !== loadVersion) return;
				const value = {
					moods: page.moods ?? [],
					entries: page.items,
					pending: page.moodPending ?? 0,
				};
				cache.set(key, value);
				loaded = value;
			})
			.catch((cause) => {
				if (version === loadVersion)
					error = cause instanceof Error ? cause.message : m.diaryFetchFailed();
			})
			.finally(() => {
				if (version === loadVersion) loading = false;
			});
	});

	// 別の月の日（URL から）を選んだら、その月へ移る。
	$effect(() => {
		const date = selected;
		if (date && monthOf(date) !== untrack(() => month)) month = monthOf(date);
	});

	function goMonth(next: string) {
		if (next > thisMonth || next === month) return;
		month = next;
		if (selected && monthOf(selected) !== next) selected = undefined;
	}

	/**
	 * 詳細欄の外を押したら選択を外す（感情グラフ単体のときと同じ操作感）。
	 * 日付を押す場所・詳細欄・月送り・タブは除く。Esc でも外せる。
	 */
	$effect(() => {
		if (!selected) return;
		const onClick = (event: MouseEvent) => {
			const target = event.target;
			if (!(target instanceof Element) || !target.isConnected) return;
			if (target.closest('[data-mood-keep], [data-activity-keep], [role="tab"]')) return;
			selected = undefined;
		};
		const onKeydown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') selected = undefined;
		};
		document.addEventListener('click', onClick);
		document.addEventListener('keydown', onKeydown);
		return () => {
			document.removeEventListener('click', onClick);
			document.removeEventListener('keydown', onKeydown);
		};
	});

	const summary = $derived(summarizeMoodDays(loaded.moods));
	const diaryByDate = $derived(new Map(loaded.entries.map((entry) => [entry.date, entry])));
	const today = $derived(graph.to);
	const monthDays = $derived.by(() => {
		const last = monthLastDate(month);
		const end = last < today ? last : today;
		const days: string[] = [];
		for (let day = 1; ; day++) {
			const date = `${month}-${String(day).padStart(2, '0')}`;
			if (date > end) break;
			days.push(date);
		}
		return days;
	});
	const monthEntries = $derived(loaded.entries.filter((entry) => monthOf(entry.date) === month));
	const monthMoods = $derived(loaded.moods.filter((mood) => monthOf(mood.date) === month));
	/** 何も選んでいないときは、その月のいちばん新しい日記を見せておく。 */
	const latestDiary = $derived(
		monthEntries.reduce<DiaryView | undefined>(
			(latest, entry) => (!latest || entry.date > latest.date ? entry : latest),
			undefined,
		),
	);
	const focusDate = $derived(selected ?? latestDiary?.date);
	const focusDiary = $derived(focusDate ? diaryByDate.get(focusDate) : undefined);
	const focusMood = $derived(focusDate ? summary.get(focusDate) : undefined);

	const monthTitle = (value: string) =>
		new Date(`${value}-01T12:00:00`).toLocaleDateString(dateLocale(), {
			year: 'numeric',
			month: 'long',
		});
	const longDate = (date: string) =>
		new Date(`${date}T12:00:00`).toLocaleDateString(dateLocale(), {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			weekday: 'short',
		});
	const medianLabel = (value: number) => formatValence(Math.round(value * 10) / 10);
</script>

<div class="activity">
	<header class="month-nav card" data-activity-keep>
		<button
			type="button"
			class="month-step"
			aria-label={m.activityMonthPrev()}
			onclick={() => goMonth(shiftMonth(month, -1))}
		>
			<span class="flip"><Icon name="chevron" size={18} /></span>
		</button>
		<div class="month-title">
			<h2 aria-live="polite">{monthTitle(month)}</h2>
			{#if !loading && !error}
				<p>{m.activityMonthSummary({ diaries: monthEntries.length, posts: monthMoods.length })}</p>
			{/if}
		</div>
		<button
			type="button"
			class="month-step"
			aria-label={m.activityMonthNext()}
			disabled={month >= thisMonth}
			onclick={() => goMonth(shiftMonth(month, 1))}
		>
			<Icon name="chevron" size={18} />
		</button>
		{#if month !== thisMonth}
			<button type="button" class="month-today" onclick={() => goMonth(thisMonth)}>
				{m.activityThisMonth()}
			</button>
		{/if}
	</header>

	{#if error}
		<div class="state error card">{error}</div>
	{:else}
		<section class="calendar-card card" data-activity-keep>
			<MoodCalendar {month} {summary} {diaryByDate} {loading} bind:selected />
		</section>

		<DiaryMoodChart {did} bind:selected days={monthDays} data={{ ...loaded, loading, error }} />

		<section id="activity-diary" class="detail card" data-activity-keep aria-live="polite">
			{#if loading}
				<Spinner />
			{:else if focusDate}
				<header class="detail-head">
					{#if !selected}<p class="detail-eyebrow">{m.activityLatestDiary()}</p>{/if}
					<!-- 日記がある日は DiaryDayDetail の見出しが日付と称号を出す。 -->
					{#if focusDiary}
						<DiaryDayDetail summary={focusDiary} />
					{:else}
						<h3>{longDate(focusDate)}</h3>
					{/if}
					<div class="detail-stats">
						{#if focusMood}
							<p class="detail-mood">
								<i style={`background: ${moodColor(focusMood.median)}`} aria-hidden="true"></i>
								{m.moodMedian({ value: medianLabel(focusMood.median) })}
							</p>
						{:else}
							<p>{m.activityMoodUnknown()}</p>
						{/if}
						<p>
							{focusDiary?.postCount === undefined
								? m.activityPostsUnknown()
								: m.activityPostCount({ count: focusDiary.postCount })}
						</p>
					</div>
				</header>
				{#if focusDiary}
					<DiaryDayDetail entry={focusDiary} {botActor} />
				{:else}
					<p class="detail-hint">{m.activityNoDiary()}</p>
				{/if}
				{#if focusMood}
					<details class="detail-posts" open={!focusDiary}>
						<summary>{m.activityDayPosts({ count: focusMood.points.length })}</summary>
						<MoodDayPosts date={focusDate} day={focusMood} />
					</details>
				{:else if selected}
					<p class="detail-hint">{m.moodDayNoPosts()}</p>
				{/if}
			{:else if monthEntries.length || monthMoods.length}
				<p class="detail-hint">{m.activitySelectHint()}</p>
			{:else}
				<p class="detail-hint">{m.activityEmptyMonth()}</p>
			{/if}
		</section>
		<p class="activity-about">{m.activityAbout()}</p>
	{/if}
</div>

<style>
	.activity {
		display: grid;
		gap: 12px;
		min-inline-size: 0;
	}
	.month-nav {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 12px;
	}
	.month-title {
		flex: 1 1 auto;
		min-inline-size: 0;
		text-align: center;
	}
	.month-title h2 {
		font-size: 17px;
		font-weight: 800;
		color: var(--text-strong);
	}
	.month-title p {
		margin-top: 2px;
		font-size: 11px;
		color: var(--text-faint);
	}
	.month-step {
		display: grid;
		place-items: center;
		inline-size: 36px;
		block-size: 36px;
		flex: 0 0 auto;
		border: 1px solid var(--line);
		border-radius: 50%;
		background: var(--bg-raised);
		color: var(--text);
	}
	.flip {
		display: inline-flex;
		transform: scaleX(-1);
	}
	.month-step:disabled {
		opacity: 0.4;
	}
	.month-today {
		flex: 0 0 auto;
		padding: 6px 12px;
		border: 1px solid var(--accent-border);
		border-radius: var(--radius-pill);
		background: var(--accent-softer);
		color: var(--accent-strong);
		font-size: 12px;
		font-weight: 700;
	}
	.calendar-card,
	.detail {
		padding: 14px;
		min-inline-size: 0;
	}
	.calendar-card {
		inline-size: 100%;
		max-inline-size: 388px;
		box-sizing: border-box;
		justify-self: center;
	}
	.detail-stats {
		display: flex;
		flex-wrap: wrap;
		gap: 6px 16px;
		font-size: 12px;
		color: var(--text-muted);
	}
	.detail {
		display: grid;
		gap: 12px;
		align-content: start;
	}
	.detail-head {
		display: grid;
		gap: 6px;
	}
	.detail-eyebrow {
		font-size: 11px;
		font-weight: 700;
		color: var(--accent-strong);
	}
	.detail-head h3 {
		font-size: 15px;
		font-weight: 800;
		color: var(--text-strong);
	}
	.detail-mood {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
		color: var(--text-muted);
		font-variant-numeric: tabular-nums;
	}
	.detail-mood i {
		inline-size: 10px;
		block-size: 10px;
		border-radius: 50%;
	}
	.detail-hint,
	.activity-about {
		font-size: 12px;
		color: var(--text-faint);
	}
	.detail-posts summary {
		cursor: pointer;
		font-size: 12px;
		font-weight: 700;
		color: var(--text-muted);
		padding-block: 4px;
	}
	.detail-posts[open] summary {
		margin-block-end: 4px;
	}
</style>
