<script lang="ts">
	import { m } from '$lib/i18n/i18n.svelte';
	import CardBack from './CardBack.svelte';

	let {
		drawing = false,
		error = '',
		shifted = false,
		ondraw,
		ondismisserror,
	}: {
		drawing?: boolean;
		error?: string;
		/** 下部に一時通知（PostFollowNotice）が出ている間だけ true。モバイルで 1 段上げる。 */
		shifted?: boolean;
		ondraw: () => void;
		ondismisserror: () => void;
	} = $props();

	// /dev/cards では複数並べるので、aria-describedby の参照先が衝突しないようにする。
	const hintId = $props.id();
</script>

<!-- 見た目は浮遊するカードそのもの。操作要素としては button を保ち、押した先の
     フリップ演出と同じ CardBack を見せて、何が起きるかを押す前から伝える。 -->
<div class="card-fab-wrap" class:shifted>
	{#if error}
		<p class="card-fab-error" role="alert">
			<span>{error}</span>
			<button type="button" aria-label={m.dismissNotice()} onclick={ondismisserror}>×</button>
		</p>
	{/if}
	<button
		type="button"
		class="card-fab"
		aria-label={m.cardDrawButton()}
		aria-describedby={hintId}
		title={m.cardDrawButton()}
		disabled={drawing}
		aria-busy={drawing}
		onclick={ondraw}
	>
		<span class="card-fab-card">
			<CardBack />
			{#if drawing}<span class="card-fab-spinner" aria-hidden="true"></span>{/if}
		</span>
		<span class="card-fab-label">{drawing ? m.cardDrawing() : m.cardFabLabel()}</span>
		<span id={hintId} class="visually-hidden">{m.cardFabUndrawn()}</span>
	</button>
</div>

<style>
	.card-fab-wrap {
		position: fixed;
		/* .mobile-nav(20)・.feed-tabs(15) より上、絵文字ピッカー(29/30)・一時通知(40)・
		   各種モーダル(100〜120) より下。下部を占める UI が開いている間は譲る。 */
		z-index: 25;
		display: grid;
		justify-items: end;
		gap: 8px;
		/* 縦長カードとラベルを .side-footer（高さは概ね 53〜76px）の上へ置く。 */
		bottom: 84px;
		/* ビューポートの隅まで飛ばすと読んでいる列から遠いので、.shell（最大 1240px）の
		   右端あたりに張り付ける。狭い画面では max() で 24px に落ちる。 */
		right: max(24px, calc(50vw - 620px + 20px));
		transition: bottom 0.18s ease;
		animation: card-fab-in 0.16s ease-out;
	}
	@keyframes card-fab-in {
		from {
			opacity: 0;
			transform: scale(0.9);
		}
	}
	.card-fab {
		position: relative;
		display: grid;
		place-items: center;
		gap: 8px;
		min-width: 68px;
		padding: 0 4px 2px;
		border: 0;
		background: transparent;
		color: var(--text);
		cursor: pointer;
		transition: transform 0.14s ease;
	}
	/* 遊戯王リスペクトの 59/86。AffirmationCard と同じ比率にして図鑑の 1 枚に見せる。 */
	.card-fab-card {
		position: relative;
		display: block;
		inline-size: 52px;
		aspect-ratio: 59 / 86;
		border-radius: 8px;
		box-shadow: var(--shadow-pop);
		animation: card-fab-float 3.6s ease-in-out infinite;
		transition:
			box-shadow 0.18s ease,
			filter 0.18s ease;
	}
	@keyframes card-fab-float {
		0%,
		100% {
			transform: translateY(0) rotate(-1.5deg);
		}
		50% {
			transform: translateY(-5px) rotate(1deg);
		}
	}
	.card-fab-label {
		padding: 4px 9px;
		border: 1px solid var(--line);
		border-radius: var(--radius-pill);
		background: var(--bg-raised);
		box-shadow: var(--shadow-card);
		color: var(--text-muted);
		font-size: 11px;
		font-weight: 800;
		line-height: 1.2;
		white-space: nowrap;
	}
	.card-fab:disabled {
		cursor: progress;
	}
	/* ドロー中は浮遊を止め、スピナーと重なる裏面の絵だけ引っ込める。 */
	.card-fab[aria-busy='true'] .card-fab-card {
		animation: none;
	}
	.card-fab[aria-busy='true'] :global(.card-back-mark) {
		opacity: 0.2;
	}
	.card-fab:focus-visible {
		outline: none;
	}
	.card-fab:focus-visible .card-fab-card {
		outline: 2px solid var(--focus-ring);
		outline-offset: 4px;
	}
	.card-fab-spinner {
		position: absolute;
		inset: 0;
		margin: auto;
		z-index: 1;
		width: 20px;
		height: 20px;
		border: 3px solid color-mix(in srgb, var(--text-on-accent) 35%, transparent);
		border-top-color: var(--text-on-accent);
		border-radius: 50%;
		animation: card-fab-spin 0.8s linear infinite;
	}
	@keyframes card-fab-spin {
		to {
			transform: rotate(360deg);
		}
	}

	.card-fab-error {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 0;
		box-sizing: border-box;
		max-width: min(260px, calc(100vw - 48px));
		padding: 8px 8px 8px 12px;
		border: 1px solid var(--line-strong);
		border-radius: var(--radius-m);
		background: var(--bg-raised);
		box-shadow: var(--shadow-card);
		color: var(--danger);
		font-size: 12px;
	}
	.card-fab-error button {
		display: inline-grid;
		place-items: center;
		flex: none;
		width: 24px;
		height: 24px;
		padding: 0;
		border: 0;
		border-radius: 50%;
		background: transparent;
		color: var(--text-muted);
		font-size: 14px;
		cursor: pointer;
	}

	/* --- tablet: 右サイドバーが無いので隅でよい --- */
	@media (max-width: 1099px) {
		.card-fab-wrap {
			bottom: 24px;
			right: 20px;
		}
	}

	/* --- mobile: .mobile-nav（fixed, 68px + safe-area）を必ず avoid する。
	       基準値は .post-follow-notice と揃える。
	       この幅では右下が投稿ボタン（.post-fab）の定位置なので、こちらは左へ逃がす。 --- */
	@media (max-width: 767px) {
		.card-fab-wrap {
			bottom: calc(82px + env(safe-area-inset-bottom));
			right: auto;
			left: 16px;
			justify-items: start;
		}
		.card-fab {
			min-width: 64px;
		}
		.card-fab-card {
			inline-size: 48px;
		}
		.card-fab-label {
			padding-inline: 8px;
			font-size: 10.5px;
		}
		/* 一時通知はこの幅だと画面幅いっぱいに出るので、その上へ逃がす。 */
		.card-fab-wrap.shifted {
			bottom: calc(148px + env(safe-area-inset-bottom));
		}
	}

	/* 380px 以下は必ずモバイル幅なので、左寄せのまま余白だけ詰める。 */
	@media (max-width: 380px) {
		.card-fab-wrap {
			right: auto;
			left: 12px;
		}
	}

	@media (hover: hover) and (pointer: fine) {
		.card-fab:hover {
			transform: translateY(-2px);
		}
		.card-fab:hover .card-fab-card {
			box-shadow: var(--shadow-pop);
			filter: drop-shadow(0 0 8px var(--accent-soft));
		}
		.card-fab:active {
			transform: translateY(0) scale(0.96);
		}
		.card-fab:disabled:hover {
			transform: none;
		}
		.card-fab:disabled:hover .card-fab-card {
			filter: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.card-fab-wrap {
			transition: none;
			animation: none;
		}
		.card-fab {
			transition: none;
		}
		.card-fab-card {
			animation: none;
			transition: none;
		}
		.card-fab:hover,
		.card-fab:active {
			transform: none;
		}
	}
</style>
