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

<!-- ボタンそのものがカードの裏面（CardBack）。押した先のフリップ演出でめくれるのと
     同じ絵なので、何が起きるかが押す前に分かる。 -->
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
			<CardBack mark="58%" frame={false} />
		</span>
		{#if drawing}
			<span class="card-fab-spinner" aria-hidden="true"></span>
		{:else}
			<span class="card-fab-dot" aria-hidden="true"></span>
		{/if}
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
		/*
		 * デスクトップは .sidebar-right 下端の .side-footer（利用規約などのリンク）のすぐ上。
		 * footer は sidebar の padding-bottom 22px + padding-top 14px + 12px の 1〜2 行で、
		 * 高さは概ね 53〜76px。ここを大きく空けると宙に浮いて見えるので詰める。リンクは
		 * 左寄せで最長の行でも 200px 程度、FAB は右端 76px なので、多少食い込んでも文字には
		 * かからない。
		 */
		bottom: 54px;
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
	/*
	 * ボタンは正方形の台座。カードそのものを正方形にすると（＝地色と枠だけ裏面にすると）
	 * ただの角丸バッジに見えてカードだと伝わらないので、台座の中に縦長のカードを 1 枚置く。
	 */
	.card-fab {
		position: relative;
		display: grid;
		place-items: center;
		width: 56px;
		height: 56px;
		padding: 0;
		border: 1px solid var(--line);
		border-radius: var(--radius-m);
		background: var(--bg-raised);
		color: var(--text-on-accent);
		box-shadow: var(--shadow-pop);
		cursor: pointer;
		transition:
			transform 0.14s ease,
			box-shadow 0.14s ease;
	}
	/* 遊戯王リスペクトの 59/86。AffirmationCard と同じ比率にして図鑑の 1 枚に見せる。 */
	.card-fab-card {
		position: relative;
		display: block;
		inline-size: 32px;
		aspect-ratio: 59 / 86;
		border-radius: 5px;
		/* 32px 幅に 2px 枠は太いので細くする。 */
		--card-back-border: 1.5px;
	}
	.card-fab:disabled {
		cursor: progress;
	}
	/* ドロー中はスピナーと botたんが重なって読めないので、裏面の絵だけ引っ込める。 */
	.card-fab[aria-busy='true'] :global(.card-back-mark) {
		opacity: 0.2;
	}
	.card-fab:focus-visible {
		outline: 2px solid var(--focus-ring);
		outline-offset: 3px;
	}
	/* カードの上に重ねる。grid の流れに入れるとカードの下に段が増えてしまう。 */
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

	/* 未ドローの気づかせ。.news-unread-dot と同じ寸法・同じトークンだが、あちらは
	   22px アイコン用に位置がハードコードされているので、ここに書き起こす。
	   グラデーションの上でも輪郭が出るよう背景色のリングを足す。 */
	.card-fab-dot {
		position: absolute;
		top: -5px;
		right: -5px;
		box-sizing: border-box;
		width: 11px;
		height: 11px;
		border-radius: 50%;
		background: var(--decorative-accent);
		box-shadow: 0 0 0 2px var(--bg);
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
	       基準値は .post-follow-notice と揃える。 --- */
	@media (max-width: 767px) {
		.card-fab-wrap {
			bottom: calc(82px + env(safe-area-inset-bottom));
			right: 16px;
		}
		/* 一時通知はこの幅だと画面幅いっぱいに出るので、その上へ逃がす。 */
		.card-fab-wrap.shifted {
			bottom: calc(148px + env(safe-area-inset-bottom));
		}
	}

	@media (max-width: 380px) {
		.card-fab-wrap {
			right: 12px;
		}
		.card-fab {
			width: 52px;
			height: 52px;
		}
		.card-fab-card {
			inline-size: 30px;
		}
	}

	@media (hover: hover) and (pointer: fine) {
		.card-fab:hover {
			transform: translateY(-2px);
			box-shadow:
				var(--shadow-pop),
				0 0 0 4px var(--accent-softer);
		}
		.card-fab:active {
			transform: translateY(0) scale(0.96);
		}
		.card-fab:disabled:hover {
			transform: none;
			box-shadow: var(--shadow-pop);
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
		.card-fab:hover,
		.card-fab:active {
			transform: none;
		}
	}
</style>
