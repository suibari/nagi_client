<script lang="ts">
	import { getDiaries } from '$lib/api/appview';
	import type { ActorView, DiaryView, PostView } from '$lib/api/types';
	import { buildDiaryGraph, diaryActivityIntensity, diaryMonthLabels } from '$lib/diary/calendar';
	import { i18n, m, dateLocale } from '$lib/i18n/i18n.svelte';
	import { tick } from 'svelte';
	import AvatarLink from './AvatarLink.svelte';
	import ChatBubble from './ChatBubble.svelte';

	let {
		did,
		initialDate,
		botActor,
	}: {
		did: string;
		initialDate?: string;
		botActor?: ActorView;
	} = $props();

	const graph = buildDiaryGraph();
	const monthLabels = diaryMonthLabels(graph.weeks);
	let selected = $state<string | undefined>();
	let hovered = $state<string | undefined>();
	let entries = $state<DiaryView[]>([]);
	let loading = $state(true);
	let error = $state('');
	let graphScroll = $state<HTMLDivElement>();
	let loadVersion = 0;
	let scrolledKey = '';
	const cache = new Map<string, DiaryView[]>();

	$effect(() => {
		if (!initialDate || initialDate < graph.from || initialDate > graph.to) return;
		selected = initialDate;
	});

	$effect(() => {
		const actor = did;
		if (!actor) return;
		const key = `${actor}:${graph.from}:${graph.to}`;
		const version = ++loadVersion;
		const finish = async () => {
			await tick();
			if (!graphScroll || scrolledKey === key) return;
			scrolledKey = key;
			if (initialDate && initialDate >= graph.from && initialDate <= graph.to) {
				graphScroll
					.querySelector<HTMLElement>(`[data-date="${initialDate}"]`)
					?.scrollIntoView({ block: 'nearest', inline: 'center' });
			} else {
				graphScroll.scrollLeft = graphScroll.scrollWidth;
			}
		};
		const cached = cache.get(key);
		if (cached) {
			entries = cached;
			loading = false;
			error = '';
			void finish();
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
				void finish();
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
	const actorName = (actor: ActorView) => actor.displayName ?? actor.handle;
	const diaryPost = $derived.by((): PostView | undefined => {
		if (!current) return undefined;
		return {
			uri: current.uri,
			cid: current.cid,
			author:
				botActor ??
				({
					did: 'did:unknown:bot-tan',
					handle: 'bot-tan',
					displayName: m.botBadge(),
					isBot: true,
				} satisfies ActorView),
			text: current.text,
			langs: current.langs,
			createdAt: current.createdAt,
			indexedAt: current.indexedAt,
			reactions: [],
			isBot: true,
			isAffirmation: false,
		};
	});
</script>

<section class="diary card">
	<header class="diary-head">
		<div>
			<h2>{m.diaryAnnualActivity()}</h2>
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
									{@const intensity = entry
										? diaryActivityIntensity(entry.postCount, maxPostCount)
										: undefined}
									{#if entry && !day.future}
										<button
											class="diary-day diary-day--has"
											class:selected={selected === day.date}
											class:diary-day--activity={intensity !== undefined}
											style={intensity === undefined
												? undefined
												: `--diary-activity-percent: ${12 + intensity * 88}%`}
											type="button"
											data-date={day.date}
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

		{#if loading}
			<div class="state">{m.loading()}</div>
		{:else if detail}
			<article class="diary-day-detail" aria-live="polite">
				<div>
					<h3>{longDate(detail.date)}</h3>
					{#if entryTitle(detail)}
						<p class="diary-title">{m.diaryTitleLabel({ title: entryTitle(detail)! })}</p>
					{/if}
				</div>
				{#if detail.involvedActors?.length}
					<div class="diary-connections">
						<span>{m.diaryInvolvedPeople()}</span>
						<div class="reaction-actors" role="group" aria-label={m.diaryInvolvedPeople()}>
							{#each detail.involvedActors as actor (actor.did)}
								<AvatarLink
									{actor}
									size="small"
									className="reaction-avatar"
									ariaLabel={m.viewProfileOfAria({ name: actorName(actor) })}
									title={actorName(actor)}
								/>
							{/each}
							{#if detail.involvedActorsHasMore}
								<span class="reaction-more" aria-label={m.diaryMoreConnectionsAria()}>…</span>
							{/if}
						</div>
					</div>
				{/if}
			</article>
		{:else if entries.length}
			<p class="diary-hint">{m.diaryHoverHint()}</p>
		{:else}
			<p class="diary-hint">{m.diaryEmptyYear()}</p>
		{/if}

		{#if current && diaryPost}
			<article class="diary-entry">
				<ChatBubble post={diaryPost} displayOnly collapsible={false} />
			</article>
		{/if}
		<p class="diary-about">{m.diaryAbout()}</p>
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
		overflow-x: auto;
		overflow-y: hidden;
		padding: 2px 2px 8px;
		scrollbar-width: thin;
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
	.diary-day-detail {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 18px;
		padding: 12px;
		border-radius: var(--radius-m);
		background: var(--surface-soft);
		min-block-size: 62px;
	}
	.diary-day-detail h3 {
		font-size: 12px;
		font-weight: 800;
		color: var(--text-strong);
	}
	.diary-title {
		display: inline-block;
		max-inline-size: 100%;
		margin-top: 6px;
		border-radius: var(--radius-pill);
		background: var(--badge-title-bg);
		color: var(--badge-title-fg);
		padding: 3px 10px;
		font-size: 11px;
		font-weight: 800;
		overflow-wrap: anywhere;
	}
	.diary-connections {
		display: flex;
		align-items: center;
		gap: 6px;
		white-space: nowrap;
		font-size: 11px;
		font-weight: 700;
		color: var(--text-muted);
	}
	.diary-entry {
		min-inline-size: 0;
	}
	.diary-hint,
	.diary-about {
		font-size: 12px;
		color: var(--text-faint);
	}
	@media (max-width: 560px) {
		.diary-day-detail {
			flex-direction: column;
		}
	}
</style>
