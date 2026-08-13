<script lang="ts">
	import { onMount } from 'svelte';
	import { getCards } from '$lib/api/appview';
	import type { CardView, DrawCardResult } from '$lib/api/types';
	import { rarityConfettiLevel } from '$lib/cards/celebration';
	import { dateLocale, i18n, m } from '$lib/i18n/i18n.svelte';
	import AffirmationCard from './AffirmationCard.svelte';
	import CardBack from './CardBack.svelte';
	import Confetti from './Confetti.svelte';

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
		collectionHref,
		onclose,
	}: {
		/** 表示するカード。draw があるときはその結果のカード。 */
		initial: CardView;
		/** コメント生成待ちのポーリング先（= 所有者の DID）。 */
		actor: string;
		/** 引いた直後だけ渡す。無ければ所持カードを見返しているだけ（演出なし）。 */
		draw?: DrawCardResult;
		/**
		 * 渡すと「コレクションを見る」リンクを出す。図鑑の外（フィードの FAB）から
		 * 引いたときだけ使う。カードタブから開いたときは自分自身への導線になるので渡さない。
		 */
		collectionHref?: string;
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
	// 初回の実ドローだけを祝う。当日カードの冪等再取得では演出を繰り返さない。
	const isFreshDraw = $derived(!!draw && !draw.alreadyDrawn);
	const confettiLevel = $derived(isFreshDraw ? rarityConfettiLevel(card.rarity) : undefined);

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
				const fresh = collection.cards.find((c) => c.volume === card.volume && c.id === card.id);
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
{#if revealed && confettiLevel}
	<Confetti level={confettiLevel} />
{/if}
<div class="draw-backdrop" role="presentation" onclick={backdropClick}>
	<div class="draw-dialog" role="dialog" aria-modal="true" aria-labelledby="draw-title">
		<h2
			id="draw-title"
			class="draw-title"
			class:visually-hidden={!!draw?.isNew && !draw.alreadyDrawn}
		>
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
		{#if draw?.isNew && !draw.alreadyDrawn}
			<!-- フォントファイルは再配布せず、指定文言だけを描画したマスクで字形を使う。 -->
			<div class="new-card-wrap" aria-hidden="true">
				<span class="new-card-art" class:ja></span>
				<span class="new-card-shimmer" class:ja></span>
				<i class="new-card-sparkle sparkle-one"></i>
				<i class="new-card-sparkle sparkle-two"></i>
				<i class="new-card-sparkle sparkle-three"></i>
			</div>
		{/if}

		<div class="draw-stage rarity-{card.rarity.toLowerCase()}" class:revealed class:flip={!!draw}>
			<div class="draw-flip">
				<div class="draw-back" aria-hidden={revealed}>
					<CardBack />
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
			<p class="draw-next">
				{#if draw.source === 'my_nagi' && draw.drawStatus.reaction?.canDraw}
					{m.cardReactionNextHint()}
				{:else if draw.source === 'reaction' && draw.drawStatus.myNagi?.canDraw}
					{m.cardMyNagiNextHint()}
				{:else}
					{m.cardNextDrawAt({ time: formatTime(draw.drawStatus.nextDrawAt) })}
				{/if}
			</p>
		{:else if card.acquiredAt}
			<p class="draw-next">{m.cardAcquiredAt({ time: formatTime(card.acquiredAt) })}</p>
		{/if}
		<div class="draw-actions">
			<button bind:this={closeButton} type="button" class="ghost" onclick={close}>
				{m.cardClose()}
			</button>
			{#if collectionHref}
				<a class="draw-collection" href={collectionHref} onclick={close}
					>{m.cardViewCollection()} →</a
				>
			{/if}
		</div>
	</div>
</div>

<style>
	.draw-backdrop {
		position: fixed;
		inset: 0;
		inline-size: 100vw;
		block-size: 100dvh;
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
	/* 「どっとじ」で描いた完成画像をマスクにし、フォント本体をブラウザへ再配布しない。 */
	.new-card-wrap {
		position: relative;
		inline-size: min(100%, 340px);
		block-size: 48px;
		margin: -0.25rem 0 -0.15rem;
	}
	.new-card-art,
	.new-card-shimmer {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			90deg,
			#ff4f87 0%,
			#ffd166 17%,
			#55f5ba 34%,
			#45d9ff 51%,
			#8f8cff 68%,
			#ff68dc 85%,
			#ff4f87 100%
		);
		background-size: 220% 100%;
		-webkit-mask: url('/card-effects/new-card-en.png') center / contain no-repeat;
		mask: url('/card-effects/new-card-en.png') center / contain no-repeat;
	}
	.new-card-art.ja,
	.new-card-shimmer.ja {
		-webkit-mask-image: url('/card-effects/new-card-ja.png');
		mask-image: url('/card-effects/new-card-ja.png');
	}
	.new-card-art {
		filter: drop-shadow(0 0 3px rgb(95 230 255 / 0.95)) drop-shadow(0 0 8px rgb(255 79 196 / 0.82));
		animation:
			new-card-rainbow 2.5s linear infinite,
			new-card-pulse 1.4s ease-in-out infinite alternate;
	}
	.new-card-shimmer {
		background: linear-gradient(105deg, transparent 38%, white 49%, transparent 60%);
		background-size: 260% 100%;
		mix-blend-mode: screen;
		animation: new-card-shimmer 2.1s ease-in-out infinite;
	}
	.new-card-sparkle {
		position: absolute;
		inline-size: 9px;
		block-size: 9px;
		background: white;
		clip-path: polygon(50% 0, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0 50%, 39% 39%);
		filter: drop-shadow(0 0 5px #8ff7ff) drop-shadow(0 0 8px #ff72dc);
		animation: new-card-sparkle 1.8s ease-in-out infinite;
	}
	.sparkle-one {
		inset-block-start: 2px;
		inset-inline-start: 7%;
	}
	.sparkle-two {
		inset-block-start: 4px;
		inset-inline-end: 13%;
		animation-delay: -0.65s;
	}
	.sparkle-three {
		inset-block-end: 1px;
		inset-inline-start: 57%;
		animation-delay: -1.2s;
	}
	@keyframes new-card-rainbow {
		to {
			background-position: 220% 0;
		}
	}
	@keyframes new-card-pulse {
		to {
			filter: drop-shadow(0 0 5px rgb(95 230 255 / 1)) drop-shadow(0 0 13px rgb(255 79 196 / 1));
		}
	}
	@keyframes new-card-shimmer {
		0%,
		22% {
			background-position: 220% 0;
		}
		72%,
		100% {
			background-position: -120% 0;
		}
	}
	@keyframes new-card-sparkle {
		0%,
		100% {
			opacity: 0.25;
			transform: scale(0.45) rotate(0deg);
		}
		48% {
			opacity: 1;
			transform: scale(1.2) rotate(90deg);
		}
	}
	.draw-actions {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		gap: 0.6rem 1rem;
	}
	.draw-collection {
		color: var(--accent-strong);
		font-size: 0.85rem;
		font-weight: 700;
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
	/* 枠線・地色・botたんは CardBack 側。ここは角丸だけ渡す（CardBack が inherit する）。 */
	.draw-back {
		border-radius: var(--radius-s);
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
		.new-card-art,
		.new-card-shimmer,
		.new-card-sparkle {
			animation: none;
		}
		.draw-stage.flip .draw-flip {
			transition: none;
		}
		.draw-stage.revealed {
			animation: none;
		}
	}
</style>
