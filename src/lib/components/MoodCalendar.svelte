<script lang="ts">
	import type { DiaryView } from '$lib/api/types';
	import { buildMonthGrid, postVolumeLevel, postVolumeThresholds } from '$lib/diary/calendar';
	import { formatValence, moodColor, type MoodDay } from '$lib/diary/mood';
	import { m, dateLocale } from '$lib/i18n/i18n.svelte';
	import Spinner from './Spinner.svelte';

	/**
	 * 月間アクティビティの月カレンダー。背景色は気分の中央値、右下のドットは投稿量（0〜3個）。
	 * ドットの段階は、受け取った日記（1年ぶん）の投稿数を3等分して決める。正確な件数はラベルと詳細欄に出す。
	 * 気分のない日は無地にし、
	 * 選んだ日は感情グラフと共有する。
	 * 読み込み中は格子を薄めてスピナーを重ね、取得中であることを示す。
	 */
	let {
		month,
		summary,
		diaryByDate,
		selected = $bindable(),
		loading = false,
	}: {
		month: string;
		summary: Map<string, MoodDay>;
		diaryByDate: Map<string, DiaryView>;
		selected?: string;
		loading?: boolean;
	} = $props();

	const weeks = $derived(buildMonthGrid(month));
	const thresholds = $derived(
		postVolumeThresholds(Array.from(diaryByDate.values(), (entry) => entry.postCount)),
	);
	const weekdays = $derived.by(() => {
		const formatter = new Intl.DateTimeFormat(dateLocale(), { weekday: 'short' });
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
	const medianLabel = (value: number) => formatValence(Math.round(value * 10) / 10);
	const dayLabel = (date: string) => {
		const day = summary.get(date);
		const parts = [longDate(date)];
		if (day)
			parts.push(
				m.moodDayPosts({ count: day.points.length }),
				m.moodMedian({ value: medianLabel(day.median) }),
			);
		else parts.push(m.activityMoodUnknown());
		const entry = diaryByDate.get(date);
		parts.push(
			entry?.postCount === undefined
				? m.activityPostsUnknown()
				: m.activityPostCount({ count: entry.postCount }),
		);
		if (entry) parts.push(m.activityHasDiary());
		return parts.join(' · ');
	};

	function select(date: string) {
		selected = selected === date ? undefined : date;
	}
</script>

<div class="mood-calendar" aria-busy={loading}>
	<div class="weekdays" aria-hidden="true">
		{#each weekdays as weekday, index (index)}
			<span class:weekend={index === 0 || index === 6}>{weekday}</span>
		{/each}
	</div>
	<div class="grid-frame">
		<div
			class="grid"
			class:grid--loading={loading}
			role="grid"
			aria-label={m.activityCalendarAria()}
		>
			{#each weeks as week (week[0].date)}
				<div class="week" role="row">
					{#each week as day (day.date)}
						{@const mood = summary.get(day.date)}
						{@const entry = diaryByDate.get(day.date)}
						{#if !day.inMonth}
							<span class="cell cell--outside" role="gridcell" aria-hidden="true"></span>
						{:else if day.future}
							<span class="cell cell--future" role="gridcell">
								<span class="num">{Number(day.date.slice(8))}</span>
							</span>
						{:else}
							<span role="gridcell" class="cell-wrap">
								<button
									type="button"
									class="cell"
									class:cell--mood={Boolean(mood)}
									class:selected={selected === day.date}
									style={mood ? `--cell-color: ${moodColor(mood.median)}` : undefined}
									data-date={day.date}
									aria-pressed={selected === day.date}
									aria-label={dayLabel(day.date)}
									title={dayLabel(day.date)}
									onclick={() => select(day.date)}
								>
									<span class="num">{Number(day.date.slice(8))}</span>
									{#if entry || mood}
										{@const level = postVolumeLevel(entry?.postCount, thresholds)}
										{#if level === undefined}
											<span class="post-dots" aria-hidden="true"><i class="unknown"></i></span>
										{:else if level > 0}
											<span class="post-dots" aria-hidden="true">
												{#each { length: level }, index (index)}<i></i>{/each}
											</span>
										{/if}
									{/if}
								</button>
							</span>
						{/if}
					{/each}
				</div>
			{/each}
		</div>
		{#if loading}
			<div class="grid-loading"><Spinner /></div>
		{/if}
	</div>
	<div class="legend">
		<span class="legend-scale">
			<span>{formatValence(-5)}</span>
			<i aria-hidden="true"></i>
			<span>{formatValence(5)}</span>
		</span>
		<span>{m.activityLegendMedian()}</span>
		<span class="legend-dots">
			<span>{m.activityLegendCount()}</span>
			<span class="post-dots" aria-hidden="true"><i></i></span>
			<span>{m.activityLegendFew()}</span>
			<span class="post-dots" aria-hidden="true"><i></i><i></i><i></i></span>
			<span>{m.activityLegendMany()}</span>
		</span>
	</div>
</div>

<style>
	.mood-calendar {
		display: grid;
		gap: 6px;
		min-inline-size: 0;
	}
	.weekdays,
	.week {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
		gap: 4px;
	}
	.grid-frame {
		position: relative;
	}
	.grid {
		display: grid;
		gap: 4px;
	}
	.grid--loading {
		opacity: 0.35;
		pointer-events: none;
	}
	.grid-loading {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
	}
	.weekdays span {
		font-size: 11px;
		font-weight: 700;
		text-align: center;
		color: var(--text-faint);
	}
	.weekdays .weekend {
		color: var(--text-muted);
	}
	.cell-wrap {
		display: block;
		min-inline-size: 0;
	}
	.cell {
		position: relative;
		display: block;
		inline-size: 100%;
		aspect-ratio: 1;
		max-block-size: 64px;
		box-sizing: border-box;
		padding: 0;
		border: 1px solid var(--line);
		border-radius: var(--radius-m);
		background: color-mix(in srgb, var(--surface-soft), var(--text-faint) 6%);
		color: var(--text-muted);
		font: inherit;
		cursor: pointer;
	}
	.cell--outside {
		border-color: transparent;
		background: transparent;
		cursor: default;
	}
	.cell--future {
		border-style: dashed;
		background: transparent;
		color: var(--text-faint);
		cursor: default;
	}
	.cell--mood {
		background: var(--cell-color);
	}
	.cell:not(.cell--outside, .cell--future):hover,
	.cell:not(.cell--outside, .cell--future):focus-visible {
		border-color: var(--text-strong);
	}
	/* box-shadow はボタン共通の指定に負けるので、選択の輪は outline で描く。 */
	.cell.selected {
		z-index: 1;
		outline: 3px solid var(--focus-ring);
		outline-offset: 2px;
	}
	.num {
		position: absolute;
		inset-block-start: 3px;
		inset-inline-start: 3px;
		min-inline-size: 20px;
		padding: 3px;
		box-sizing: border-box;
		border-radius: var(--radius-s);
		background: var(--bg-raised);
		color: var(--text-strong);
		text-align: center;
		font-size: 12px;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		line-height: 1;
	}
	.cell--future .num {
		background: transparent;
		color: var(--text-faint);
	}
	.post-dots {
		display: inline-flex;
		gap: 2px;
		padding: 3px;
		border-radius: var(--radius-pill);
		background: var(--bg-raised);
		line-height: 0;
	}
	.cell .post-dots {
		position: absolute;
		inset-block-end: 3px;
		inset-inline-end: 3px;
	}
	.post-dots i {
		inline-size: 5px;
		block-size: 5px;
		box-sizing: border-box;
		border-radius: 50%;
		background: var(--text-strong);
	}
	/* 件数が分からない日は白抜きにして、投稿なし（ドットなし）と区別する。 */
	.post-dots i.unknown {
		border: 1px solid var(--text-muted);
		background: transparent;
	}

	.legend {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px 14px;
		margin-block-start: 4px;
		font-size: 11px;
		color: var(--text-muted);
	}
	.legend-scale {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		font-variant-numeric: tabular-nums;
	}
	.legend-dots {
		display: inline-flex;
		align-items: center;
		gap: 5px;
	}
	.legend-scale i {
		display: inline-block;
		inline-size: 72px;
		block-size: 8px;
		border-radius: var(--radius-pill);
		background: linear-gradient(
			to right,
			var(--mood-scale-1),
			var(--mood-scale-2),
			var(--mood-scale-3),
			var(--mood-scale-4),
			var(--mood-scale-5)
		);
	}
</style>
