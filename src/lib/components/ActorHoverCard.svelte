<script lang="ts">
	import type { BusinessCardData } from '$lib/card/data';
	import BusinessCard from './BusinessCard.svelte';

	/**
	 * アバターホバーで出る名刺ポップオーバー。
	 *
	 * 位置決めは ReactionBar.svelte の絵文字ピッカーと同じく anchor の
	 * getBoundingClientRect() から。position: fixed なのでスクロール量の補正は要らない。
	 */
	let {
		data,
		anchor,
		onenter,
		onleave,
	}: {
		data: BusinessCardData;
		anchor: HTMLElement;
		/** カード自体にマウスが乗ったら閉じるのを止める（ヒステリシス）。 */
		onenter: () => void;
		onleave: () => void;
	} = $props();

	const WIDTH = 340;
	const GAP = 8;
	const MARGIN = 12;

	let element = $state<HTMLElement>();
	let left = $state(0);
	let top = $state(0);

	// カードの高さは中身次第なので、描画後の実寸を見てから上下を決める。
	$effect(() => {
		if (!element) return;
		const rect = anchor.getBoundingClientRect();
		const height = element.offsetHeight;

		// 下に出すのが基本。はみ出すならアバターの上へ反転する。
		const below = rect.bottom + GAP;
		top =
			below + height > window.innerHeight - MARGIN
				? Math.max(MARGIN, rect.top - GAP - height)
				: below;

		// アバターの左端に合わせ、右にはみ出すぶんだけ引き戻す。
		left = Math.min(
			Math.max(MARGIN, rect.left),
			Math.max(MARGIN, window.innerWidth - WIDTH - MARGIN),
		);
	});
</script>

<div
	bind:this={element}
	class="hover-card"
	style="left: {left}px; top: {top}px;"
	onmouseenter={onenter}
	onmouseleave={onleave}
	role="presentation"
>
	<BusinessCard {data} size="compact" />
</div>
