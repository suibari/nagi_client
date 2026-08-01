<script lang="ts">
	import { dev } from '$app/environment';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { drawCard } from '$lib/api/appview';
	import type { CardView, DrawCardResult } from '$lib/api/types';
	import { cardCollections } from '$lib/cards/collection.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import { oauthReady, session } from '$lib/oauth/session.svelte';
	import { startVisiblePolling } from '$lib/polling';
	import CardBack from './CardBack.svelte';
	import CardDetailDialog from './CardDetailDialog.svelte';
	import CardDrawFab from './CardDrawFab.svelte';

	let {
		variant = 'header',
		shifted = false,
	}: {
		variant?: 'header' | 'fab';
		shifted?: boolean;
	} = $props();

	let drawing = $state(false);
	let drawError = $state('');
	let drawResult = $state<DrawCardResult>();
	let openedCard = $state<CardView>();
	let myDid = $derived($session?.did);
	const forceFab = $derived(
		dev &&
			[...page.url.searchParams].some(
				([key, value]) => key.toLowerCase() === 'cardfab' && value === '1',
			),
	);
	let showFab = $derived(
		variant === 'fab' &&
			!openedCard &&
			(Boolean(myDid && cardCollections.canDrawToday) || forceFab || drawing || Boolean(drawError)),
	);
	let showHeader = $derived(
		variant === 'header' && $oauthReady && (forceFab || !myDid || cardCollections.canDrawToday),
	);

	$effect(() => {
		if (myDid) void cardCollections.ensure(myDid);
	});

	onMount(() =>
		startVisiblePolling(() => cardCollections.refreshSelfIfStale(), 5 * 60_000, {
			onReturn: true,
		}),
	);

	async function openTodayCard() {
		const did = myDid;
		if (!did) {
			location.href = '/login';
			return;
		}
		if (drawing) return;
		drawing = true;
		drawError = '';
		try {
			// drawCard は抽選済みの日には同じカードを返すので、「見る」入口にも共用できる。
			const result = await drawCard();
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

{#if showHeader}
	<div class="card-header-entry">
		<button
			type="button"
			class="card-header-button"
			disabled={drawing}
			aria-busy={drawing}
			onclick={openTodayCard}
		>
			<span class="card-header-card" aria-hidden="true">
				<span class="card-header-card-face"><CardBack mark="52%" frame={false} /></span>
			</span>
			<span>{drawing ? m.cardDrawing() : m.cardHeaderLabel()}</span>
		</button>
		{#if drawError}<p class="card-header-error" role="alert">{drawError}</p>{/if}
	</div>
{:else if showFab}
	<CardDrawFab
		{drawing}
		error={drawError}
		{shifted}
		ondraw={openTodayCard}
		ondismisserror={() => (drawError = '')}
	/>
{/if}

{#if openedCard && myDid}
	<CardDetailDialog
		initial={openedCard}
		actor={myDid}
		draw={drawResult}
		collectionHref={`/profile/${myDid}?tab=cards`}
		onclose={closeDraw}
	/>
{/if}

<style>
	.card-header-entry {
		position: relative;
		flex: 0 0 auto;
	}

	.card-header-button {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		min-height: 48px;
		padding: 2px 5px;
		border: 0;
		border-radius: var(--radius-m);
		background: transparent;
		color: var(--accent-strong);
		font: inherit;
		font-size: 13px;
		font-weight: 800;
		cursor: pointer;
		transition:
			color 0.14s ease,
			transform 0.14s ease;
	}

	.card-header-button:hover,
	.card-header-button:focus-visible {
		color: var(--text-strong);
		transform: translateY(-1px);
	}

	.card-header-button:focus-visible {
		outline: 2px solid var(--focus-ring);
		outline-offset: 2px;
	}

	.card-header-button:disabled {
		opacity: 0.7;
		cursor: progress;
	}

	.card-header-card {
		display: block;
		flex: 0 0 auto;
		inline-size: 25px;
		aspect-ratio: 59 / 86;
		perspective: 120px;
		transform: rotate(-9deg);
	}

	.card-header-card-face {
		position: relative;
		display: block;
		inline-size: 100%;
		block-size: 100%;
		aspect-ratio: 59 / 86;
		overflow: hidden;
		border-radius: 4px;
		box-shadow: 0 3px 8px color-mix(in srgb, var(--text) 26%, transparent);
		--card-back-border: 1px;
		transform-style: preserve-3d;
		animation: card-header-flip 3.8s ease-in-out infinite;
	}

	/* 読み始めを邪魔しないよう長く静止し、周期の終わりだけ1回転して存在を知らせる。 */
	@keyframes card-header-flip {
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
		.card-header-button {
			transition: none;
		}
		.card-header-card-face {
			animation: none;
		}
	}

	.card-header-error {
		position: absolute;
		top: calc(100% + 5px);
		right: 0;
		z-index: 2;
		width: max-content;
		max-width: min(260px, calc(100vw - 32px));
		margin: 0;
		padding: 7px 10px;
		border: 1px solid var(--line-strong);
		border-radius: var(--radius-m);
		background: var(--bg-raised);
		box-shadow: var(--shadow-card);
		color: var(--danger);
		font-size: 12px;
	}
</style>
