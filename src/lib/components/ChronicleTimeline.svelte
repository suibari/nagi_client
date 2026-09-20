<script lang="ts">
	import { getChronicle } from '$lib/api/appview';
	import type { CardView, ChronicleEventKind, ChronicleEventView } from '$lib/api/types';
	import {
		chronicleEventDetail,
		chronicleEventIcon,
		chronicleEventLabel,
		isAttachedNews,
		groupChronicleByYear,
		mergeChronicle,
	} from '$lib/chronicle/chronicle';
	import { dateLocale, i18n, m } from '$lib/i18n/i18n.svelte';
	import AffirmationCard from './AffirmationCard.svelte';
	import CardDetailDialog from './CardDetailDialog.svelte';
	import InfiniteScroll from './InfiniteScroll.svelte';
	import NewsCard from './NewsCard.svelte';
	import Icon from './shell/Icon.svelte';

	let {
		did,
		displayName,
		preview,
	}: {
		did: string;
		/** 見出しに出す本人の名前。取れないうちは節目だけ先に見せる。 */
		displayName?: string;
		/**
		 * 開発専用（/dev/chronicle）。渡されたらAPIを叩かず、この配列を年表として描く。
		 * 数年ぶんの年表を seed しないと演出を確認できない、という状態を避けるためだけの口。
		 */
		preview?: ChronicleEventView[];
	} = $props();

	let items = $state<ChronicleEventView[]>([]);
	let cursor = $state<string | undefined>();
	let hasMore = $state(true);
	let loading = $state(false);
	let error = $state('');
	let opened = $state<CardView | undefined>();
	let revealed = $state(new Set<string>());
	let loadedFor = '';

	const years = $derived(groupChronicleByYear(items));

	/**
	 * 固定文言の kind はここで i18n から引く。サーバは kind しか返さないので、
	 * 言語を切り替えると過去の節目のラベルもそのまま追従する。
	 */
	const labels = $derived<Partial<Record<ChronicleEventKind, string>>>({
		nagi_joined: m.chronicleKindNagiJoined(),
		bot_met: m.chronicleKindBotMet(),
		first_card_ur: m.chronicleKindFirstCardUr(),
		first_card_aar: m.chronicleKindFirstCardAar(),
		anniversary_card: m.chronicleKindAnniversaryCard(),
		highlight: m.chronicleKindHighlight(),
		news_context: m.chronicleKindNewsContext(),
	});

	const longDate = (date: string) =>
		new Date(`${date}T12:00:00`).toLocaleDateString(dateLocale(), {
			month: 'long',
			day: 'numeric',
		});

	async function load(next?: string) {
		if (loading) return;
		loading = true;
		error = '';
		try {
			const page = await getChronicle(did, { cursor: next, lang: i18n.locale });
			items = next ? mergeChronicle(items, page.items) : page.items;
			cursor = page.cursor;
			hasMore = page.hasMore;
		} catch (cause) {
			error = cause instanceof Error ? cause.message : m.chronicleFetchFailed();
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		if (preview) {
			items = preview;
			hasMore = false;
			return;
		}
		if (!did || loadedFor === did) return;
		loadedFor = did;
		void load();
	});

	/**
	 * スクロールで1件ずつ姿を現す演出。
	 *
	 * **要素の基底状態を opacity: 0 にしてはいけない。** base.css の
	 * `prefers-reduced-motion` は `animation: none !important` を全要素に当てるので、
	 * 基底が透明だと演出を切った人には永久に見えないままになる。
	 * opacity: 0 は @keyframes の from にだけ書き、ここでは観測自体を止める。
	 */
	$effect(() => {
		if (typeof IntersectionObserver === 'undefined') return;
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const observer = new IntersectionObserver(
			(entries) => {
				const seen = entries.filter((entry) => entry.isIntersecting);
				if (!seen.length) return;
				const next = new Set(revealed);
				for (const entry of seen) {
					const id = (entry.target as HTMLElement).dataset.eventId;
					if (id) next.add(id);
					observer.unobserve(entry.target);
				}
				revealed = next;
			},
			{ rootMargin: '0px 0px -10%' },
		);
		for (const node of document.querySelectorAll<HTMLElement>('[data-event-id]'))
			if (!revealed.has(node.dataset.eventId!)) observer.observe(node);
		return () => observer.disconnect();
	});
</script>

