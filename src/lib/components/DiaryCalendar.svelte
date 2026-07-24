<script lang="ts">
	import { getDiaries } from '$lib/api/appview';
	import type { ActorView, DiaryView, PostView } from '$lib/api/types';
	import { i18n, m, dateLocale } from '$lib/i18n/i18n.svelte';
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

	/** "YYYY-MM" */
	const monthOf = (date: string) => date.slice(0, 7);
	const todayMonth = () => {
		const now = new Date();
		return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
	};

	let month = $state(todayMonth());
	let selected = $state<string | undefined>();
	// 通知から日付付きで来たときはその月を開く。マウントしたまま別の日記に
	// 飛んでも追随するよう $effect で見る。
	$effect(() => {
		if (!initialDate) return;
		month = monthOf(initialDate);
		selected = initialDate;
	});
	let entries = $state<DiaryView[]>([]);
	let loading = $state(true);
	let error = $state('');
	// 月ごとのキャッシュ。行き来しても取り直さない。
	const cache = new Map<string, DiaryView[]>();

	$effect(() => {
		const actor = did;
		const target = month;
		if (!actor) return;
		const cached = cache.get(`${actor}:${target}`);
		if (cached) {
			entries = cached;
			loading = false;
			error = '';
			return;
		}
		loading = true;
		error = '';
		getDiaries(actor, { month: target })
			.then((page) => {
				cache.set(`${actor}:${target}`, page.items);
				entries = page.items;
			})
			.catch((e) => {
				error = e instanceof Error ? e.message : m.diaryFetchFailed();
			})
			.finally(() => {
				loading = false;
			});
	});

	const byDate = $derived(new Map(entries.map((entry) => [entry.date, entry])));
	const current = $derived(selected ? byDate.get(selected) : undefined);

	const shiftMonth = (delta: number) => {
		const [year, mon] = month.split('-').map(Number);
		const date = new Date(year, mon - 1 + delta, 1);
		month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
		selected = undefined;
	};

	/** その月の日付セル。頭の空白は前月ぶんの詰め物。 */
	const cells = $derived.by(() => {
		const [year, mon] = month.split('-').map(Number);
		const first = new Date(year, mon - 1, 1);
		const days = new Date(year, mon, 0).getDate();
		const out: Array<{ date: string; day: number } | null> = Array(first.getDay()).fill(null);
		for (let day = 1; day <= days; day++) {
			out.push({ date: `${month}-${String(day).padStart(2, '0')}`, day });
		}
		return out;
	});

	const monthLabel = $derived(
		new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1, 1).toLocaleDateString(
			dateLocale(),
			{ year: 'numeric', month: 'long' },
		),
	);
	const weekdays = $derived.by(() => {
		const formatter = new Intl.DateTimeFormat(dateLocale(), { weekday: 'narrow' });
		// 1970-01-04 は日曜。曜日の並びは日曜始まり（getDay と揃える）。
		return Array.from({ length: 7 }, (_, index) =>
			formatter.format(new Date(Date.UTC(1970, 0, 4 + index))),
		);
	});
	const longDate = (date: string) =>
		new Date(`${date}T00:00:00`).toLocaleDateString(dateLocale(), {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	const entryTitle = (entry: DiaryView) =>
		i18n.locale === 'ja' ? (entry.titleJa ?? entry.titleEn) : (entry.titleEn ?? entry.titleJa);
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
		<button
			class="icon-action"
			type="button"
			aria-label={m.diaryPrevMonth()}
			title={m.diaryPrevMonth()}
			onclick={() => shiftMonth(-1)}>‹</button
		>
		<h2>{monthLabel}</h2>
		<button
			class="icon-action"
			type="button"
			aria-label={m.diaryNextMonth()}
			title={m.diaryNextMonth()}
			onclick={() => shiftMonth(1)}>›</button
		>
	</header>

	{#if error}
		<div class="state error">{error}</div>
	{:else}
		<div class="diary-grid" aria-busy={loading}>
			{#each weekdays as weekday, index (index)}
				<span class="diary-weekday">{weekday}</span>
			{/each}
			{#each cells as cell, index (cell?.date ?? `pad-${index}`)}
				{#if !cell}
					<span class="diary-cell diary-cell--pad"></span>
				{:else if byDate.has(cell.date)}
					<button
						class="diary-cell diary-cell--has"
						class:selected={selected === cell.date}
						type="button"
						aria-pressed={selected === cell.date}
						aria-label={m.diaryDayAria({ date: longDate(cell.date) })}
						onclick={() => (selected = selected === cell.date ? undefined : cell.date)}
						>{cell.day}</button
					>
				{:else}
					<span class="diary-cell">{cell.day}</span>
				{/if}
			{/each}
		</div>

		{#if loading}
			<div class="state">{m.loading()}</div>
		{:else if current && diaryPost}
			<article class="diary-entry">
				<h3>{longDate(current.date)}</h3>
				{#if entryTitle(current)}
					<p class="diary-title">{m.diaryTitleLabel({ title: entryTitle(current)! })}</p>
				{/if}
				<ChatBubble post={diaryPost} displayOnly />
			</article>
		{:else if entries.length}
			<p class="diary-hint">{m.diaryPickDate()}</p>
		{:else}
			<p class="diary-hint">{m.diaryEmptyMonth()}</p>
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
	.diary-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}
	.diary-head h2 {
		font-size: 15px;
		font-weight: 800;
		color: var(--text-strong);
	}
	.diary-grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 4px;
	}
	.diary-weekday {
		text-align: center;
		font-size: 11px;
		font-weight: 700;
		color: var(--text-faint);
		padding-bottom: 2px;
	}
	.diary-cell {
		display: grid;
		place-items: center;
		aspect-ratio: 1;
		border-radius: var(--radius-s);
		border: 1px solid transparent;
		background: none;
		font-size: 12px;
		color: var(--text-muted);
	}
	.diary-cell--pad {
		visibility: hidden;
	}
	/* 日記がある日だけ押せる */
	.diary-cell--has {
		background: var(--accent-softer);
		border-color: var(--accent-border);
		color: var(--accent-strong);
		font-weight: 800;
		cursor: pointer;
	}
	.diary-cell--has:hover {
		background: var(--accent-soft);
	}
	.diary-cell--has.selected {
		background: var(--accent-soft);
		box-shadow: 0 0 0 2px var(--focus-ring);
	}
	.diary-entry h3 {
		font-size: 14px;
		font-weight: 800;
		color: var(--text-strong);
		margin-bottom: 6px;
	}
	.diary-entry {
		min-inline-size: 0;
	}
	.diary-title {
		display: inline-block;
		max-inline-size: 100%;
		border-radius: var(--radius-pill);
		background: var(--badge-title-bg);
		color: var(--badge-title-fg);
		padding: 3px 10px;
		font-size: 11px;
		font-weight: 800;
		margin-bottom: 8px;
		overflow-wrap: anywhere;
	}
	.diary-hint,
	.diary-about {
		font-size: 12px;
		color: var(--text-faint);
	}
</style>
