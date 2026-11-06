<script lang="ts">
	import type { MoodDay } from '$lib/diary/mood';
	import {
		formatValence,
		moodColor,
		moodGradient,
		moodPostAnchorId,
		moodSegmentStops,
	} from '$lib/diary/mood';
	import { postPageHref } from '$lib/feed/post-follow.svelte';
	import { m, dateLocale } from '$lib/i18n/i18n.svelte';
	import PostModerationGuard from './PostModerationGuard.svelte';

	/**
	 * 1日ぶんの感情の点（投稿）を縦のタイムラインで並べる。感情グラフと月間アクティビティの詳細欄で使う。
	 * 左のレールは、各投稿の気分から次の投稿の気分へ補間したグラデーション（横バーと同じ考え方）。
	 * 時間の比率では並べず、長い空白（GAP_HOURS 以上）は行間を広げて「〜」で示す。
	 * preview（/about のサンプル）では投稿が実在しないのでリンクにしない。
	 */
	let {
		date,
		day,
		preview = false,
	}: {
		date: string;
		day?: MoodDay;
		preview?: boolean;
	} = $props();

	const longDate = (value: string) =>
		new Date(`${value}T12:00:00`).toLocaleDateString(dateLocale(), {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	const timeLabel = (iso: string) =>
		new Date(iso).toLocaleTimeString(dateLocale(), { hour: '2-digit', minute: '2-digit' });
	const tone = (value: number) => (value > 0 ? 'positive' : 'negative');
	const GAP_HOURS = 3;
	const isGap = (index: number) => {
		if (!day || index === 0) return false;
		const previous = new Date(day.points[index - 1].createdAt).getTime();
		const current = new Date(day.points[index].createdAt).getTime();
		return current - previous >= GAP_HOURS * 3_600_000;
	};
	const segment = (index: number) => {
		const next = day?.points[index + 1];
		if (!day || !next) return undefined;
		return moodGradient(moodSegmentStops(day.points[index].valence, next.valence), 'to bottom');
	};
</script>

<section class="mood-day" aria-label={longDate(date)}>
	{#if day}
		<ol>
			{#each day.points as point, index (point.uri)}
				{@const rail = segment(index)}
				<li id={moodPostAnchorId(point.uri)} class:gap={isGap(index)} tabindex="-1">
					<span class="rail" aria-hidden="true">
						{#if isGap(index)}<span class="rail-gap">〜</span>{/if}
						{#if rail}<span class="rail-line" style:background={rail}></span>{/if}
						<span class="rail-dot" style:background={moodColor(point.valence)}></span>
					</span>
					<span class={`mood-chip mood-chip--${tone(point.valence)}`}
						>{formatValence(point.valence)}</span
					>
					{#if preview}
						<span class="mood-post">
							<time datetime={point.createdAt}>{timeLabel(point.createdAt)}</time>
							<span class="mood-text">{point.text}</span>
						</span>
					{:else}
						<a class="mood-post" href={postPageHref(point)}>
							<time datetime={point.createdAt}>{timeLabel(point.createdAt)}</time>
							<PostModerationGuard post={point}>
								<span class="mood-text">{point.text}</span>
							</PostModerationGuard>
						</a>
					{/if}
				</li>
			{/each}
		</ol>
	{:else}
		<p class="mood-hint">{m.moodDayNoPosts()}</p>
	{/if}
</section>

<style>
	.mood-hint {
		font-size: 12px;
		color: var(--text-faint);
	}
	.mood-day ol {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
	}
	.mood-day li {
		--dot-top: 14px;
		display: grid;
		grid-template-columns: 12px 38px 1fr;
		gap: 10px;
		align-items: start;
		padding: 8px 0;
		border-radius: var(--radius-m);
		outline: none;
		scroll-margin-block: 96px;
	}
	.mood-day li.gap {
		padding-block-start: 26px;
		--dot-top: 32px;
	}
	.mood-day li:global([data-flash]) {
		animation: mood-flash 1.6s ease-out;
	}
	@keyframes mood-flash {
		from {
			background: var(--accent-weak);
		}
		to {
			background: transparent;
		}
	}
	.rail {
		position: relative;
		align-self: stretch;
		margin-block: -8px;
	}
	.mood-day li.gap .rail {
		margin-block-start: -26px;
	}
	.rail-dot {
		position: absolute;
		inset-block-start: var(--dot-top);
		inset-inline-start: 50%;
		inline-size: 10px;
		block-size: 10px;
		border-radius: 50%;
		box-shadow: 0 0 0 2px var(--bg-raised);
		transform: translate(-50%, -50%);
	}
	/* 自分の点から次の行の点まで伸ばす。次の行の点は、この行の下端 + 次の行の --dot-top。 */
	.rail-line {
		position: absolute;
		inset-block-start: var(--dot-top);
		inset-block-end: calc(-1 * var(--next-dot-top, 14px));
		inset-inline-start: 50%;
		inline-size: 4px;
		border-radius: 2px;
		transform: translateX(-50%);
	}
	.mood-day li:has(+ li.gap) {
		--next-dot-top: 32px;
	}
	.rail-gap {
		position: absolute;
		inset-block-start: 4px;
		inset-inline-start: calc(100% + 10px);
		font-size: 11px;
		line-height: 1;
		color: var(--text-faint);
	}
	.mood-post {
		display: grid;
		gap: 2px;
		min-inline-size: 0;
		color: inherit;
		text-decoration: none;
	}
	a.mood-post:hover .mood-text {
		text-decoration: underline;
	}
	.mood-day time {
		font-size: 11px;
		color: var(--text-faint);
	}
	.mood-text {
		font-size: 13px;
		color: var(--text);
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.mood-chip {
		text-align: center;
		font-size: 12px;
		font-weight: 800;
		font-variant-numeric: tabular-nums;
		border: 1.5px solid currentColor;
		border-radius: var(--radius-pill);
		padding: 1px 0;
	}
	.mood-chip--positive {
		color: var(--mood-positive);
	}
	.mood-chip--negative {
		color: var(--mood-negative);
	}
</style>
