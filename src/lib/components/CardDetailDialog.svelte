<script lang="ts">
	import { onMount } from 'svelte';
	import { getCards } from '$lib/api/appview';
	import type { CardView, DrawCardResult } from '$lib/api/types';
	import { dateLocale, i18n, m } from '$lib/i18n/i18n.svelte';
	import AffirmationCard from './AffirmationCard.svelte';

	/** 時刻表示。日付境界は JST 4:00 だが、表示は閲覧者のローカル時刻に合わせる。 */
	function formatTime(iso: string): string {
		const date = new Date(iso);
		if (Number.isNaN(date.getTime())) return '';
		return date.toLocaleString(dateLocale(), {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	}

	let {
		initial,
		actor,
		draw,
		onclose,
	}: {
		/** 表示するカード。draw があるときはその結果のカード。 */
		initial: CardView;
		/** コメント生成待ちのポーリング先（= 所有者の DID）。 */
		actor: string;
		/** 引いた直後だけ渡す。無ければ所持カードを見返しているだけ（演出なし）。 */
		draw?: DrawCardResult;
		onclose: (final: CardView) => void;
	} = $props();

	// 引いた直後は裏 → 表のフリップを見せる。見返しのときは最初から表。
	// svelte-ignore state_referenced_locally
	let revealed = $state(!draw);
	// 表示中のカード。コメントが届いたら差し替える編集可能なコピー。
	// svelte-ignore state_referenced_locally
	let card = $state<CardView>(initial);
	// 待っても届かなかった状態。「…」のまま放置せず、その旨を出す。
	let commentTimedOut = $state(false);
	let closeButton: HTMLButtonElement;

	const ja = $derived(i18n.locale === 'ja');
	const name = $derived(ja ? card.nameJa : card.nameEn);
	const comment = $derived(ja ? card.commentJa : card.commentEn);
	// ja/en どちらかが埋まればコメントは届いたとみなす（片方だけ生成される事故に強くする）。
	const hasComment = $derived(!!(card.commentJa || card.commentEn));

	onMount(() => {
		closeButton?.focus();
		const flip = revealed ? undefined : setTimeout(() => (revealed = true), 120);

		// botたんコメントは bot_server が非同期で書き込むので、届くまで getCards で取り直す。
		// 引いた直後だけでなく「コメントがまだ無い所持カードを開いたとき」も拾いに行くので、
		// 演出中に間に合わなくても、あとから開き直せば読める。
		if (hasComment || !card.owned) return () => clearTimeout(flip);

		let stopped = false;
		let timer: ReturnType<typeof setTimeout>;
		// Gemini の生成待ちなので、演出の尺より十分長く待つ。
		const deadline = Date.now() + 60_000;
		const poll = async () => {
			if (stopped) return;
			if (Date.now() > deadline) {
				commentTimedOut = true;
				return;
			}
			try {
				const collection = await getCards(actor);
				const fresh = collection.cards.find(
					(c) => c.volume === card.volume && c.id === card.id,
				);
				if (fresh?.commentJa || fresh?.commentEn) {
					card = fresh;
					return;
				}
			} catch {
				// 一時的な失敗は無視して次のポーリングに任せる。
			}
			if (!stopped) timer = setTimeout(poll, 2_000);
		};
		timer = setTimeout(poll, 1_500);
		return () => {
			stopped = true;
			clearTimeout(flip);
			clearTimeout(timer);
		};
	});

	function close() {
		onclose(card);
	}
	function keydown(event: KeyboardEvent) {
		if (event.key === 'Escape') close();
	}
	function backdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) close();
	}
</script>

