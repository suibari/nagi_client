<script lang="ts">
	import { cachedCard, loadCard } from '$lib/card/cache.svelte';
	import type { BusinessCardData } from '$lib/card/data';
	import { m } from '$lib/i18n/i18n.svelte';
	import ActorHoverCard from './ActorHoverCard.svelte';
	import Avatar from './Avatar.svelte';

	/**
	 * プロフィールへ飛ぶアバターリンク。デスクトップではホバーで名刺を出す。
	 *
	 * クリック＝プロフィール遷移は据え置きで、ホバーは足すだけ。タッチ端末には
	 * ホバーが無く、代替として長押しなどを充てると本来の遷移を邪魔するので、
	 * (hover: hover) and (pointer: fine) のときだけ有効化する。
	 */
	let {
		actor,
		size,
		className = '',
		ariaLabel = m.viewProfileAria(),
		title,
	}: {
		actor: { did: string; displayName?: string; handle?: string; avatar?: string };
		size?: 'small' | 'large';
		/** 呼び出し元固有の配置・重なりスタイルを保つための追加クラス。 */
		className?: string;
		ariaLabel?: string;
		title?: string;
	} = $props();

	/** 通り過ぎるだけのカーソルで取得を走らせないための待ち時間。 */
	const OPEN_DELAY_MS = 150;
	/** アバターからカード本体へマウスを移す間、閉じないでおく猶予。 */
	const CLOSE_DELAY_MS = 200;

	let anchor = $state<HTMLElement>();
	let card = $state<BusinessCardData>();
	let openTimer: ReturnType<typeof setTimeout> | undefined;
	let closeTimer: ReturnType<typeof setTimeout> | undefined;

	const canHover = () =>
		typeof window !== 'undefined' &&
		window.matchMedia('(hover: hover) and (pointer: fine)').matches;

	function open() {
		if (!canHover()) return;
		clearTimeout(closeTimer);
		// 取得済みなら待たずに出す。2回目以降のホバーで間が空くのは鬱陶しい。
		const hit = cachedCard(actor.did);
		if (hit) {
			card = hit;
			return;
		}
		clearTimeout(openTimer);
		openTimer = setTimeout(async () => {
			card = await loadCard(actor.did);
		}, OPEN_DELAY_MS);
	}

	function close() {
		clearTimeout(openTimer);
		clearTimeout(closeTimer);
		closeTimer = setTimeout(() => (card = undefined), CLOSE_DELAY_MS);
	}

	function closeNow() {
		clearTimeout(openTimer);
		clearTimeout(closeTimer);
		card = undefined;
	}

	$effect(() => () => {
		clearTimeout(openTimer);
		clearTimeout(closeTimer);
	});
</script>

<a
	bind:this={anchor}
	class={`avatar-link${className ? ` ${className}` : ''}`}
	href="/profile/{actor.did}"
	aria-label={ariaLabel}
	{title}
	onmouseenter={open}
	onmouseleave={close}
	onfocus={open}
	onblur={close}
	onclick={closeNow}
>
	<Avatar {actor} {size} />
</a>

{#if card && anchor}
	<ActorHoverCard data={card} {anchor} onenter={() => clearTimeout(closeTimer)} onleave={close} />
{/if}
