<script lang="ts">
	import { markChronicleSeen } from '$lib/chronicle/notice';
	import { onDestroy } from 'svelte';
	import { APPVIEW_URL, getChronicle } from '$lib/api/appview';
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
		avatar,
		preview,
	}: {
		did: string;
		/** 見出しに出す本人の名前。取れないうちは節目だけ先に見せる。 */
		displayName?: string;
		/** 年表の表紙に添える本人のプロフィール画像。 */
		avatar?: string;
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
	let disposed = false;
	onDestroy(() => {
		disposed = true;
	});

	const years = $derived(groupChronicleByYear(items));
	const avatarSrc = $derived(avatar?.startsWith('/') && !preview ? APPVIEW_URL + avatar : avatar);

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
			const actor = did;
			const page = await getChronicle(actor, { cursor: next, lang: i18n.locale });
			if (disposed || actor !== did) return;
			items = next ? mergeChronicle(items, page.items) : page.items;
			cursor = page.cursor;
			hasMore = page.hasMore;
			void markChronicleSeen(actor, page);
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
	<header class="chronicle-head" class:has-avatar={!!avatarSrc}>
		{#if avatarSrc}
			<div class="chronicle-portrait" aria-hidden="true">
				<img src={avatarSrc} alt="" loading="lazy" />
			</div>
		{/if}
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
							<!--
								見出しは**記事の原題**をそのまま出す（botたんの言い換えは使わない）。
								news.title はサーバが表示言語に合わせて選んだ値。
							-->
							<a
								class="chronicle-aside-text"
								href={event.news?.url}
								target="_blank"
								rel="noopener noreferrer"
							>
								「{event.news?.title}」
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
									<!--
										ひとことは botたんの言葉なので吹き出しで出す。
										アプリの他の場所（リプライ・日記・ニュース）と同じ .bubble を借りる。
										ここは ChatBubble の中ではないが、話し手はレールのアイコンで分かるので
										名前とアバターは重ねない。
									-->
									<p class="bubble chronicle-detail">
										{chronicleEventDetail(event, i18n.locale)}
									</p>
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
	.chronicle-head {
		position: relative;
		isolation: isolate;
		min-inline-size: 0;
	}
	.chronicle-head.has-avatar {
		min-block-size: 112px;
		padding-block-start: 8px;
		padding-inline-end: clamp(96px, 30%, 148px);
	}
	.chronicle-portrait {
		position: absolute;
		z-index: -1;
		inset-block-start: -16px;
		inset-inline-end: -16px;
		inline-size: clamp(116px, 36%, 168px);
		block-size: calc(100% + 16px);
		overflow: hidden;
		border-start-end-radius: var(--radius-m);
		pointer-events: none;
		-webkit-mask-image:
			linear-gradient(to right, transparent, #000 36%),
			linear-gradient(to bottom, #000 62%, transparent);
		-webkit-mask-composite: source-in;
		mask-image:
			linear-gradient(to right, transparent, #000 36%),
			linear-gradient(to bottom, #000 62%, transparent);
		mask-composite: intersect;
	}
	.chronicle-portrait img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
		object-position: center 35%;
		filter: grayscale(1) contrast(1.18);
		opacity: 0.85;
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
		position: relative;
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
	.chronicle-item:has(~ .chronicle-item)::before,
	.chronicle-aside:has(~ .chronicle-item)::before {
		content: '';
		position: absolute;
		inset-inline-start: 13px;
		/* 次の項目のアイコンまで、項目間の gap と上 padding もつなぐ。 */
		inset-block-start: 36px;
		inset-block-end: -12px;
		inline-size: 2px;
		background: color-mix(in srgb, var(--line), transparent 20%);
		pointer-events: none;
	}
	.chronicle-aside:has(~ .chronicle-item)::before {
		inset-block-start: 0;
	}
	.chronicle-item:has(+ .chronicle-aside)::before,
	.chronicle-aside:has(+ .chronicle-aside)::before {
		inset-block-end: 0;
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
		/* .bubble のしっぽ（::before が left: -8px）が切れないよう左に逃がす。 */
		margin-inline-start: 8px;
		margin-block-start: 2px;
		font-size: 13px;
		color: var(--text);
		overflow-wrap: anywhere;
		white-space: pre-wrap;
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
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 2px;
		padding-inline-start: 38px;
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
