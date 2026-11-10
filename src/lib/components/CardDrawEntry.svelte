<script lang="ts">
	import { dev } from '$app/environment';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { drawCard } from '$lib/api/appview';
	import type { CardView, DrawCardResult } from '$lib/api/types';
	import { anniversaryCardReward } from '$lib/cards/anniversary-reward.svelte';
	import { reachedCardMilestone } from '$lib/cards/celebration';
	import { cardCollections } from '$lib/cards/collection.svelte';
	import { guestCardDraw } from '$lib/cards/guest-draw.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import { oauthReady, session } from '$lib/oauth/session.svelte';
	import { startVisiblePolling } from '$lib/polling';
	import CardDrawBanner from './CardDrawBanner.svelte';
	import CardDetailDialog from './CardDetailDialog.svelte';
	import CardDrawFab from './CardDrawFab.svelte';
	import CardMilestoneDialog from './CardMilestoneDialog.svelte';
	import CardReactionGuideDialog from './CardReactionGuideDialog.svelte';

	let {
		variant = 'banner',
		shifted = false,
	}: {
		/** banner: /cards のタブの上に置く帯。fab: 画面右下の浮きボタン（開発用に残している）。 */
		variant?: 'banner' | 'fab';
		shifted?: boolean;
	} = $props();

	let drawing = $state(false);
	let drawError = $state('');
	let drawResult = $state<DrawCardResult>();
	let openedCard = $state<CardView>();
	let pendingMilestone = $state<number>();
	let guideOpen = $state(false);
	let myDid = $derived($session?.did);
	const forceFab = $derived(
		dev &&
			[...page.url.searchParams].some(
				([key, value]) => key.toLowerCase() === 'cardfab' && value === '1',
			),
	);
	/*
	 * 記念日の受け取りは AnniversaryCardHost が自動で開くのが主導線で、こちらは保険。
	 * うっかり閉じた・自動で開けなかったときに、その日のうちなら取りに戻れるようにしておく
	 * （記念日は1日しか来ないので、逃したときのやり直しが効かないのが一番まずい）。
	 */
	let anniversaryPending = $derived(Boolean(myDid && cardCollections.pendingAnniversary.length));
	let showFab = $derived(
		variant === 'fab' &&
			!openedCard &&
			(Boolean(myDid && (cardCollections.canDrawMyNagi || cardCollections.canDrawWithReaction)) ||
				forceFab ||
				drawing ||
				Boolean(drawError)),
	);
	let showBanner = $derived(
		variant === 'banner' &&
			$oauthReady &&
			(forceFab ||
				(!myDid && guestCardDraw.canDrawToday) ||
				anniversaryPending ||
				cardCollections.canDrawMyNagi ||
				cardCollections.canDrawWithReaction),
	);
	let reactionNext = $derived(
		Boolean(myDid && !cardCollections.canDrawMyNagi && cardCollections.canDrawWithReaction),
	);

	$effect(() => {
		if (myDid) void cardCollections.ensure(myDid);
	});

	onMount(() => {
		guestCardDraw.hydrate();
		return startVisiblePolling(
			() => {
				guestCardDraw.refreshDay();
				cardCollections.refreshSelfIfStale();
			},
			5 * 60_000,
			{ onReturn: true },
		);
	});

	async function openTodayCard() {
		const did = myDid;
		if (!did) {
			if (drawing) return;
			drawing = true;
			drawError = '';
			try {
				const result = await guestCardDraw.draw();
				drawResult = result;
				openedCard = result.card;
			} catch (error) {
				drawError = error instanceof Error ? error.message : m.cardDrawFailed();
			} finally {
				drawing = false;
			}
			return;
		}
		// 記念日があるときは抽選より先に受け取らせる。開いたモーダルは Host が出す。
		if (anniversaryPending) {
			void anniversaryCardReward.claim(
				did,
				cardCollections.pendingAnniversary
					.map((a) => a.slot)
					.sort((a, b) => a - b)
					.join(','),
			);
			return;
		}
		if (reactionNext) {
			guideOpen = true;
			return;
		}
		if (drawing) return;
		drawing = true;
		drawError = '';
		try {
			// drawCard は抽選済みの日には同じカードを返すので、「見る」入口にも共用できる。
			const result = await drawCard({ source: 'my_nagi' });
			const current = cardCollections.view(did);
			pendingMilestone = reachedCardMilestone(current?.ownedCount, current?.totalCount, result);
			cardCollections.applyDraw(did, result);
			drawResult = result;
			openedCard = result.card;
		} catch (error) {
			drawError = error instanceof Error ? error.message : m.cardDrawFailed();
		} finally {
			drawing = false;
		}
	}

	function closeDraw(final: CardView) {
		openedCard = undefined;
		drawResult = undefined;
		if (myDid) cardCollections.applyCard(myDid, final);
	}
</script>

{#if showBanner}
	<CardDrawBanner
		{drawing}
		{anniversaryPending}
		{reactionNext}
		error={drawError}
		ondraw={openTodayCard}
	/>
{:else if showFab}
	<CardDrawFab
		{drawing}
		error={drawError}
		{shifted}
		ondraw={openTodayCard}
		ondismisserror={() => (drawError = '')}
		label={reactionNext ? m.cardReactionNextLabel() : undefined}
		hint={reactionNext ? m.cardReactionGuideBody() : undefined}
	/>
{/if}

{#if guideOpen}
	<CardReactionGuideDialog onclose={() => (guideOpen = false)} />
{/if}

{#if openedCard}
	<CardDetailDialog
		initial={openedCard}
		actor={myDid}
		draw={drawResult}
		revealUnowned={!myDid}
		collectionHref={myDid && !pendingMilestone ? `/profile/${myDid}?tab=cards` : undefined}
		onclose={closeDraw}
	/>
{:else if pendingMilestone}
	<CardMilestoneDialog
		percent={pendingMilestone}
		collectionHref={myDid ? `/profile/${myDid}?tab=cards` : undefined}
		onclose={() => (pendingMilestone = undefined)}
	/>
{/if}
