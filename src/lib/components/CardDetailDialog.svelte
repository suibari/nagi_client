<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { getCards } from '$lib/api/appview';
	import type { CardView, DrawCardResult } from '$lib/api/types';
	import { cardRevealEffect, rarityConfettiLevel } from '$lib/cards/celebration';
	import { dateLocale, i18n, m } from '$lib/i18n/i18n.svelte';
	import AffirmationCard from './AffirmationCard.svelte';
	import CardBack from './CardBack.svelte';
	import CardDrawEffects from './CardDrawEffects.svelte';
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
		revealUnowned = false,
		collectionHref,
		onclose,
	}: {
		/** 表示するカード。draw があるときはその結果のカード。 */
		initial: CardView;
		/** コメント生成待ちのポーリング先（= 所有者の DID）。 */
		actor?: string;
		/** 引いた直後だけ渡す。無ければ所持カードを見返しているだけ（演出なし）。 */
		draw?: DrawCardResult;
		/** ゲスト抽選など、まだ所持化されていない当選カードの表面を見せる。 */
		revealUnowned?: boolean;
		/**
		 * 渡すと「コレクションを見る」リンクを出す。図鑑の外（フィードの FAB）から
		 * 引いたときだけ使う。カードタブから開いたときは自分自身への導線になるので渡さない。
		 */
		collectionHref?: string;
		onclose: (final: CardView) => void;
	} = $props();

	// ダイアログ表示中に draw が差し替わることはなく、別結果は親の key で再マウントされる。
	// svelte-ignore state_referenced_locally
	const shouldAnimate = !!draw && !draw.alreadyDrawn;
	// 初回ドローはタメてから裏 → 表。見返し・当日分の再表示は最初から表。
	// svelte-ignore state_referenced_locally
	let revealed = $state(!shouldAnimate);
	let skipped = $state(false);
	// 表示中のカード。コメントが届いたら差し替える編集可能なコピー。
	// svelte-ignore state_referenced_locally
	let card = $state<CardView>(initial);
	// 待っても届かなかった状態。「…」のまま放置せず、その旨を出す。
	let commentTimedOut = $state(false);
	let closeButton = $state<HTMLButtonElement>();
	let skipButton = $state<HTMLButtonElement>();
	let revealTimer: ReturnType<typeof setTimeout> | undefined;

	const ja = $derived(i18n.locale === 'ja');
	const name = $derived(ja ? card.nameJa : card.nameEn);
	const comment = $derived(ja ? card.commentJa : card.commentEn);
	// ja/en どちらかが埋まればコメントは届いたとみなす（片方だけ生成される事故に強くする）。
	const hasComment = $derived(!!(card.commentJa || card.commentEn));
	// 初回の実ドローだけを祝う。当日カードの冪等再取得では演出を繰り返さない。
	const isFreshDraw = $derived(!!draw && !draw.alreadyDrawn);
	const confettiLevel = $derived(isFreshDraw ? rarityConfettiLevel(card.rarity) : undefined);
	const revealEffect = $derived(cardRevealEffect(card.rarity));
	/*
	 * 「NEW CARD」の演出は図鑑を1枠埋めたことのお祝い。記念日カードは図鑑の外にあり、
	 * 見出しも「記念日おめでとう」のほうが伝えたいことなので、こちらは出さずに見出しを見せる。
	 */
	const showNewCardArt = $derived(
		revealed && !!draw?.isNew && !draw.alreadyDrawn && draw.source !== 'anniversary',
	);

	onMount(() => {
		(skipButton ?? closeButton)?.focus();
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (shouldAnimate && !reduceMotion) {
			revealTimer = setTimeout(finishReveal, revealEffect.chargeMs);
			const touchDevice =
				navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches;
			if (touchDevice && typeof navigator.vibrate === 'function') {
				navigator.vibrate(revealEffect.vibration);
			}
		} else if (shouldAnimate) {
			finishReveal();
		}

		// botたんコメントは bot_server が非同期で書き込むので、届くまで getCards で取り直す。
		// 引いた直後だけでなく「コメントがまだ無い所持カードを開いたとき」も拾いに行くので、
		// 演出中に間に合わなくても、あとから開き直せば読める。
		let stopped = false;
		let timer: ReturnType<typeof setTimeout>;
		// Gemini の生成待ちなので、演出の尺より十分長く待つ。
		const deadline = Date.now() + 60_000;
		const poll = async (pollActor: string) => {
			if (stopped) return;
			if (Date.now() > deadline) {
				commentTimedOut = true;
				return;
			}
			try {
				const collection = await getCards(pollActor);
				const fresh = collection.cards.find((c) => c.volume === card.volume && c.id === card.id);
				if (fresh?.commentJa || fresh?.commentEn) {
					card = fresh;
					return;
				}
			} catch {
				// 一時的な失敗は無視して次のポーリングに任せる。
			}
			if (!stopped) timer = setTimeout(() => poll(pollActor), 2_000);
		};
		if (!hasComment && card.owned && actor) timer = setTimeout(() => poll(actor), 1_500);
		return () => {
			stopped = true;
			clearTimeout(revealTimer);
			clearTimeout(timer);
			if (typeof navigator.vibrate === 'function') navigator.vibrate(0);
		};
	});

	function finishReveal() {
		clearTimeout(revealTimer);
		revealTimer = undefined;
		if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
			navigator.vibrate(0);
		}
		revealed = true;
		void tick().then(() => closeButton?.focus());
	}

	function skipReveal() {
		skipped = true;
		finishReveal();
	}

	function close() {
		if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
			navigator.vibrate(0);
		}
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
{#if revealed && confettiLevel && !skipped}
	<Confetti level={confettiLevel} />
{/if}
<div class="draw-backdrop" role="presentation" onclick={backdropClick}>
	<CardDrawEffects rarity={card.rarity} {revealed} active={shouldAnimate && !skipped} />
	<div class="draw-dialog" role="dialog" aria-modal="true" aria-labelledby="draw-title">
		{#if shouldAnimate && !revealed}
			<button bind:this={skipButton} type="button" class="draw-skip ghost" onclick={skipReveal}>
				{m.cardDrawSkip()}
			</button>
		{/if}
		<h2 id="draw-title" class="draw-title" class:visually-hidden={showNewCardArt}>
			{#if shouldAnimate && !revealed}
				{m.cardDrawing()}
			{:else if !draw}
				{name}
			{:else if draw.source === 'anniversary'}
				{m.cardAnniversaryTitle()}
			{:else if draw.alreadyDrawn}
				{m.cardDrawAlreadyTitle()}
			{:else if draw.isNew}
				{m.cardDrawNewTitle()}
			{:else}
				{m.cardDrawAgainTitle()}
			{/if}
		</h2>
		{#if showNewCardArt}
			<!-- フォントファイルは再配布せず、指定文言だけを描画したマスクで字形を使う。 -->
			<div class="new-card-wrap" aria-hidden="true">
				<span class="new-card-art" class:ja></span>
				<span class="new-card-shimmer" class:ja></span>
				<i class="new-card-sparkle sparkle-one"></i>
				<i class="new-card-sparkle sparkle-two"></i>
				<i class="new-card-sparkle sparkle-three"></i>
			</div>
		{/if}

		<div class="draw-effect-shell">
			<div
				class="draw-stage rarity-{card.rarity.toLowerCase()}"
				class:revealed
				class:flip={shouldAnimate}
				class:charging={shouldAnimate && !revealed && !skipped}
				style={`--mid-delay: ${Math.floor(revealEffect.chargeMs * 0.34)}ms; --hard-delay: ${Math.floor(revealEffect.chargeMs * 0.67)}ms`}
			>
				<div class="draw-shake">
					<div class="draw-flip">
						<div class="draw-back" aria-hidden={revealed}>
							<CardBack />
						</div>
						<div class="draw-front" aria-hidden={!revealed}>
							<AffirmationCard {card} size="full" {revealUnowned} />
						</div>
					</div>
				</div>
			</div>
		</div>

		{#if revealed}
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

			<!-- 記念日は抽選枠を消費しないので「次に引ける時刻」を出さない。 -->
			{#if draw && draw.source === 'anniversary'}
				<p class="draw-next">{m.cardAnniversaryHint()}</p>
			{:else if draw}
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
		{/if}
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
		position: relative;
		z-index: 1;
		display: grid;
		justify-items: center;
		gap: 0.9rem;
		inline-size: min(100%, 380px);
		max-block-size: 90dvh;
		overflow-y: auto;
		overscroll-behavior: contain;
		scrollbar-width: none;
		padding: 1.4rem 1.2rem 1.2rem;
		border-radius: var(--radius-l);
		background: var(--bg-raised);
		box-shadow: var(--shadow-pop);
		text-align: start;
	}
	.draw-dialog::-webkit-scrollbar {
		display: none;
	}
	.draw-skip {
		position: fixed;
		z-index: 160;
		inset-block-start: max(14px, env(safe-area-inset-top));
		inset-inline-end: max(14px, env(safe-area-inset-right));
		border-color: rgb(255 255 255 / 0.45);
		background: rgb(16 18 25 / 0.72);
		color: white;
		backdrop-filter: blur(6px);
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
	.draw-effect-shell {
		position: relative;
		inline-size: min(100%, 300px);
	}
	.draw-stage {
		position: relative;
		z-index: 1;
		perspective: 1200px;
		inline-size: 100%;
		--shake-soft-x: 0.3px;
		--shake-soft-angle: 0.05deg;
		--shake-mid-x: 0.7px;
		--shake-mid-angle: 0.12deg;
		--shake-x: 1.2px;
		--shake-angle: 0.2deg;
		--shake-soft-speed: 0.34s;
		--shake-mid-speed: 0.24s;
		--shake-hard-speed: 0.17s;
	}
	.draw-stage.rarity-r {
		--shake-soft-x: 0.45px;
		--shake-soft-angle: 0.08deg;
		--shake-mid-x: 1.1px;
		--shake-mid-angle: 0.2deg;
		--shake-x: 2px;
		--shake-angle: 0.35deg;
		--shake-soft-speed: 0.3s;
		--shake-mid-speed: 0.19s;
		--shake-hard-speed: 0.12s;
	}
	.draw-stage.rarity-sr {
		--shake-soft-x: 0.65px;
		--shake-soft-angle: 0.11deg;
		--shake-mid-x: 1.6px;
		--shake-mid-angle: 0.28deg;
		--shake-x: 4px;
		--shake-angle: 0.7deg;
		--shake-soft-speed: 0.25s;
		--shake-mid-speed: 0.14s;
		--shake-hard-speed: 0.075s;
	}
	.draw-stage.rarity-ur {
		--shake-soft-x: 0.9px;
		--shake-soft-angle: 0.15deg;
		--shake-mid-x: 2.3px;
		--shake-mid-angle: 0.4deg;
		--shake-x: 7px;
		--shake-angle: 1.15deg;
		--shake-soft-speed: 0.22s;
		--shake-mid-speed: 0.11s;
		--shake-hard-speed: 0.055s;
	}
	.draw-stage.rarity-aar {
		--shake-soft-x: 1.2px;
		--shake-soft-angle: 0.2deg;
		--shake-mid-x: 3px;
		--shake-mid-angle: 0.52deg;
		--shake-x: 11px;
		--shake-angle: 1.65deg;
		--shake-soft-speed: 0.2s;
		--shake-mid-speed: 0.085s;
		--shake-hard-speed: 0.045s;
	}
	.draw-shake {
		position: relative;
	}
	.draw-stage.charging .draw-shake {
		animation:
			draw-shake-soft var(--shake-soft-speed) ease-in-out infinite alternate,
			draw-shake-mid var(--shake-mid-speed) ease-in-out var(--mid-delay) infinite alternate,
			draw-shake-hard var(--shake-hard-speed) ease-in-out var(--hard-delay) infinite alternate;
		will-change: transform;
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
	@keyframes draw-shake-soft {
		from {
			transform: translateX(calc(0px - var(--shake-soft-x)))
				rotate(calc(0deg - var(--shake-soft-angle)));
		}
		to {
			transform: translateX(var(--shake-soft-x)) rotate(var(--shake-soft-angle));
		}
	}
	@keyframes draw-shake-mid {
		from {
			transform: translateX(calc(0px - var(--shake-mid-x)))
				rotate(calc(0deg - var(--shake-mid-angle)));
		}
		to {
			transform: translateX(var(--shake-mid-x)) rotate(var(--shake-mid-angle));
		}
	}
	@keyframes draw-shake-hard {
		from {
			transform: translateX(calc(0px - var(--shake-x))) rotate(calc(0deg - var(--shake-angle)));
		}
		to {
			transform: translateX(var(--shake-x)) rotate(var(--shake-angle));
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
		.draw-stage.charging .draw-shake {
			animation: none;
		}
	}
</style>
