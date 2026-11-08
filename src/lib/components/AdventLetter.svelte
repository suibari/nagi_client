<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type { AdventCardView } from '$lib/api/types';
	import type { AdventLocale } from '$lib/advent/advent';
	import { m } from '$lib/i18n/i18n.svelte';
	import AdventCard from './AdventCard.svelte';

	/**
	 * 自分が選ばれたカードを、手紙を開ける演出で見せる（1枚につき1回だけ）。
	 * 封筒が届く → ふたが開く → カードが出てくる → onfinish でカードの拡大表示へ。
	 * 動きを減らす設定のときは演出を飛ばしてすぐ拡大表示へ進む。
	 */
	let {
		card,
		locale,
		onfinish,
	}: { card: AdventCardView; locale: AdventLocale; onfinish: () => void } = $props();

	type Phase = 'arrive' | 'waiting' | 'opening' | 'rising' | 'done';
	let phase = $state<Phase>('arrive');
	const timers: ReturnType<typeof setTimeout>[] = [];
	const after = (ms: number, run: () => void) => timers.push(setTimeout(run, ms));

	onMount(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			finish();
			return;
		}
		after(450, () => (phase = 'waiting'));
		// 押さなくても少し待てば開く。
		after(1800, open);
	});
	onDestroy(() => timers.forEach(clearTimeout));

	function open() {
		if (phase !== 'arrive' && phase !== 'waiting') return;
		phase = 'opening';
		after(520, () => (phase = 'rising'));
		after(1500, finish);
	}

	function finish() {
		if (phase === 'done') return;
		phase = 'done';
		timers.forEach(clearTimeout);
		onfinish();
	}
</script>

<div class="letter-veil" role="dialog" aria-modal="true" aria-label={m.adventLetterAria()}>
	<p class="lead" class:hidden={phase === 'rising'}>{m.adventLetterLead()}</p>
	<button
		type="button"
		class={`envelope phase-${phase}`}
		aria-label={m.adventLetterOpen()}
		onclick={open}
	>
		<span class="back" aria-hidden="true"></span>
		<span class="card-slot" aria-hidden="true">
			<AdventCard {card} {locale} />
		</span>
		<span class="front" aria-hidden="true"></span>
		<span class="flap" aria-hidden="true"></span>
		<span class="seal" aria-hidden="true">
			<svg viewBox="0 0 100 100"
				><path d="M50 14 L59 39 L86 40 L65 56 L72 83 L50 67 L28 83 L35 56 L14 40 L41 39 Z" /></svg
			>
		</span>
	</button>
	<button type="button" class="skip" onclick={finish}>{m.adventLetterSkip()}</button>
</div>

<style>
	.letter-veil {
		position: fixed;
		inset: 0;
		z-index: 130;
		display: grid;
		place-items: center;
		align-content: center;
		gap: 28px;
		padding: 16px;
		background: var(--advent-veil);
		color: var(--advent-cream);
	}
	.lead {
		margin: 0;
		font-size: 1.05rem;
		font-weight: 700;
		color: var(--advent-gold-soft);
		text-align: center;
		transition: opacity 240ms ease;
	}
	.lead.hidden {
		opacity: 0;
	}
	.envelope {
		position: relative;
		inline-size: min(84vw, 420px);
		aspect-ratio: 3 / 2;
		padding: 0;
		border: 0;
		background: none;
		cursor: pointer;
		perspective: 900px;
		animation: arrive 450ms cubic-bezier(0.2, 0.9, 0.3, 1.2);
	}
	.envelope:focus-visible {
		outline: 3px solid var(--advent-light);
		outline-offset: 6px;
		border-radius: 8px;
	}
	.phase-waiting {
		animation: wiggle 1.2s ease-in-out infinite;
	}
	.back,
	.front,
	.flap {
		position: absolute;
		inset: 0;
		border-radius: 8px;
	}
	.back {
		background: var(--advent-envelope-shade);
		box-shadow: 0 18px 40px var(--advent-shadow);
	}
	/* 前のポケット。左右と下から三角を合わせた形で、カードの下半分を隠す。 */
	.front {
		z-index: 3;
		background: var(--advent-envelope);
		clip-path: polygon(0 0, 50% 55%, 100% 0, 100% 100%, 0 100%);
	}
	.flap {
		z-index: 4;
		background: var(--advent-envelope-shade);
		clip-path: polygon(0 0, 100% 0, 50% 58%);
		transform-origin: top center;
		transition: transform 520ms ease-in;
	}
	.seal {
		position: absolute;
		z-index: 5;
		left: 50%;
		top: 52%;
		inline-size: 18%;
		aspect-ratio: 1;
		display: grid;
		place-items: center;
		border-radius: 50%;
		background: var(--advent-red);
		box-shadow: 0 3px 8px var(--advent-shadow);
		transform: translate(-50%, -50%);
		transition:
			opacity 200ms ease,
			transform 200ms ease;
	}
	.seal svg {
		inline-size: 62%;
		fill: var(--advent-gold);
	}
	.card-slot {
		position: absolute;
		z-index: 2;
		left: 6%;
		right: 6%;
		top: 10%;
		transition: transform 900ms cubic-bezier(0.25, 0.8, 0.3, 1);
	}
	.phase-opening .flap,
	.phase-rising .flap {
		transform: rotateX(180deg);
		z-index: 1;
	}
	.phase-opening .seal,
	.phase-rising .seal {
		opacity: 0;
		transform: translate(-50%, -50%) scale(0.6);
	}
	.phase-rising .card-slot {
		z-index: 6;
		transform: translateY(-62%) scale(1.12);
	}
	.skip {
		border: 0;
		background: none;
		color: var(--advent-cream-muted);
		font-size: 0.9rem;
		text-decoration: underline;
		cursor: pointer;
	}
	@keyframes arrive {
		from {
			opacity: 0;
			transform: translateY(40px) rotate(-4deg) scale(0.9);
		}
	}
	@keyframes wiggle {
		0%,
		100% {
			transform: rotate(0);
		}
		40% {
			transform: rotate(-2deg);
		}
		60% {
			transform: rotate(2deg);
		}
	}
</style>
