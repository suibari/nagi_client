<script lang="ts">
	import type { MoodDay } from '$lib/diary/mood';
	import { formatValence } from '$lib/diary/mood';
	import { postPageHref } from '$lib/feed/post-follow.svelte';
	import { m, dateLocale } from '$lib/i18n/i18n.svelte';
	import PostModerationGuard from './PostModerationGuard.svelte';

	/**
	 * 1日ぶんの感情の点（投稿）の一覧。感情グラフと月間アクティビティの詳細欄で使う。
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
</script>

<section class="mood-day" aria-label={longDate(date)}>
	{#if day}
		<ol>
			{#each day.points as point (point.uri)}
				<li>
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
		display: grid;
		grid-template-columns: 38px 1fr;
		gap: 10px;
		align-items: start;
		padding: 8px 0;
		border-top: 1px solid var(--line);
	}
	.mood-day li:first-child {
		border-top: 0;
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
