<script lang="ts">
	import Spinner from '$lib/components/Spinner.svelte';
	import { getDiaries } from '$lib/api/appview';
	import type { ActorView, DiaryView } from '$lib/api/types';
	import {
		buildDiaryGraphForDate,
		diaryActivityIntensity,
		diaryMonthLabels,
		monthOf,
		type DiaryGraph,
	} from '$lib/diary/calendar';
	import { i18n, m, dateLocale } from '$lib/i18n/i18n.svelte';
	import { tick, untrack } from 'svelte';
	import DiaryDayDetail from './DiaryDayDetail.svelte';

	/**
	 * 年間のコミットグラフ（日記を書いた日の草）。
	 * selected は日記ページが持ち、URL の ?date= と月カレンダー・感情グラフで共有する。
	 * anchorDate はページを開いたときの日付で、表示する1年の範囲だけを決める
	 * （選択を外しても範囲が今年へ飛ばないように、選択とは分けてある）。
	 *
	 * 月間アクティビティに埋め込むときは、取得済みの data と範囲 graph を親から受け取り、
	 * 詳細表示は親に任せる。highlightMonth の月を枠で示す。
	 */
	let {
		did,
		anchorDate,
		selected = $bindable(),
		botActor,
		graph: graphOverride,
		data,
		highlightMonth,
	}: {
		did: string;
		anchorDate?: string;
		selected?: string;
		botActor?: ActorView;
		graph?: DiaryGraph;
		data?: { entries: DiaryView[]; loading: boolean; error: string };
		highlightMonth?: string;
	} = $props();

	const embedded = $derived(data !== undefined);
	const graph = $derived(graphOverride ?? buildDiaryGraphForDate(anchorDate));
	const monthLabels = $derived(diaryMonthLabels(graph.weeks));
	let hovered = $state<string | undefined>();
	let entries = $state<DiaryView[]>([]);
	let loading = $state(true);
	let error = $state('');
	let graphScroll = $state<HTMLDivElement>();
	let loadVersion = 0;
	let scrolledKey = '';
	const cache = new Map<string, DiaryView[]>();

	$effect(() => {
		if (!data) return;
		entries = data.entries;
		loading = data.loading;
		error = data.error;
		const key = `${did}:${graph.from}:${graph.to}`;
		if (!loading) void finish(key);
	});

	async function finish(key: string) {
		await tick();
		if (!graphScroll || scrolledKey === key) return;
		scrolledKey = key;
		const target = untrack(() => selected ?? (highlightMonth ? `${highlightMonth}-01` : undefined));
		if (target && target >= graph.from && target <= graph.to) {
			graphScroll
				.querySelector<HTMLElement>(`[data-day="${target}"]`)
				?.scrollIntoView({ block: 'nearest', inline: 'center' });
		} else {
			graphScroll.scrollLeft = graphScroll.scrollWidth;
		}
	}

	// 表示月を変えたら、その月が見える位置まで送る。
	let lastHighlight = untrack(() => highlightMonth);
	$effect(() => {
		const month = highlightMonth;
		if (!month || month === lastHighlight || !graphScroll) return;
		lastHighlight = month;
		graphScroll
			.querySelector<HTMLElement>(`[data-day="${month}-01"]`)
			?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
	});

	$effect(() => {
		const actor = did;
		if (!actor || data) return;
		const key = `${actor}:${graph.from}:${graph.to}`;
		const version = ++loadVersion;
		const cached = cache.get(key);
		if (cached) {
			entries = cached;
			loading = false;
			error = '';
			void finish(key);
			return;
		}
		loading = true;
		error = '';
		entries = [];
		getDiaries(actor, { from: graph.from, to: graph.to })
			.then((page) => {
				if (version !== loadVersion) return;
				cache.set(key, page.items);
				entries = page.items;
			})
			.catch((cause) => {
				if (version === loadVersion)
					error = cause instanceof Error ? cause.message : m.diaryFetchFailed();
			})
			.finally(() => {
				if (version !== loadVersion) return;
				loading = false;
				void finish(key);
			});
	});

	const byDate = $derived(new Map(entries.map((entry) => [entry.date, entry])));
	const current = $derived(selected ? byDate.get(selected) : undefined);
	const detail = $derived((hovered ? byDate.get(hovered) : undefined) ?? current);
	const maxPostCount = $derived(
		entries.reduce((maximum, entry) => Math.max(maximum, entry.postCount ?? 0), 0),
	);
	const weekdays = $derived.by(() => {
		const formatter = new Intl.DateTimeFormat(dateLocale(), { weekday: 'narrow' });
		return Array.from({ length: 7 }, (_, index) =>
			formatter.format(new Date(Date.UTC(1970, 0, 4 + index))),
		);
	});
	const longDate = (date: string) =>
		new Date(`${date}T12:00:00`).toLocaleDateString(dateLocale(), {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	const monthLabel = (date: string) =>
		new Date(`${date}T12:00:00`).toLocaleDateString(dateLocale(), { month: 'short' });
	const entryTitle = (entry: DiaryView) =>
		i18n.locale === 'ja' ? (entry.titleJa ?? entry.titleEn) : (entry.titleEn ?? entry.titleJa);
</script>

<section class="diary card" class:diary--embedded={embedded}>
	<header class="diary-head">
		<div>
			<h2>{embedded ? m.diaryAnnualActivity() : m.diaryTabActivity()}</h2>
			<p>{longDate(graph.from)} – {longDate(graph.to)}</p>
		</div>
	</header>

	{#if error}
		<div class="state error">{error}</div>
	{:else}
		<div
			class="diary-graph-scroll"
			bind:this={graphScroll}
			aria-busy={loading}
			aria-label={m.diaryGraphAria()}
		>
			<div class="diary-graph">
				<div class="diary-months" aria-hidden="true">
					{#each monthLabels as label (label.date)}
						<span style={`grid-column: ${label.week + 1}`}>{monthLabel(label.date)}</span>
					{/each}
				</div>
				<div class="diary-graph-body">
					<div class="diary-weekdays" aria-hidden="true">
						{#each weekdays as weekday, index (index)}
							<span>{index % 2 === 1 ? weekday : ''}</span>
						{/each}
					</div>
					<div class="diary-weeks">
						{#each graph.weeks as week (week[0].date)}
							<div class="diary-week">
								{#each week as day (day.date)}
									{@const entry = byDate.get(day.date)}
									{@const inMonth =
										highlightMonth !== undefined && monthOf(day.date) === highlightMonth}
									{@const intensity = entry
										? diaryActivityIntensity(entry.postCount, maxPostCount)
										: undefined}
									{#if entry && !day.future}
										<button
											class="diary-day diary-day--has"
											class:diary-day--month={inMonth}
											class:selected={selected === day.date}
											class:diary-day--activity={intensity !== undefined}
											style={intensity === undefined
												? undefined
												: `--diary-activity-percent: ${12 + intensity * 88}%`}
											type="button"
											data-date={day.date}
											data-day={day.date}
											title={longDate(day.date)}
											aria-pressed={selected === day.date}
											aria-label={m.diaryDayAria({
												date: longDate(day.date),
												postCount: entry.postCount,
												title: entryTitle(entry),
											})}
											onmouseenter={() => (hovered = day.date)}
											onmouseleave={() => (hovered = undefined)}
											onfocus={() => (hovered = day.date)}
											onblur={() => (hovered = undefined)}
											onclick={() => (selected = selected === day.date ? undefined : day.date)}
										></button>
									{:else}
										<span
											class="diary-day"
											class:diary-day--month={inMonth}
											data-day={day.date}
											class:diary-day--future={day.future}
											title={!day.future ? longDate(day.date) : undefined}
										></span>
									{/if}
								{/each}
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>

		{#if embedded}
			<p class="diary-hint">{m.activityHeatmapHint()}</p>
		{:else if loading}
			<Spinner />
		{:else if detail}
			<DiaryDayDetail summary={detail} />
		{:else if entries.length}
			<p class="diary-hint">{m.diaryHoverHint()}</p>
		{:else}
			<p class="diary-hint">{m.diaryEmptyYear()}</p>
		{/if}

		{#if !embedded}
			{#if !loading && current}
				<DiaryDayDetail entry={current} {botActor} />
			{/if}
			<p class="diary-about">{m.diaryAbout()}</p>
		{/if}
	{/if}
</section>

<style>
	.diary {
		padding: 16px;
		display: grid;
		gap: 14px;
		min-inline-size: 0;
		max-inline-size: 100%;
	}
	.diary-head h2 {
		font-size: 15px;
		font-weight: 800;
		color: var(--text-strong);
	}
	.diary-head p {
		margin-top: 2px;
		font-size: 11px;
		color: var(--text-faint);
	}
	.diary-graph-scroll {
		min-inline-size: 0;
		max-inline-size: 100%;
		overflow-x: auto;
		overflow-y: hidden;
		padding: 2px 2px 8px;
		overscroll-behavior-inline: contain;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: thin;
		scrollbar-color: color-mix(in srgb, var(--text-faint), transparent 35%) transparent;
	}
	.diary-graph-scroll::-webkit-scrollbar {
		block-size: 8px;
	}
	.diary-graph-scroll::-webkit-scrollbar-track {
		background: transparent;
	}
	.diary-graph-scroll::-webkit-scrollbar-thumb {
		border: 2px solid transparent;
		border-radius: var(--radius-pill);
		background: color-mix(in srgb, var(--text-faint), transparent 35%);
		background-clip: padding-box;
	}
	.diary-graph-scroll::-webkit-scrollbar-thumb:hover {
		background: color-mix(in srgb, var(--accent-strong), transparent 20%);
		background-clip: padding-box;
	}
	.diary-graph {
		--diary-cell: 11px;
		--diary-gap: 3px;
		inline-size: max-content;
		min-inline-size: 100%;
	}
	.diary-months {
		display: grid;
		grid-template-columns: repeat(53, var(--diary-cell));
		column-gap: var(--diary-gap);
		margin-inline-start: 25px;
		block-size: 18px;
		font-size: 10px;
		color: var(--text-faint);
	}
	.diary-months span {
		white-space: nowrap;
	}
	.diary-graph-body {
		display: flex;
		gap: 5px;
	}
	.diary-weekdays,
	.diary-week {
		display: grid;
		grid-template-rows: repeat(7, var(--diary-cell));
		row-gap: var(--diary-gap);
	}
	.diary-weekdays {
		inline-size: 20px;
		font-size: 9px;
		line-height: var(--diary-cell);
		color: var(--text-faint);
		text-align: end;
	}
	.diary-weeks {
		display: flex;
		gap: var(--diary-gap);
	}
	.diary-day {
		inline-size: var(--diary-cell);
		block-size: var(--diary-cell);
		box-sizing: border-box;
		border: 1px solid transparent;
		border-radius: 3px;
		background: color-mix(in srgb, var(--surface-soft), var(--text-faint) 8%);
	}
	.diary-day--future {
		background: transparent;
	}
	/* 月間アクティビティで表示中の月。草の色は変えず、外側の線だけで示す。 */
	.diary-day--month:not(.diary-day--future) {
		outline: 1px solid color-mix(in srgb, var(--accent-strong), transparent 45%);
		outline-offset: 0;
	}
	.diary-day--has {
		padding: 0;
		background: var(--accent-softer);
		border-color: var(--accent-border);
		cursor: pointer;
		position: relative;
	}
	.diary-day--activity {
		background: color-mix(
			in srgb,
			var(--accent-softer),
			var(--accent-strong) var(--diary-activity-percent)
		);
		border-color: color-mix(
			in srgb,
			var(--accent-border),
			var(--accent-strong) var(--diary-activity-percent)
		);
	}
	.diary-day--has:hover,
	.diary-day--has:focus-visible {
		border-color: var(--text-strong);
		outline: none;
	}
	.diary-day--has.selected {
		z-index: 1;
		box-shadow:
			0 0 0 1px var(--surface),
			0 0 0 3px var(--focus-ring);
	}
	.diary-hint,
	.diary-about {
		font-size: 12px;
		color: var(--text-faint);
	}
</style>
