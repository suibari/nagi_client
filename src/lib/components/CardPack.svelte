<script lang="ts">
	import { onMount } from 'svelte';
	import {
		CARD_PACK_HERO_SRC,
		CARD_PACK_LOGO_SRC,
		CARD_PACK_TEAR_THRESHOLD,
		cardPackTearProgress,
	} from '$lib/cards/pack-assets';
	import { m } from '$lib/i18n/i18n.svelte';

	let {
		opened = false,
		onopen,
		ref = $bindable(),
	}: {
		/** 親が取り出しの段階へ進めたら true。封の切れ端が飛び、パックが下へ抜ける。 */
		opened?: boolean;
		/** 封を破り切ったときに1回だけ呼ぶ。 */
		onopen: () => void;
		ref?: HTMLButtonElement;
	} = $props();

	const TAP_SLOP_PX = 6;
	const AUTO_TEAR_MS = 320;
	const HINT_DELAY_MS = 2_200;

	let tear = $state(0);
	let dragging = $state(false);
	let hinting = $state(false);
	let torn = false;
	let startX = 0;
	let startY = 0;
	let moved = false;
	let pointerId: number | undefined;
	let hintTimer: ReturnType<typeof setTimeout> | undefined;
	let openTimer: ReturnType<typeof setTimeout> | undefined;

	onMount(() => {
		hintTimer = setTimeout(() => (hinting = true), HINT_DELAY_MS);
		return () => {
			clearTimeout(hintTimer);
			clearTimeout(openTimer);
		};
	});

	function stopHint() {
		clearTimeout(hintTimer);
		hinting = false;
	}

	function finishTear() {
		if (torn) return;
		torn = true;
		stopHint();
		dragging = false;
		tear = 1;
		openTimer = setTimeout(onopen, AUTO_TEAR_MS);
	}

	function pointerdown(event: PointerEvent) {
		if (torn || event.button > 0) return;
		stopHint();
		pointerId = event.pointerId;
		startX = event.clientX;
		startY = event.clientY;
		moved = false;
		dragging = true;
		ref?.setPointerCapture(event.pointerId);
	}

	function pointermove(event: PointerEvent) {
		if (!dragging || event.pointerId !== pointerId || !ref) return;
		if (Math.hypot(event.clientX - startX, event.clientY - startY) > TAP_SLOP_PX) moved = true;
		tear = cardPackTearProgress(startX, event.clientX, ref.getBoundingClientRect().width);
	}

	function pointerup(event: PointerEvent) {
		if (!dragging || event.pointerId !== pointerId) return;
		pointerId = undefined;
		dragging = false;
		if (!moved) return;
		if (tear >= CARD_PACK_TEAR_THRESHOLD) finishTear();
		else tear = 0;
	}

	// タップ・Enter・Space はここへ来る。なぞった後のクリックは pointerup 側で扱い済み。
	function click() {
		if (moved) {
			moved = false;
			return;
		}
		finishTear();
	}
</script>

<button
	bind:this={ref}
	type="button"
	class="card-pack"
	class:dragging
	class:hinting={hinting && tear === 0}
	class:opened
	style={`--tear: ${tear}`}
	aria-label={m.cardPackOpenLabel()}
	disabled={opened}
	onpointerdown={pointerdown}
	onpointermove={pointermove}
	onpointerup={pointerup}
	onpointercancel={pointerup}
	onclick={click}
>
	<span class="pack-body">
		<span class="pack-rays"></span>
		<span class="pack-glow"></span>
		<span class="pack-dots"></span>
		<img class="pack-hero" src={CARD_PACK_HERO_SRC} alt="" width="600" height="900" />
		<img class="pack-logo" src={CARD_PACK_LOGO_SRC} alt="" width="520" height="293" />
		<span class="pack-foil"></span>
		<span class="pack-frame"></span>
		<i class="pack-star star-1"></i>
		<i class="pack-star star-2"></i>
		<i class="pack-star star-3"></i>
		<i class="pack-star star-4"></i>
		<span class="pack-edge"></span>
		<span class="pack-crimp pack-crimp-bottom"></span>
	</span>
	<span class="pack-mouth"></span>
	<span class="pack-strip pack-crimp"></span>
	<span class="pack-flap pack-crimp"></span>
	<span class="pack-perforation"></span>
	<span class="pack-hint"></span>
