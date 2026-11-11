<script lang="ts">
	import type { AdventCalendarView } from '$lib/api/types';
	import { ADVENT_DAYS, unopenedOwnDays, type AdventLocale } from '$lib/advent/advent';
	import { dateLocale, i18n, m } from '$lib/i18n/i18n.svelte';
	import AdventCardDialog from './AdventCardDialog.svelte';
	import AdventLetter from './AdventLetter.svelte';
	import AdventTree from './AdventTree.svelte';

	/**
	 * アドカレの本体。データの取り方（本番の AppView / 開発用のモック）から切り離してある。
	 *
	 * openedDays が null のあいだは、開封演出を出すかどうかを決めない（既読の読み込み待ち）。
	 */
	let {
		calendar,
		viewerDid,
		openedDays,
		initialDay,
		onopened,
		ondaychange,
	}: {
		calendar: AdventCalendarView;
		viewerDid?: string;
		openedDays: readonly number[] | null;
		/** `?day=N` で開いたときのカード。 */
		initialDay?: number;
		/** 開封演出を見終えた（または飛ばした）自分のカードの日。 */
		onopened?: (days: number[]) => void;
		/** 拡大表示の日が変わった（URL の ?day= を合わせる）。 */
		ondaychange?: (day: number | undefined) => void;
	} = $props();

	const locale = $derived<AdventLocale>(i18n.locale === 'ja' ? 'ja' : 'en');
	const byDay = $derived(new Map(calendar.cards.map((card) => [card.day, card])));

	// svelte-ignore state_referenced_locally
	let selectedDay = $state<number | undefined>(initialDay);
	let letterDay = $state<number | undefined>();
	let arrivedFromLetter = $state(false);
	let letterDecided = false;

	$effect(() => {
		if (letterDecided || openedDays === null) return;
		letterDecided = true;
		const pending = unopenedOwnDays(calendar.cards, viewerDid, openedDays);
		if (!pending.length) return;
		// 何枚も溜まっていたら、いちばん新しい1枚だけ手紙で開ける（毎回開け続けさせない）。
		letterDay = pending[pending.length - 1];
		selectedDay = undefined;
	});

	const selected = $derived(selectedDay ? byDay.get(selectedDay) : undefined);
	const letterCard = $derived(letterDay ? byDay.get(letterDay) : undefined);

	function select(day: number) {
		arrivedFromLetter = false;
		selectedDay = day;
		ondaychange?.(day);
	}
	function closeCard() {
		selectedDay = undefined;
		ondaychange?.(undefined);
	}
	function letterFinished() {
		const day = letterDay;
		letterDay = undefined;
		if (!day) return;
		onopened?.(unopenedOwnDays(calendar.cards, viewerDid, openedDays ?? []));
		arrivedFromLetter = true;
		selectedDay = day;
		ondaychange?.(day);
	}

	const nextOpen = $derived(
		calendar.nextOpenAt
			? new Date(calendar.nextOpenAt).toLocaleString(dateLocale(), {
					month: 'long',
					day: 'numeric',
					hour: '2-digit',
					minute: '2-digit',
				})
			: undefined,
	);
</script>

<section class="advent-scene">
	<div class="sky" aria-hidden="true"></div>
	<p class="status">
		{#if calendar.openedDay === 0}
			{m.adventBeforeStart()}
		{:else if calendar.openedDay < ADVENT_DAYS && nextOpen}
			{m.adventNextOpen({ when: nextOpen })}
		{:else}
			{m.adventComplete()}
		{/if}
	</p>
	<div class="tree-wrap">
		<AdventTree
			cards={calendar.cards}
			openedDay={calendar.openedDay}
			{viewerDid}
			onselect={select}
		/>
	</div>
</section>

{#if letterCard}
	<AdventLetter card={letterCard} {locale} onfinish={letterFinished} />
{:else if selected}
	<AdventCardDialog card={selected} arrived={arrivedFromLetter} onclose={closeCard} />
{/if}

<style>
	.advent-scene {
		position: relative;
		overflow: hidden;
		display: grid;
		justify-items: center;
		gap: 8px;
		padding: 20px 16px 28px;
		border-radius: var(--radius-l);
		background: linear-gradient(180deg, var(--advent-night-deep), var(--advent-night) 70%);
		color: var(--advent-cream);
		isolation: isolate;
	}
	.sky {
		position: absolute;
		inset: 0;
		z-index: -1;
		background-image:
			radial-gradient(circle at 12% 18%, var(--advent-snow) 1px, transparent 1.6px),
			radial-gradient(circle at 64% 9%, var(--advent-snow) 1.2px, transparent 1.8px),
			radial-gradient(circle at 38% 44%, var(--advent-snow) 0.8px, transparent 1.4px),
			radial-gradient(circle at 86% 36%, var(--advent-snow) 1px, transparent 1.6px);
		background-size: 120px 120px;
		opacity: 0.45;
	}
	.status {
		margin: 0;
		font-size: 0.95rem;
		color: var(--advent-gold-soft);
		text-align: center;
	}
	.tree-wrap {
		inline-size: min(100%, 560px);
	}
</style>