<section class="chronicle card">
	<header class="chronicle-head">
		<!-- ただの「年表」ではなく「〜の年表」。その人のための1冊として読ませる。 -->
		<h2>{displayName ? m.chronicleTitle({ name: displayName }) : m.diaryTabChronicle()}</h2>
		<p>{m.chronicleAbout()}</p>
	</header>

	{#if error && !items.length}
		<div class="state error">{error}</div>
	{:else if !items.length && !loading && !hasMore}
		<p class="chronicle-hint">{m.chronicleEmpty()}</p>
	{:else}
		{#each years as group (group.year)}
			<h3 class="chronicle-year">{group.year}</h3>
			<ol class="chronicle-list" aria-label={m.chronicleYearAria({ year: group.year })}>
				{#each group.events as event (event.id)}
					{#if isAttachedNews(event)}
						<!--
							そのころ世の中では。独立した節目ではなく、直前のまとめに**付く一行**として描く。
							日付も出さない（月末に寄せてあるだけで、その日の出来事ではない）。
						-->
						<li class="chronicle-aside" data-event-id={event.id}>
							<span class="chronicle-aside-label">{m.chronicleKindNewsContext()}</span>
							<a
								class="chronicle-aside-text"
								href={event.news?.url}
								target="_blank"
								rel="noopener noreferrer"
							>
								「{chronicleEventLabel(event, i18n.locale, labels)}」
							</a>
						</li>
					{:else}
						<li
							class="chronicle-item"
							class:chronicle-revealed={revealed.has(event.id)}
							data-event-id={event.id}
						>
							<span class="chronicle-rail" aria-hidden="true">
								<Icon name={chronicleEventIcon(event.kind)} size={14} />
							</span>
							<div class="chronicle-body">
								<time datetime={event.date}>{longDate(event.date)}</time>
								<p class="chronicle-title">{chronicleEventLabel(event, i18n.locale, labels)}</p>
								{#if chronicleEventDetail(event, i18n.locale)}
									<p class="chronicle-detail">{chronicleEventDetail(event, i18n.locale)}</p>
								{/if}
								{#if event.card}
									<!-- draw は渡さない。過去の1枚を見返すのに、毎回フリップと紙吹雪で祝わせない。 -->
									<button
										class="chronicle-card"
										type="button"
										onclick={() => (opened = event.card)}
									>
										<AffirmationCard card={event.card} />
									</button>
								{/if}
								{#if event.news}
									<div class="chronicle-news">
										<NewsCard news={event.news} embedded />
									</div>
								{/if}
								{#if event.diaryDate}
									<a class="chronicle-link" href={`/diary?date=${event.diaryDate}`}>
										{m.chronicleOpenDiary()} →
									</a>
								{/if}
							</div>
						</li>
					{/if}
				{/each}
			</ol>
		{/each}
		<InfiniteScroll {hasMore} {loading} {error} onload={() => load(cursor)} />
	{/if}
</section>

{#if opened}
	<CardDetailDialog initial={opened} actor={did} onclose={() => (opened = undefined)} />
{/if}

<style>
	.chronicle {
		padding: 16px;
		display: grid;
		gap: 12px;
		min-inline-size: 0;
		max-inline-size: 100%;
	}
	/* 一覧の見出しより大きく、1冊の表紙のように見せる。 */
	.chronicle-head h2 {
		font-size: 22px;
		font-weight: 800;
		letter-spacing: 0.01em;
		color: var(--text-strong);
	}
	.chronicle-head::after {
		content: '';
		display: block;
		inline-size: 40px;
		block-size: 3px;
		margin-block-start: 8px;
		border-radius: var(--radius-pill);
		background: var(--accent-strong);
	}
	.chronicle-head p {
		margin-top: 2px;
		font-size: 11px;
		color: var(--text-faint);
	}
	.chronicle-year {
		margin-block-start: 8px;
		font-size: 26px;
		font-weight: 800;
		letter-spacing: 0.04em;
		color: var(--text-strong);
	}
	.chronicle-list {
		display: grid;
		gap: 4px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.chronicle-item {
		display: grid;
		grid-template-columns: 28px minmax(0, 1fr);
		gap: 10px;
		padding-block: 8px;
	}
	/* 縦のレール。節目のあいだを1本の線でつなぐ。 */
	.chronicle-rail {
		position: relative;
		display: grid;
		place-items: center;
		inline-size: 28px;
		block-size: 28px;
		border-radius: var(--radius-pill);
		background: color-mix(in srgb, var(--accent-strong), transparent 86%);
		color: var(--accent-strong);
	}
	.chronicle-item:not(:last-child) .chronicle-rail::after {
		content: '';
		position: absolute;
		inset-block-start: 100%;
		inline-size: 2px;
		block-size: calc(100% + 8px);
		background: color-mix(in srgb, var(--line), transparent 20%);
	}
	.chronicle-body {
		min-inline-size: 0;
		display: grid;
		gap: 4px;
	}
	.chronicle-body time {
		font-size: 11px;
		color: var(--text-faint);
	}
	.chronicle-title {
		font-size: 14px;
		font-weight: 700;
		color: var(--text-strong);
		overflow-wrap: anywhere;
	}
	.chronicle-detail {
		font-size: 13px;
		color: var(--text);
		overflow-wrap: anywhere;
	}
	.chronicle-card {
		justify-self: start;
		margin-block-start: 4px;
		padding: 0;
		border: 0;
		background: none;
		inline-size: min(100%, 150px);
	}
	/* まとめに付く一行。軸の右側に、控えめに寄せる。 */
	.chronicle-aside {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 2px;
		margin-inline-start: 38px;
		margin-block-start: -4px;
		padding-block-end: 8px;
		min-inline-size: 0;
	}
	.chronicle-aside-label {
		font-size: 11px;
		color: var(--text-faint);
	}
	.chronicle-aside-text {
		font-size: 13px;
		color: var(--text);
		overflow-wrap: anywhere;
	}
	.chronicle-news {
		margin-block-start: 4px;
		min-inline-size: 0;
	}
	.chronicle-link {
		justify-self: start;
		font-size: 12px;
		color: var(--accent-strong);
	}
	.chronicle-hint,
	.state {
		padding: 1.5rem 0;
		color: var(--text-faint);
		font-size: 13px;
		text-align: center;
	}
	.state.error {
		color: var(--danger);
	}
</style>
