<script lang="ts">
	import type { BusinessCardData } from '$lib/card/data';
	import { portal } from '$lib/actions/portal';
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

	const GAP = 8;
	const MARGIN = 12;

	let element = $state<HTMLElement>();
	let left = $state(0);
	let top = $state(0);
	let positioned = $state(false);

	function updatePosition() {
		if (!element) return;
		const rect = anchor.getBoundingClientRect();
		const width = element.offsetWidth;
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
			Math.max(MARGIN, window.innerWidth - width - MARGIN),
		);
		positioned = true;
	}

	// カードの実寸・画面・祖先スクロールの変化に追従する。
	$effect(() => {
		if (!element) return;
		let frame: number | undefined;
		const schedule = () => {
			if (frame !== undefined) return;
			frame = requestAnimationFrame(() => {
				frame = undefined;
				updatePosition();
			});
		};
		const resizeObserver = new ResizeObserver(schedule);
		resizeObserver.observe(element);
		window.addEventListener('resize', schedule);
		window.addEventListener('scroll', schedule, true);
		updatePosition();
		return () => {
			if (frame !== undefined) cancelAnimationFrame(frame);
			resizeObserver.disconnect();
			window.removeEventListener('resize', schedule);
			window.removeEventListener('scroll', schedule, true);
		};
	});
</script>

<div
	bind:this={element}
	use:portal
	class="hover-card"
	class:positioned
	style="left: {left}px; top: {top}px;"
	onmouseenter={onenter}
	onmouseleave={onleave}
	role="presentation"
>
	<BusinessCard {data} size="compact" />
</div>