<svelte:window onkeydown={keydown} />
<div class="draw-backdrop" role="presentation" onclick={backdropClick}>
	<div class="draw-dialog" role="dialog" aria-modal="true" aria-labelledby="draw-title">
		<h2 id="draw-title" class="draw-title">
			{#if !draw}
				{name}
			{:else if draw.alreadyDrawn}
				{m.cardDrawAlreadyTitle()}
			{:else if draw.isNew}
				{m.cardDrawNewTitle()}
			{:else}
				{m.cardDrawAgainTitle()}
			{/if}
		</h2>

		<div class="draw-stage rarity-{card.rarity.toLowerCase()}" class:revealed class:flip={!!draw}>
			<div class="draw-flip">
				<div class="draw-back" aria-hidden={revealed}>
					<span>?</span>
				</div>
				<div class="draw-front" aria-hidden={!revealed}>
					<AffirmationCard {card} size="full" />
				</div>
			</div>
		</div>

		<!-- botたんのひとこと。カードのフレーバーとは別に、引いたその人へ向けた言葉。 -->
		<div class="draw-comment" aria-live="polite">
			{#if hasComment}
				<p class="draw-bubble">{comment}</p>
			{:else if commentTimedOut}
				<p class="draw-bubble muted">{m.cardCommentNotReady()}</p>
			{:else if card.owned}
				<p class="draw-bubble thinking">
					<span class="typing" aria-hidden="true"><i></i><i></i><i></i></span>
					<span class="visually-hidden">{m.cardCommentThinking()}</span>
				</p>
			{/if}
		</div>

		{#if draw}
			<p class="draw-next">{m.cardNextDrawAt({ time: formatTime(draw.drawStatus.nextDrawAt) })}</p>
		{:else if card.acquiredAt}
			<p class="draw-next">{m.cardAcquiredAt({ time: formatTime(card.acquiredAt) })}</p>
		{/if}
		<button bind:this={closeButton} type="button" class="ghost" onclick={close}>
			{m.cardClose()}
		</button>
	</div>
</div>

<style>
	.draw-backdrop {
		position: fixed;
		inset: 0;
		z-index: 120;
		display: grid;
		place-items: center;
		padding: 20px;
		background: rgb(0 0 0 / 0.62);
	}
	.draw-dialog {
		display: grid;
		justify-items: center;
		gap: 0.9rem;
		inline-size: min(100%, 380px);
		max-block-size: 90dvh;
		overflow-y: auto;
		padding: 1.4rem 1.2rem 1.2rem;
		border-radius: var(--radius-l);
		background: var(--bg-raised);
		box-shadow: var(--shadow-pop);
		text-align: center;
	}
	.draw-title {
		margin: 0;
		font-size: 1.05rem;
	}

	/* --- 裏 → 表のフリップ（引いた直後だけ） --- */
	.draw-stage {
		perspective: 1200px;
		inline-size: min(100%, 300px);
	}
	.draw-flip {
		position: relative;
		aspect-ratio: 59 / 86;
		transform-style: preserve-3d;
	}
	.draw-stage.flip .draw-flip {
		transition: transform 0.65s cubic-bezier(0.2, 0.8, 0.25, 1);
	}
	.draw-stage.revealed .draw-flip {
		transform: rotateY(180deg);
	}
	.draw-back,
	.draw-front {
		position: absolute;
		inset: 0;
		backface-visibility: hidden;
	}
	.draw-back {
		display: grid;
		place-items: center;
		border: 2px solid var(--accent-border);
		border-radius: var(--radius-s);
		background: var(--brand-gradient);
		color: var(--text-on-accent);
		font-size: 3rem;
		font-weight: 700;
	}
	.draw-front {
		display: grid;
		place-items: center;
		transform: rotateY(180deg);
	}
	/* レアリティが高いほど、表になった瞬間の光を強くする。見返しでは光らせない。 */
	.draw-stage.flip.rarity-sr.revealed,
	.draw-stage.flip.rarity-ur.revealed,
	.draw-stage.flip.rarity-aar.revealed {
		animation: draw-flash 0.9s ease-out;
	}
	.draw-stage.rarity-sr.revealed {
		--flash: var(--card-rarity-sr);
	}
	.draw-stage.rarity-ur.revealed {
		--flash: var(--card-rarity-ur);
	}
	.draw-stage.rarity-aar.revealed {
		--flash: var(--card-rarity-aar);
	}
	@keyframes draw-flash {
		0% {
			filter: drop-shadow(0 0 0 var(--flash));
		}
		35% {
			filter: drop-shadow(0 0 28px var(--flash));
		}
		100% {
			filter: drop-shadow(0 0 0 var(--flash));
		}
	}

	/* --- botたんの吹き出し --- */
	.draw-comment {
		min-block-size: 2.6rem;
		display: grid;
		place-items: center;
		inline-size: 100%;
	}
	.draw-bubble {
		position: relative;
		margin: 0;
		padding: 0.6rem 0.85rem;
		border: 1px solid var(--bubble-bot-border);
		border-radius: var(--radius-m);
		background: var(--bubble-bot-bg);
		font-size: 0.9rem;
		line-height: 1.5;
		text-align: start;
	}
	/* 吹き出しの尻尾（カード側＝上を向く）。 */
	.draw-bubble::before {
		content: '';
		position: absolute;
		inset-block-start: -7px;
		inset-inline-start: 1.2rem;
		inline-size: 12px;
		block-size: 12px;
		border-inline-start: 1px solid var(--bubble-bot-border);
		border-block-start: 1px solid var(--bubble-bot-border);
		background: var(--bubble-bot-bg);
		transform: rotate(45deg);
	}
	.draw-bubble.thinking {
		display: grid;
		place-items: center;
		min-inline-size: 4.5rem;
	}
	.draw-bubble.muted {
		color: var(--text-muted);
		font-size: 0.8rem;
	}
	.visually-hidden {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	.draw-next {
		margin: 0;
		color: var(--text-muted);
		font-size: 0.8rem;
	}

	@media (prefers-reduced-motion: reduce) {
		.draw-stage.flip .draw-flip {
			transition: none;
		}
		.draw-stage.revealed {
			animation: none;
		}
	}
</style>
