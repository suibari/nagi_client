<script lang="ts">
	import { markChronicleSeen } from '$lib/chronicle/notice';
	import { onDestroy, tick } from 'svelte';
	import { APPVIEW_URL, getChronicle } from '$lib/api/appview';
	import type { CardView, ChronicleEventKind, ChronicleEventView } from '$lib/api/types';
	import {
		chronicleEventDetail,
		chronicleEventIcon,
		chronicleEventLabel,
		isAttachedNews,
		groupChronicleByYear,
		loadAllChronicle,
	} from '$lib/chronicle/chronicle';
	import { dateLocale, i18n, m } from '$lib/i18n/i18n.svelte';
	import AffirmationCard from './AffirmationCard.svelte';
	import CardDetailDialog from './CardDetailDialog.svelte';
	import ChronicleScrubber, { chronicleEndScrollY } from './ChronicleScrubber.svelte';
	import NewsCard from './NewsCard.svelte';
	import Spinner from './Spinner.svelte';
	import Icon from './shell/Icon.svelte';

	let {
		did,
		displayName,
		avatar,
		preview,
		showcase = false,
	}: {
		did: string;
		/** 見出しに出す本人の名前。取れないうちは節目だけ先に見せる。 */
		displayName?: string;
		/** 年表の表紙に添える本人のプロフィール画像。 */
		avatar?: string;
		/**
		 * 開発・紹介用。渡されたらAPIを叩かず、この配列を年表として描く。
		 * 数年ぶんの年表を seed しないと演出を確認できない、という状態を避けるための口。
		 */
		preview?: ChronicleEventView[];
		/** ページの一部に置くサンプル。スクラバーと末尾への初期スクロールを付けない（CHRON-03/04）。 */
		showcase?: boolean;
	} = $props();

	let items = $state<ChronicleEventView[]>([]);
	let cursor = $state<string | undefined>();
	let hasMore = $state(true);
	let loading = $state(false);
	let error = $state('');
	let opened = $state<CardView | undefined>();
	let revealed = $state(new Set<string>());
	let body = $state<HTMLElement>();
	let loadedFor = '';
	let disposed = false;
	onDestroy(() => {
		disposed = true;
	});

	const years = $derived(groupChronicleByYear(items));
	const yearKeys = $derived(years.map((group) => group.year));
	const scrubbable = $derived(!showcase && !loading && yearKeys.length >= 2);
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

	async function scrollToNow() {
		if (showcase) return;
		await tick();
		// ページを直接開いたとき、SvelteKitは描画後にスクロールを先頭へ戻す。その後に動かす。
		await new Promise((resolve) => requestAnimationFrame(resolve));
		if (disposed || !body) return;
		scrollTo({ top: chronicleEndScrollY(body), behavior: 'instant' });
	}

	/** 全年を読み切ってから描く。途中で失敗したら読めた年を出し、続きから再試行させる。 */
	async function load() {
		if (loading) return;
		loading = true;
		error = '';
		const actor = did;
		const result = await loadAllChronicle(
			(next) => getChronicle(actor, { cursor: next, lang: i18n.locale }),
			{ items, cursor },
			(page) => {
				if (!disposed && actor === did) void markChronicleSeen(actor, page);
			},
		);
		if (disposed || actor !== did) return;
		items = result.items;
		cursor = result.cursor;
		hasMore = result.hasMore;
		if (result.error)
			error = result.error instanceof Error ? result.error.message : m.chronicleFetchFailed();
		loading = false;
		void scrollToNow();
	}

	$effect(() => {
		if (preview) {
			items = preview;
			hasMore = false;
			void scrollToNow();
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
		void items.length;
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
		for (const node of body?.querySelectorAll<HTMLElement>('[data-event-id]') ?? [])
			if (!revealed.has(node.dataset.eventId!)) observer.observe(node);
		return () => observer.disconnect();
	});
</script>

<section class="chronicle card" class:has-scrub={scrubbable}>
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

	<div class="chronicle-main" bind:this={body}>
		{#if loading && !items.length}
			<div class="chronicle-state"><Spinner /></div>
		{:else if error && !items.length}
			<div class="chronicle-state error" role="alert">
				<span>{error}</span>
				<button class="chronicle-retry" type="button" onclick={() => void load()}>
					<Icon name="refresh" size={16} />{m.retry()}
				</button>
			</div>
		{:else if !items.length && !hasMore}
			<p class="chronicle-state">{m.chronicleEmpty()}</p>
		{:else}
			<div class="chronicle-flow">
				{#each years as group (group.year)}
					<h3 class="chronicle-year" data-chronicle-year={group.year}>
						<span class="chronicle-year-node" aria-hidden="true"></span>
						<span class="chronicle-year-num">{group.year}</span>
					</h3>
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
									class:is-highlight={event.kind === 'highlight'}
									data-event-id={event.id}
								>
									<span class="chronicle-rail" aria-hidden="true">
										<Icon name={chronicleEventIcon(event.kind)} size={14} />
									</span>
									<div class="chronicle-body">
										<time datetime={event.date}>{longDate(event.date)}</time>
										<p class="chronicle-title">
											{chronicleEventLabel(event, i18n.locale, labels)}
										</p>
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
			</div>
			{#if error}
				<div class="chronicle-state error" role="alert">
					<span>{error}</span>
					<button class="chronicle-retry" type="button" onclick={() => void load()}>
						<Icon name="refresh" size={16} />{m.retry()}
					</button>
				</div>
			{/if}
		{/if}
	</div>

	{#if scrubbable && body}
		<div class="chronicle-scrub-col">
			<ChronicleScrubber {body} years={yearKeys} />
		</div>
	{/if}
</section>

{#if opened}
	<CardDetailDialog initial={opened} actor={did} onclose={() => (opened = undefined)} />
{/if}

<style>
	.chronicle {
		padding: 16px;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		row-gap: 12px;
		column-gap: 8px;
		min-inline-size: 0;
		max-inline-size: 100%;
	}
	.chronicle.has-scrub {
		grid-template-columns: minmax(0, 1fr) 52px;
		padding-inline-end: 8px;
	}
	.chronicle-head {
		grid-column: 1 / -1;
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
	.has-scrub .chronicle-portrait {
		inset-inline-end: -8px;
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
		font-size: 24px;
		font-weight: 600;
		line-height: 1.3;
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
		margin-block-start: 4px;
		font-size: 12px;
		color: var(--text-faint);
	}
	.chronicle-main {
		grid-column: 1;
		min-inline-size: 0;
	}
	.chronicle-scrub-col {
		grid-column: 2;
		grid-row: 2;
	}

	/*
	 * 年をまたいで1本につながるレール。各項目のアイコンと年の節が地の色で線を隠し、
	 * その上に載って見える。
	 */
	.chronicle-flow {
		position: relative;
		display: grid;
		min-inline-size: 0;
	}
	.chronicle-flow::before {
		content: '';
		position: absolute;
		inset-inline-start: 13px;
		inset-block: 32px 24px;
		inline-size: 2px;
		border-radius: 1px;
		background: var(--line);
		pointer-events: none;
	}

	.chronicle-year {
		position: relative;
		display: grid;
		grid-template-columns: 28px minmax(0, 1fr);
		align-items: center;
		column-gap: 12px;
		margin: 0;
		padding-block: 24px 8px;
	}
	.chronicle-year:first-child {
		padding-block-start: 4px;
	}
	.chronicle-year-node {
		justify-self: center;
		inline-size: 12px;
		block-size: 12px;
		border: 2px solid var(--text-faint);
		border-radius: 50%;
		background: var(--surface-1);
	}
	/*
	 * 年の数字は最大の大きさで行の高さを取り、強調の演出では縮めた状態から拡大する。
	 * 基底（演出なし）が最大＝読める状態になる（CHRON-02/05）。
	 */
	.chronicle-year-num {
		display: block;
		block-size: 44px;
		font-size: 44px;
		font-weight: 600;
		line-height: 1;
		letter-spacing: -0.02em;
		font-variant-numeric: tabular-nums;
		color: var(--text-strong);
		transform-origin: left center;
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
		column-gap: 12px;
		padding-block: 8px;
	}
	.chronicle-rail {
		display: grid;
		place-items: center;
		inline-size: 28px;
		block-size: 28px;
		border: 1px solid var(--line);
		border-radius: var(--radius-pill);
		background: var(--surface-1);
		color: var(--text-muted);
	}
	/* 日記から抜いた出来事が年表の主役。そこだけアクセントで印を付ける。 */
	.is-highlight .chronicle-rail {
		border-color: transparent;
		background: var(--accent-soft);
		color: var(--accent-strong);
	}
	.chronicle-body {
		min-inline-size: 0;
		display: grid;
		gap: 4px;
	}
	.chronicle-body time {
		font-size: 13px;
		line-height: 28px;
		font-variant-numeric: tabular-nums;
		color: var(--text-faint);
	}
	.chronicle-body time + .chronicle-title {
		margin-block-start: -4px;
	}
	/* 年の数字と同じく、基底が中央での大きさ。演出では端で縮める（CHRON-02/05）。 */
	.chronicle-title {
		font-size: 22px;
		font-weight: 600;
		line-height: 1.45;
		color: var(--text-strong);
		overflow-wrap: anywhere;
		transform-origin: left center;
	}
	.chronicle-detail {
		/* .bubble のしっぽ（::before が left: -8px）が切れないよう左に逃がす。 */
		margin-inline-start: 8px;
		margin-block-start: 4px;
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
		inline-size: min(100%, 152px);
	}
	/* まとめに付く一行。軸の右側に、控えめに寄せる。 */
	.chronicle-aside {
		display: grid;
		gap: 2px;
		padding-inline-start: 40px;
		padding-block-end: 8px;
		min-inline-size: 0;
	}
	.chronicle-aside-label {
		font-size: 12px;
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
	.chronicle-state {
		display: grid;
		justify-items: center;
		gap: 8px;
		padding: 24px 0;
		color: var(--text-faint);
		font-size: 13px;
		text-align: center;
	}
	.chronicle-state.error {
		color: var(--danger);
	}
	.chronicle-retry {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 4px 12px;
		border: 1px solid var(--line);
		border-radius: var(--radius-pill);
		background: var(--surface-1);
		font-size: 12px;
		color: var(--text);
	}

	/*
	 * 画面中央に近づくほど大きく濃く（CHRON-05）。対応ブラウザだけに当て、
	 * 非対応・reduced-motion（base.css が animation: none を当てる）では基底の静的表示になる。
	 * animation の一括指定は animation-timeline を初期化するので、必ず後に書く。
	 */
	@supports (animation-timeline: view()) {
		.chronicle-year-num {
			animation: chronicle-year-focus linear both;
			animation-timeline: view();
		}
		.chronicle-title {
			animation: chronicle-title-focus linear both;
			animation-timeline: view();
		}
	}
	@keyframes chronicle-year-focus {
		0%,
		100% {
			transform: scale(0.55);
			color: var(--text-faint);
		}
		50% {
			transform: none;
			color: var(--accent-strong);
		}
	}
	@keyframes chronicle-title-focus {
		0%,
		100% {
			transform: scale(0.72);
			color: var(--text-muted);
		}
		50% {
			transform: none;
			color: var(--text-strong);
		}
	}
</style>
