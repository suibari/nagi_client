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
	import CardBack from './CardBack.svelte';
	import CardDetailDialog from './CardDetailDialog.svelte';
	import CardDrawFab from './CardDrawFab.svelte';
	import CardMilestoneDialog from './CardMilestoneDialog.svelte';
	import CardReactionGuideDialog from './CardReactionGuideDialog.svelte';
	import Icon from './shell/Icon.svelte';

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
	<div class="card-banner">
		<button
			type="button"
			class="card-banner-button"
			disabled={drawing}
			aria-busy={drawing}
			onclick={openTodayCard}
		>
			<span class="card-banner-card" aria-hidden="true">
				<span class="card-banner-card-face"><CardBack mark="52%" frame={false} /></span>
			</span>
			<span class="card-banner-label">
				{#if drawing}
					{m.cardDrawing()}
				{:else if anniversaryPending}
					{m.cardAnniversaryEntryLabel()}
				{:else if reactionNext}
					<span class="card-banner-lead">{m.cardReactionNextLead()}</span>
					{m.cardReactionNextText()}
				{:else}
					{m.cardBannerLabel()}
				{/if}
			</span>
			<span class="card-banner-chevron" aria-hidden="true"><Icon name="chevron" size={18} /></span>
		</button>
		{#if drawError}<p class="card-banner-error" role="alert">{drawError}</p>{/if}
	</div>
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

<style>
	/* /cards のタブの上に置く帯。ゲームの手順とは別の「今日の一回」なので、タブより上に独立させる。 */
	.card-banner {
		padding: 12px 16px 4px;
	}

	.card-banner-button {
		display: flex;
		align-items: center;
		gap: 12px;
		inline-size: 100%;
		min-block-size: 56px;
		padding: 8px 12px 8px 16px;
		border: 1px solid var(--line);
		border-radius: 12px;
		background: var(--bg-raised);
		color: var(--text);
		font: inherit;
		font-size: 0.9rem;
		font-weight: 700;
		text-align: start;
		cursor: pointer;
		transition:
			background-color 0.14s ease,
			border-color 0.14s ease;
	}

	.card-banner-button:hover {
		border-color: var(--line-strong);
	}

	.card-banner-button:focus-visible {
		outline: 2px solid var(--focus-ring);
		outline-offset: 2px;
	}

	.card-banner-button:disabled {
		opacity: 0.7;
		cursor: progress;
	}

	.card-banner-card {
		display: block;
		flex: 0 0 auto;
		inline-size: 24px;
		aspect-ratio: 59 / 86;
		perspective: 120px;
		transform: rotate(-8deg);
	}

	.card-banner-card-face {
		position: relative;
		display: block;
		inline-size: 100%;
		block-size: 100%;
		overflow: hidden;
		border-radius: 4px;
		box-shadow: 0 2px 6px color-mix(in srgb, var(--text) 20%, transparent);
		--card-back-border: 1px;
		transform-style: preserve-3d;
		animation: card-banner-flip 3.8s ease-in-out infinite;
	}

	.card-banner-label {
		flex: 1 1 auto;
		min-inline-size: 0;
		overflow-wrap: anywhere;
	}

	.card-banner-lead {
		margin-inline-end: 4px;
		color: var(--accent-strong);
	}

	.card-banner-chevron {
		display: inline-flex;
		flex: 0 0 auto;
		color: var(--text-faint);
	}

	/* 読み始めを邪魔しないよう長く静止し、周期の終わりだけ1回転して存在を知らせる。 */
	@keyframes card-banner-flip {
		0%,
		68% {
			transform: rotateY(0deg);
		}
		92%,
		100% {
			transform: rotateY(360deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.card-banner-button {
			transition: none;
		}
		.card-banner-card-face {
			animation: none;
		}
	}

	.card-banner-error {
		margin: 8px 0 0;
		color: var(--danger);
		font-size: 12px;
	}
</style>
