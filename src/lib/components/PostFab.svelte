<script lang="ts">
	import { m } from '$lib/i18n/i18n.svelte';
	import Icon from './shell/Icon.svelte';

	/**
	 * スマホ専用の投稿ボタン。この幅では左サイドバーごと消えるので、
	 * 親指の届く右下に浮かせる。PC・タブレットはサイドバー内の PostButton が担当する
	 * （浮かせたままだとサイドバーの幅・余白を推測することになり、揃わない）。
	 * カードFAB はこの幅でだけ左へ逃がしてあるので重ならない。
	 */
	let { onclick }: { onclick: () => void } = $props();
</script>

<button
	class="post-fab"
	type="button"
	aria-label={m.postFabLabel()}
	title={m.postFabLabel()}
	{onclick}
>
	<Icon name="send" size={22} />
</button>

<style>
	.post-fab {
		/* サイドバーが出ている幅では、列の中の PostButton に任せる。 */
		display: none;
	}

	@media (max-width: 767px) {
		.post-fab {
			position: fixed;
			/* .mobile-nav(20)・.feed-tabs(15) より上、絵文字ピッカー(29/30)・一時通知(40)・
			   各種モーダル(100〜120) より下。カードFAB と同じ層。 */
			z-index: 25;
			display: grid;
			place-items: center;
			/* Android Chrome で right/bottom の固定配置基準が拡大しても、正しい vw/dvh を
			   基準に右下へ置く。56px はこのボタン自身、82px はナビ回避分。 */
			inset-block-start: calc(100dvh - 138px - env(safe-area-inset-bottom));
			inset-inline-start: calc(100vw - 72px);
			width: 56px;
			height: 56px;
			padding: 0;
			border: 0;
			border-radius: 50%;
			background: var(--accent);
			box-shadow: var(--shadow-card);
			color: var(--text-on-accent);
			cursor: pointer;
			transition: transform 0.14s ease;
		}
	}

	@media (max-width: 380px) {
		.post-fab {
			inset-inline-start: calc(100vw - 68px);
		}
	}

	.post-fab:focus-visible {
		outline: 2px solid var(--focus-ring);
		outline-offset: 3px;
	}

	@media (hover: hover) and (pointer: fine) {
		.post-fab:active {
			transform: scale(0.94);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.post-fab {
			transition: none;
		}

		.post-fab:active {
			transform: none;
		}
	}
</style>
