<script lang="ts">
	import { getDiaries } from '$lib/api/appview';
	import type { ActorView, DiaryMoodView, DiaryView } from '$lib/api/types';
	import { buildDiaryGraphForDate } from '$lib/diary/calendar';
	import {
		clampMoodZoom,
		formatValence,
		MOOD_DEFAULT_ZOOM,
		MOOD_ZOOM_LEVELS,
		summarizeMoodDays,
	} from '$lib/diary/mood';
	import { postHref } from '$lib/feed/post-follow.svelte';
	import { m, dateLocale } from '$lib/i18n/i18n.svelte';
	import { tick, untrack } from 'svelte';
	import DiaryDayDetail from './DiaryDayDetail.svelte';

	/**
	 * 日記ページの「感情グラフ」タブ。投稿ごとの気分（-5〜+5）を、日ごとの中央50%の帯と
	 * 中央値の線で見せる。日付を押すと、その日の点（投稿）と日記を開く。
	 * selected と anchorDate の役割は DiaryCalendar と同じ（選択はタブ間で共有する）。
	 */
	let {
		did,
		anchorDate,
		selected = $bindable(),
		botActor,
	}: {
		did: string;
		anchorDate?: string;
		selected?: string;
		botActor?: ActorView;
	} = $props();

	const uid = $props.id();
	const gradientId = `mood-scale-${uid}`;
	const HEIGHT = 200;
	const PAD_TOP = 10;
	const PAD_BOTTOM = 22;
	const PAD_END = 8;

	const graph = $derived(buildDiaryGraphForDate(anchorDate));
	const days = $derived(
		graph.weeks
			.flat()
			.filter((day) => !day.future)
			.map((day) => day.date),
	);
	let moods = $state<DiaryMoodView[]>([]);
	let entries = $state<DiaryView[]>([]);
	let pending = $state(0);
	let loading = $state(true);
	let error = $state('');
	let hovered = $state<string | undefined>();
	let zoom = $state(MOOD_DEFAULT_ZOOM);
	let scroller = $state<HTMLDivElement>();
	let loadVersion = 0;
	let scrolledKey = '';
	const cache = new Map<
		string,
		{ moods: DiaryMoodView[]; entries: DiaryView[]; pending: number }
	>();

	const px = $derived(MOOD_ZOOM_LEVELS[zoom]);
	const width = $derived(days.length * px + PAD_END);
	const y = (value: number) => PAD_TOP + ((5 - value) / 10) * (HEIGHT - PAD_TOP - PAD_BOTTOM);
	/**
	 * 1日の帯。中央50%（第1〜第3四分位）を、両端の丸いバーで描く。
	 * 値が1つしかない日（-3 だけの日など）は高さが0になるので、バーの幅ぶんの丸として出す。
	 * 拡大してもバーは太くしすぎない（8px まで）。細いほうが日ごとの並びが読みやすい。
	 */
	const bar = (index: number, q1: number, q3: number) => {
		const barWidth = Math.max(2, Math.min(px * 0.6, 8));
		const top = y(q3);
		const height = Math.max(y(q1) - top, barWidth);
		const middle = (y(q1) + top) / 2;
		return {
			x: index * px + (px - barWidth) / 2,
			y: middle - height / 2,
			width: barWidth,
			height,
			radius: barWidth / 2,
		};
	};
	const summary = $derived(summarizeMoodDays(moods));
	const diaryByDate = $derived(new Map(entries.map((entry) => [entry.date, entry])));
	const selectedDay = $derived(selected ? summary.get(selected) : undefined);
	const selectedDiary = $derived(selected ? diaryByDate.get(selected) : undefined);
	const focusDay = $derived(hovered ?? selected);
	const focusSummary = $derived(focusDay ? summary.get(focusDay) : undefined);

	/** 投稿のない日で線を切る。帯と同じく、その日の中央値だけを結ぶ。 */
	const medianPath = $derived.by(() => {
		let path = '';
		let previous = false;
		days.forEach((date, index) => {
			const day = summary.get(date);
			if (!day) {
				previous = false;
				return;
			}
			path += `${previous ? 'L' : 'M'}${index * px + px / 2},${y(day.median)}`;
			previous = true;
		});
		return path;
	});
	const monthTicks = $derived(
		days.flatMap((date, index) =>
			index === 0 || date.endsWith('-01') ? [{ date, x: index * px }] : [],
		),
	);

	$effect(() => {
		const actor = did;
		const { from, to } = graph;
		if (!actor) return;
		const key = `${actor}:${from}:${to}`;
		const version = ++loadVersion;
		const apply = (value: { moods: DiaryMoodView[]; entries: DiaryView[]; pending: number }) => {
			moods = value.moods;
			entries = value.entries;
			pending = value.pending;
		};
		const cached = cache.get(key);
		if (cached) {
			apply(cached);
			loading = false;
			error = '';
			void scrollToInitial(key);
			return;
		}
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
				apply(value);
			})
			.catch((cause) => {
				if (version === loadVersion)
					error = cause instanceof Error ? cause.message : m.diaryFetchFailed();
			})
			.finally(() => {
				if (version !== loadVersion) return;
				loading = false;
				void scrollToInitial(key);
			});
	});

	/** 開いたときは選択中の日を中央に、無ければ今日（右端）を見せる。 */
	async function scrollToInitial(key: string) {
		await tick();
		if (!scroller || scrolledKey === key) return;
		scrolledKey = key;
		const target = untrack(() => selected);
		const index = target ? days.indexOf(target) : -1;
		scroller.scrollLeft =
			index >= 0 ? index * px + px / 2 - scroller.clientWidth / 2 : scroller.scrollWidth;
	}

	/** anchorX（スクロール領域内の横位置）にある日を動かさずに段を変える。 */
	async function setZoom(next: number, anchorX?: number) {
		const level = clampMoodZoom(next);
		if (level === zoom || !scroller) return;
		const offset = anchorX ?? scroller.clientWidth / 2;
		const dayAt = (scroller.scrollLeft + offset) / px;
		zoom = level;
		await tick();
		scroller.scrollLeft = dayAt * MOOD_ZOOM_LEVELS[level] - offset;
	}

	// Ctrl/⌘ + ホイール（トラックパッドのピンチも同じイベントで来る）で拡大・縮小。
	// ページのズームを止めるには passive: false で preventDefault する必要がある。
	$effect(() => {
		const element = scroller;
		if (!element) return;
		let accumulated = 0;
		const onWheel = (event: WheelEvent) => {
			if (!event.ctrlKey && !event.metaKey) return;
			event.preventDefault();
			accumulated += event.deltaY;
			if (Math.abs(accumulated) < 40) return;
			const step = accumulated < 0 ? 1 : -1;
			accumulated = 0;
			void setZoom(zoom + step, event.clientX - element.getBoundingClientRect().left);
		};
		element.addEventListener('wheel', onWheel, { passive: false });
		return () => element.removeEventListener('wheel', onWheel);
	});

	/**
	 * グラフの外を押したら選択を外す。開いている投稿一覧と日記の中（本文を選んだり
	 * リンクを押したりする場所）、ズーム、タブは除く。タブを除かないと、日記タブへ
	 * 切り替えた瞬間に選択が消えて日付を引き継げない。Esc でも外せる。
	 */
	$effect(() => {
		if (!selected) return;
		const onClick = (event: MouseEvent) => {
			const target = event.target;
			if (!(target instanceof Element) || !target.isConnected) return;
			if (target.closest('[data-mood-keep], [role="tab"]')) return;
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

	function select(date: string) {
		selected = selected === date ? undefined : date;
	}

	const longDate = (date: string) =>
		new Date(`${date}T12:00:00`).toLocaleDateString(dateLocale(), {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	const monthLabel = (date: string) =>
		new Date(`${date}T12:00:00`).toLocaleDateString(dateLocale(), { month: 'short' });
	const timeLabel = (iso: string) =>
		new Date(iso).toLocaleTimeString(dateLocale(), { hour: '2-digit', minute: '2-digit' });
	const medianLabel = (value: number) => formatValence(Math.round(value * 10) / 10);
	const tone = (value: number) => (value > 0 ? 'positive' : 'negative');
</script>

<section class="mood card">
	<header class="mood-head">
		<div>
			<h2>{m.moodTitle()}</h2>
			<p>{longDate(graph.from)} – {longDate(graph.to)}</p>
		</div>
		<div
			class="mood-zoom"
			data-mood-keep
			role="group"
			aria-label={m.moodZoomHint()}
			title={m.moodZoomHint()}
		>
			<button
				type="button"
				aria-label={m.moodZoomOut()}
				disabled={zoom === 0}
				onclick={() => setZoom(zoom - 1)}>−</button
			>
			<button
				type="button"
				aria-label={m.moodZoomIn()}
				disabled={zoom === MOOD_ZOOM_LEVELS.length - 1}
				onclick={() => setZoom(zoom + 1)}>+</button
			>
		</div>
	</header>

	{#if error}
		<div class="state error">{error}</div>
	{:else}
		<div class="mood-chart">
			<svg class="mood-axis" width="26" height={HEIGHT} aria-hidden="true">
				{#each [5, 0, -5] as value (value)}
					<text x="22" y={y(value) + 3} text-anchor="end">{formatValence(value)}</text>
				{/each}
			</svg>
			<div class="mood-scroll" data-mood-keep bind:this={scroller} aria-busy={loading}>
				<svg
					{width}
					height={HEIGHT}
					role="group"
					aria-label={m.moodGraphAria()}
					onmouseleave={() => (hovered = undefined)}
				>
					<defs>
						<!-- 値の高さで色が決まるよう、グラフ全体の縦軸に1本だけ張る（userSpaceOnUse）。 -->
						<linearGradient
							id={gradientId}
							gradientUnits="userSpaceOnUse"
							x1="0"
							x2="0"
							y1={y(-5)}
							y2={y(5)}
						>
							<stop offset="0" style="stop-color: var(--mood-scale-1)" />
							<stop offset="0.25" style="stop-color: var(--mood-scale-2)" />
							<stop offset="0.5" style="stop-color: var(--mood-scale-3)" />
							<stop offset="0.75" style="stop-color: var(--mood-scale-4)" />
							<stop offset="1" style="stop-color: var(--mood-scale-5)" />
						</linearGradient>
					</defs>
					{#each [5, -5] as value (value)}
						<line class="mood-grid" x1="0" x2={width} y1={y(value)} y2={y(value)} />
					{/each}
					<line class="mood-zero" x1="0" x2={width} y1={y(0)} y2={y(0)} />
					{#each monthTicks as month (month.date)}
						<line
							class="mood-grid"
							x1={month.x}
							x2={month.x}
							y1={PAD_TOP}
							y2={HEIGHT - PAD_BOTTOM}
						/>
						<text class="mood-month" x={month.x + 2} y={HEIGHT - 6}>{monthLabel(month.date)}</text>
					{/each}

					{#if selected && days.includes(selected)}
						<rect
							class="mood-selected"
							x={days.indexOf(selected) * px}
							y={PAD_TOP - 4}
							width={px}
							height={HEIGHT - PAD_TOP - PAD_BOTTOM + 8}
							rx="2"
						/>
					{/if}

					{#each days as date, index (date)}
						{@const day = summary.get(date)}
						{#if day}
							{@const shape = bar(index, day.q1, day.q3)}
							<rect
								class="mood-band"
								fill={`url(#${gradientId})`}
								x={shape.x}
								y={shape.y}
								width={shape.width}
								height={shape.height}
								rx={shape.radius}
							/>
						{/if}
					{/each}
					<path class="mood-median" d={medianPath} />

					{#each days as date, index (date)}
						{@const day = summary.get(date)}
						{@const hasDiary = diaryByDate.has(date)}
						<rect
							class="mood-hit"
							x={index * px}
							y="0"
							width={px}
							height={HEIGHT - PAD_BOTTOM}
							role="button"
							tabindex={day || hasDiary ? 0 : -1}
							data-date={date}
							aria-pressed={selected === date}
							aria-label={day
								? m.moodDayAria({
										date: longDate(date),
										count: day.points.length,
										median: medianLabel(day.median),
									})
								: longDate(date)}
							onmouseenter={() => (hovered = date)}
							onfocus={() => (hovered = date)}
							onblur={() => (hovered = undefined)}
							onclick={() => select(date)}
							onkeydown={(event) => {
								if (event.key !== 'Enter' && event.key !== ' ') return;
								event.preventDefault();
								select(date);
							}}
						/>
					{/each}
				</svg>
			</div>
		</div>

		<div class="mood-legend" aria-hidden="true">
			<span><i class="swatch swatch--band"></i>{m.moodLegendBand()}</span>
			<span><i class="swatch swatch--median"></i>{m.moodLegendMedian()}</span>
		</div>

		<p class="mood-status" aria-live="polite">
			{#if loading}
				{m.loading()}
			{:else if focusDay}
				<strong>{longDate(focusDay)}</strong>
				{#if focusSummary}
					· {m.moodDayPosts({ count: focusSummary.points.length })} · {m.moodMedian({
						value: medianLabel(focusSummary.median),
					})}
				{/if}
			{:else if moods.length}
				{m.moodSelectHint()}
			{:else}
				{m.moodEmpty()}
			{/if}
		</p>
		{#if pending > 0}
			<p class="mood-pending">{m.moodPending({ count: pending })}</p>
		{/if}

		{#if selected && !loading}
			<div class="mood-selection" data-mood-keep>
				<section class="mood-day" aria-label={longDate(selected)}>
					{#if selectedDay}
						<ol>
							{#each selectedDay.points as point (point.uri)}
								<li>
									<span class={`mood-chip mood-chip--${tone(point.valence)}`}
										>{formatValence(point.valence)}</span
									>
									<a href={postHref(point.uri)}>
										<time datetime={point.createdAt}>{timeLabel(point.createdAt)}</time>
										<span class="mood-text">{point.text}</span>
									</a>
								</li>
							{/each}
						</ol>
					{:else}
						<p class="mood-hint">{m.moodDayNoPosts()}</p>
					{/if}
				</section>
				<DiaryDayDetail summary={selectedDiary} entry={selectedDiary} {botActor} />
			</div>
		{/if}
		<p class="mood-about">{m.moodAbout()}</p>
	{/if}
</section>

<style>
	.mood {
		padding: 16px;
		display: grid;
		gap: 12px;
		min-inline-size: 0;
		max-inline-size: 100%;
	}
	.mood-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 12px;
	}
	.mood-head h2 {
		font-size: 15px;
		font-weight: 800;
		color: var(--text-strong);
	}
	.mood-head p {
		margin-top: 2px;
		font-size: 11px;
		color: var(--text-faint);
	}
	.mood-zoom {
		display: flex;
		gap: 4px;
	}
	.mood-zoom button {
		inline-size: 32px;
		block-size: 32px;
		border: 1px solid var(--line);
		border-radius: var(--radius-m);
		background: var(--bg-raised);
		color: var(--text);
		font-size: 16px;
		font-weight: 700;
		line-height: 1;
	}
	.mood-zoom button:disabled {
		color: var(--text-faint);
		opacity: 0.5;
	}
	.mood-chart {
		display: flex;
		min-inline-size: 0;
	}
	.mood-axis {
		flex: 0 0 auto;
	}
	.mood-axis text,
	.mood-month {
		fill: var(--text-faint);
		font-size: 10px;
	}
	.mood-scroll {
		flex: 1 1 auto;
		min-inline-size: 0;
		overflow-x: auto;
		overflow-y: hidden;
		overscroll-behavior-inline: contain;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: thin;
		scrollbar-color: color-mix(in srgb, var(--text-faint), transparent 35%) transparent;
	}
	.mood-scroll svg {
		display: block;
	}
	.mood-grid {
		stroke: var(--line);
		stroke-dasharray: 2 3;
	}
	.mood-zero {
		stroke: var(--line-strong);
	}
	.mood-median {
		fill: none;
		stroke: var(--mood-median);
		stroke-width: 1.5;
		stroke-linejoin: round;
		stroke-linecap: round;
	}
	.mood-selected {
		fill: var(--accent-weak);
		stroke: var(--focus-ring);
	}
	.mood-hit {
		fill: transparent;
		cursor: pointer;
		outline: none;
	}
	.mood-hit:hover,
	.mood-hit:focus-visible {
		fill: color-mix(in srgb, var(--text-faint) 12%, transparent);
	}
	.mood-legend {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 14px;
		font-size: 11px;
		color: var(--text-muted);
	}
	.swatch {
		display: inline-block;
		margin-inline-end: 5px;
		vertical-align: middle;
	}
	.swatch--band {
		inline-size: 10px;
		block-size: 12px;
		border-radius: 2px;
		background: linear-gradient(
			to top,
			var(--mood-scale-1),
			var(--mood-scale-2),
			var(--mood-scale-3),
			var(--mood-scale-4),
			var(--mood-scale-5)
		);
	}
	.swatch--median {
		inline-size: 14px;
		block-size: 2px;
		background: var(--mood-median);
	}
	.mood-status,
	.mood-pending,
	.mood-hint,
	.mood-about {
		font-size: 12px;
		color: var(--text-faint);
	}
	.mood-status strong {
		color: var(--text-strong);
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
	.mood-day a {
		display: grid;
		gap: 2px;
		min-inline-size: 0;
		color: inherit;
		text-decoration: none;
	}
	.mood-day a:hover .mood-text {
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
	.mood-selection {
		display: grid;
		gap: 12px;
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