</button>

<style>
	.card-pack {
		--strip: 11%;
		position: absolute;
		z-index: 2;
		inset: 0;
		display: block;
		padding: 0;
		border: 0;
		background: none;
		cursor: grab;
		touch-action: none;
		user-select: none;
		-webkit-user-select: none;
		-webkit-tap-highlight-color: transparent;
		filter: drop-shadow(0 10px 22px rgb(0 0 0 / 0.35));
		/* ヒントの指を cqi でパック幅いっぱいに動かすため。 */
		container-type: inline-size;
	}
	.card-pack.dragging {
		cursor: grabbing;
	}
	.card-pack:focus-visible {
		outline: none;
	}
	.card-pack:focus-visible .pack-body {
		outline: 3px solid var(--accent-strong);
		outline-offset: 3px;
	}
	.card-pack img {
		pointer-events: none;
		-webkit-user-drag: none;
	}
	/* パックは印刷物として扱い、テーマに関係なく同じ配色で描く。 */
	.pack-body {
		position: absolute;
		inset: var(--strip) 0 0;
		overflow: hidden;
		border-radius: 0 0 var(--radius-s) var(--radius-s);
		background:
			radial-gradient(120% 60% at 50% 0%, rgb(255 255 255 / 0.22), transparent 60%),
			linear-gradient(172deg, #075f6e 0%, #0f98ac 26%, #2cc8da 52%, #8be6ef 78%, #ffe1f1 100%);
	}
	.pack-body > * {
		position: absolute;
	}
	/* botたんの背後から広がる放射線。外へ行くほど薄くする。 */
	.pack-rays {
		inset: -40%;
		background: repeating-conic-gradient(
			from 0deg at 50% 58%,
			rgb(255 255 255 / 0.2) 0deg 5deg,
			transparent 5deg 13deg
		);
		-webkit-mask: radial-gradient(circle at 50% 58%, #000 8%, transparent 46%);
		mask: radial-gradient(circle at 50% 58%, #000 8%, transparent 46%);
	}
	.pack-glow {
		inset: 0;
		background:
			radial-gradient(
				circle at 50% 60%,
				rgb(255 255 255 / 0.85),
				rgb(255 246 206 / 0.45) 20%,
				transparent 46%
			),
			radial-gradient(circle at 18% 30%, rgb(255 214 236 / 0.35), transparent 30%),
			radial-gradient(circle at 85% 42%, rgb(196 255 230 / 0.3), transparent 28%);
	}
	/* 四隅のドット柄。トレカのパッケージらしい印刷の質感を足す。 */
	.pack-dots {
		inset: 0;
		background: radial-gradient(circle, rgb(255 255 255 / 0.5) 1.1px, transparent 1.6px) 0 0 / 9px
			9px;
		-webkit-mask:
			radial-gradient(circle at 0 100%, #000, transparent 38%),
			radial-gradient(circle at 100% 100%, #000, transparent 38%),
			radial-gradient(circle at 100% 0, #000, transparent 30%),
			radial-gradient(circle at 0 0, #000, transparent 30%);
		mask:
			radial-gradient(circle at 0 100%, #000, transparent 38%),
			radial-gradient(circle at 100% 100%, #000, transparent 38%),
			radial-gradient(circle at 100% 0, #000, transparent 30%),
			radial-gradient(circle at 0 0, #000, transparent 30%);
	}
	.pack-logo {
		inset-block-start: 4.5%;
		inset-inline: 0;
		margin-inline: auto;
		inline-size: 84%;
		block-size: auto;
		filter: drop-shadow(0 0 1px white) drop-shadow(0 0 1px white)
			drop-shadow(0 3px 4px rgb(0 40 60 / 0.45));
	}
	/* botたんは下端で切れる構図にする（全身を収めると小さくなりすぎる）。 */
	.pack-hero {
		inset-block-end: -18%;
		inset-inline: 0;
		margin-inline: auto;
		inline-size: 78%;
		block-size: auto;
		filter: drop-shadow(0 0 2px white) drop-shadow(0 0 10px rgb(255 255 255 / 0.7));
	}
	/* ホログラム加工の照り返し。ゆっくり流して銀紙らしく見せる。 */
	.pack-foil {
		inset: 0;
		background: linear-gradient(
			115deg,
			transparent 20%,
			rgb(255 120 200 / 0.35) 30%,
			rgb(255 240 150 / 0.4) 36%,
			rgb(130 255 220 / 0.35) 42%,
			rgb(140 170 255 / 0.35) 48%,
			transparent 58%
		);
		background-size: 260% 100%;
		mix-blend-mode: overlay;
		animation: pack-foil 4.5s ease-in-out infinite;
	}
	.pack-frame {
		inset: 0;
		margin: 3.5%;
		margin-block-end: 7%;
		border: 1.5px solid rgb(255 255 255 / 0.7);
		border-radius: 6px;
		box-shadow:
			inset 0 0 0 3px rgb(255 255 255 / 0.12),
			0 0 8px rgb(255 255 255 / 0.35);
	}
	.pack-star {
		inline-size: 14px;
		block-size: 14px;
		background: white;
		clip-path: polygon(50% 0, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0 50%, 39% 39%);
		filter: drop-shadow(0 0 4px white);
		animation: pack-twinkle 2.4s ease-in-out infinite;
	}
	.star-1 {
		inset-block-start: 36%;
		inset-inline-start: 9%;
	}
	.star-2 {
		inset-block-start: 44%;
		inset-inline-end: 10%;
		inline-size: 10px;
		block-size: 10px;
		animation-delay: -0.8s;
	}
	.star-3 {
		inset-block-start: 66%;
		inset-inline-start: 13%;
		inline-size: 9px;
		block-size: 9px;
		animation-delay: -1.5s;
	}
	.star-4 {
		inset-block-start: 3%;
		inset-inline-end: 7%;
		inline-size: 11px;
		block-size: 11px;
		animation-delay: -0.4s;
	}
	/* 袋のふくらみ。左右の端を暗く、中央をわずかに明るく。 */
	.pack-edge {
		inset: 0;
		background: linear-gradient(
			90deg,
			rgb(0 30 45 / 0.35),
			transparent 9%,
			rgb(255 255 255 / 0.08) 50%,
			transparent 91%,
			rgb(0 30 45 / 0.35)
		);
	}
	/* 封は金属フィルムの圧着部。縦の筋と上下の照りで光らせる。 */
	.pack-crimp {
		background:
			repeating-linear-gradient(
				90deg,
				rgb(255 255 255 / 0.45) 0 1.5px,
				rgb(0 60 80 / 0.12) 1.5px 3.5px
			),
			linear-gradient(180deg, #e8fbfd 0%, #8fd3dc 45%, #5fb9c6 55%, #d7f6f9 100%);
	}
	.pack-crimp-bottom {
		inset: auto 0 0;
		block-size: 5%;
	}
	/* 封の上端のギザギザ。マスクで三角の歯を並べる。 */
	.pack-strip,
	.pack-flap {
		position: absolute;
		inset: 0 0 auto;
		block-size: var(--strip);
		-webkit-mask:
			conic-gradient(from 135deg at top, #0000, #000 1deg 89deg, #0000 90deg) top / 10px 51%
				repeat-x,
			linear-gradient(#000 0 0) bottom / 100% 50% no-repeat;
		mask:
			conic-gradient(from 135deg at top, #0000, #000 1deg 89deg, #0000 90deg) top / 10px 51%
				repeat-x,
			linear-gradient(#000 0 0) bottom / 100% 50% no-repeat;
	}
	.pack-strip {
		clip-path: inset(0 0 0 calc(var(--tear) * 100%));
	}
	/* 破った部分は、破れ目を支点に上へめくれる。 */
	.pack-flap {
		clip-path: inset(0 calc((1 - var(--tear)) * 100%) 0 0);
		transform-origin: calc(var(--tear) * 100%) 100%;
		transform: rotate(calc(var(--tear) * -9deg)) translateY(calc(var(--tear) * -18%));
	}
	.card-pack:not(.dragging) .pack-strip,
	.card-pack:not(.dragging) .pack-flap,
	.card-pack:not(.dragging) .pack-mouth {
		transition:
			clip-path 0.3s ease-out,
			transform 0.3s ease-out;
	}
	/* 破れたところから覗くパックの口。 */
	.pack-mouth {
		position: absolute;
		inset-block-start: calc(var(--strip) - 3px);
		inset-inline: 2%;
		block-size: 7px;
		border-radius: 50%;
		background: radial-gradient(ellipse, rgb(0 0 0 / 0.55), transparent 70%);
		clip-path: inset(0 calc((1 - var(--tear)) * 100%) 0 0);
	}
	.pack-perforation {
		position: absolute;
		inset-block-start: var(--strip);
		inset-inline: 0;
		block-size: 0;
		border-block-start: 2px dashed rgb(255 255 255 / 0.85);
		clip-path: inset(-2px 0 -2px calc(var(--tear) * 100%));
	}
	/* しばらく触られないとき、切り取り線をなぞる指の腹を見せる。 */
	.pack-hint {
		position: absolute;
		inset-block-start: calc(var(--strip) - 14px);
		inset-inline-start: 6%;
		inline-size: 28px;
		block-size: 28px;
		border: 2px solid white;
		border-radius: 50%;
		background: rgb(255 255 255 / 0.35);
		box-shadow: 0 0 12px rgb(255 255 255 / 0.8);
		opacity: 0;
		pointer-events: none;
	}
	.card-pack.hinting .pack-hint {
		animation: pack-hint-swipe 1.8s ease-in-out infinite;
	}
	.card-pack.opened .pack-flap {
		transition: none;
		animation: pack-flap-away 0.45s ease-in forwards;
	}
	.card-pack.opened .pack-body,
	.card-pack.opened .pack-strip,
	.card-pack.opened .pack-mouth,
	.card-pack.opened .pack-perforation {
		animation: pack-drop 0.7s cubic-bezier(0.5, 0, 0.75, 0) forwards;
	}
	@keyframes pack-foil {
		0%,
		100% {
			background-position: 100% 0;
		}
		50% {
			background-position: 0 0;
		}
	}
	@keyframes pack-twinkle {
		0%,
		100% {
			opacity: 0.35;
			transform: scale(0.6) rotate(0deg);
		}
		50% {
			opacity: 1;
			transform: scale(1.1) rotate(45deg);
		}
	}
	@keyframes pack-hint-swipe {
		0% {
			opacity: 0;
			transform: translateX(0) scale(0.8);
		}
		15% {
			opacity: 1;
			transform: translateX(0) scale(1);
		}
		75% {
			opacity: 1;
			transform: translateX(72cqi) scale(1);
		}
		100% {
			opacity: 0;
			transform: translateX(80cqi) scale(0.9);
		}
	}
	@keyframes pack-flap-away {
		to {
			opacity: 0;
			transform: translate(-25%, -160%) rotate(-28deg);
		}
	}
	@keyframes pack-drop {
		to {
			opacity: 0;
			transform: translateY(75%);
		}
	}
</style>
