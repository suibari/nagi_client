<script lang="ts">
	import type { DiaryMoodView } from '$lib/api/types';
	import {
		moodColor,
		moodDayFrame,
		moodDayOffset,
		moodDayTicks,
		moodGradient,
		moodTimeLabel,
		moodTimelineStops,
		type MoodClock,
		type MoodDay,
	} from '$lib/diary/mood';
	import { m, dateLocale } from '$lib/i18n/i18n.svelte';

	/**
	 * 1日（前の区切り〜その日の区切り。既定は前日22時〜当日22時）の気分の流れを1本の横バーにする。
	 * 投稿の間は気分を時間で補間したグラデーションでつなぎ、投稿の位置に点を置く。
	 * 点を押すと onjump で親に知らせ、縦タイムラインの該当の投稿へ移る。
	 */
	let {
		date,
		day,
		clock,
		onjump,
	}: {
		date: string;
		day?: MoodDay;
		/** AppView から受け取った区切り。無ければ端末の時刻の22時区切り。 */
		clock?: MoodClock;
		onjump?: (point: DiaryMoodView) => void;
	} = $props();

	const background = $derived(
		day ? moodGradient(moodTimelineStops(date, day.points, { clock })) : 'none',
	);
	/** 0・6・12・18時の目盛り。両端（区切り）は日の境目なので線だけにする。 */
	const ticks = $derived(moodDayTicks(date, clock));
	const timeZone = $derived(moodDayFrame(date, clock).timeZone);
	const percent = (value: number) => `${Math.round(value * 10000) / 100}%`;
	const longDate = (value: string) =>
		new Date(`${value}T12:00:00`).toLocaleDateString(dateLocale(), {
			month: 'long',
			day: 'numeric',
		});
	const timeLabel = (iso: string) => moodTimeLabel(iso, dateLocale(), timeZone);
	const hourLabel = (hour: number) =>
		new Date(2000, 0, 1, hour).toLocaleTimeString(dateLocale(), { hour: 'numeric' });
	/** ラベル付きの投稿は、本文を読み上げにも出さない（本文側は PostModerationGuard が隠す）。 */
	const safeText = (point: DiaryMoodView) =>
		point.selfLabels?.length || point.moderationLabels?.length ? '' : point.text.slice(0, 40);
</script>

<div class="mood-day-bar" role="group" aria-label={m.moodTimelineAria({ date: longDate(date) })}>
	<div class="track" class:track--empty={!day} style:background-image={background}>
		{#if day}
			{#each day.points as point (point.uri)}
				<button
					type="button"
					class="dot"
					style:left={percent(moodDayOffset(date, point.createdAt, clock))}
					style:--dot-color={moodColor(point.valence)}
					aria-label={m.moodTimelinePostAria({
						time: timeLabel(point.createdAt),
						text: safeText(point),
					})}
					title={`${timeLabel(point.createdAt)} ${safeText(point)}`}
					onclick={() => onjump?.(point)}
				></button>
			{/each}
		{/if}
	</div>
	<div class="scale" aria-hidden="true">
		{#each ticks as tick (tick.offset)}
			<span style:left={percent(tick.offset)}>{hourLabel(tick.hour)}</span>
		{/each}
	</div>
</div>

<style>
	.mood-day-bar {
		display: grid;
		gap: 4px;
		min-inline-size: 0;
	}
	.track {
		position: relative;
		block-size: 16px;
		border-radius: var(--radius-pill);
		background-color: var(--bg-inset);
		background-repeat: no-repeat;
	}
	.track--empty {
		background-image: none;
	}
	.dot {
		position: absolute;
		inset-block-start: 50%;
		inline-size: 20px;
		block-size: 24px;
		padding: 0;
		border: 0;
		background: none;
		transform: translate(-50%, -50%);
		cursor: pointer;
	}
	.dot::after {
		content: '';
		position: absolute;
		inset: 50% auto auto 50%;
		inline-size: 8px;
		block-size: 8px;
		border-radius: 50%;
		background: var(--dot-color);
		box-shadow: 0 0 0 2px var(--bg-raised);
		transform: translate(-50%, -50%);
		transition: transform 0.12s ease;
	}
	.dot:hover::after,
	.dot:focus-visible::after {
		transform: translate(-50%, -50%) scale(1.4);
	}
	.dot:focus-visible {
		outline: none;
	}
	.dot:focus-visible::after {
		box-shadow:
			0 0 0 2px var(--bg-raised),
			0 0 0 4px var(--focus-ring);
	}
	.scale {
		position: relative;
		block-size: 12px;
		font-size: 10px;
		color: var(--text-faint);
		font-variant-numeric: tabular-nums;
	}
	.scale span {
		position: absolute;
		transform: translateX(-50%);
		white-space: nowrap;
		line-height: 12px;
	}
</style>
