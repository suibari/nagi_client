<script lang="ts">
	import { goto } from '$app/navigation';
	import ActionMenu from '$lib/components/ActionMenu.svelte';
	import { feedTabLabel } from '$lib/feed-tabs/resolve';
	import type { FeedTab } from '$lib/feed-tabs/types';
	import { m } from '$lib/i18n/i18n.svelte';
	import Icon from './Icon.svelte';

	/**
	 * タブバーの見た目と、はみ出したときの振る舞い（FEED-09）。フィードと設定のプレビューで共有する。
	 * href を渡すとリンク、渡さないとボタン（onselect）として描く。customizeHref が無いときは
	 * 末尾の ＋ / ▾ を見た目だけにする。
	 */
	let {
		tabs,
		current,
		href,
		onselect,
		customizeHref,
		ariaLabel,
	}: {
		tabs: FeedTab[];
		current?: string;
		href?: (tab: FeedTab) => string;
		onselect?: (tab: FeedTab) => void;
		customizeHref?: string;
		ariaLabel?: string;
	} = $props();

	// 3本以下は等分。4本以上は文字幅を基準に伸ばし、収まらなければ横スクロール。
	const scrollable = $derived(tabs.length > 3);

	let scroller = $state<HTMLElement>();
	let overflowing = $state(false);
	let fadeStart = $state(false);
	let fadeEnd = $state(false);

	function measure() {
		const el = scroller;
		if (!el) return;
		const max = el.scrollWidth - el.clientWidth;
		overflowing = scrollable && max > 1;
		fadeStart = overflowing && el.scrollLeft > 1;
		fadeEnd = overflowing && el.scrollLeft < max - 1;
	}

	$effect(() => {
		const el = scroller;
		void tabs.map(feedTabLabel);
		void scrollable;
		if (!el) return;
		// 器の幅が同じでもラベルの幅（言語切替・タブ編集）で scrollWidth は変わるので、子も観測する。
		const observer = new ResizeObserver(measure);
		observer.observe(el);
		for (const child of el.children) observer.observe(child);
		measure();
		return () => observer.disconnect();
	});

	$effect(() => {
		void current;
		if (!scrollable || !scroller) return;
		// 選択中のタブが画面外にあると、どこを見ているのか分からなくなる。
		scroller
			.querySelector('.feed-tab.active')
			?.scrollIntoView({ inline: 'center', block: 'nearest' });
	});

	function wheel(event: WheelEvent) {
		const el = scroller;
		if (!el || !overflowing || event.shiftKey || event.ctrlKey) return;
		// トラックパッドの横方向はブラウザに任せる。縦回転だけを横へ振り替える。
		if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
		const unit =
			event.deltaMode === WheelEvent.DOM_DELTA_LINE
				? 16
				: event.deltaMode === WheelEvent.DOM_DELTA_PAGE
					? el.clientWidth
					: 1;
		const delta = event.deltaY * unit;
		const max = el.scrollWidth - el.clientWidth;
		// 端に達した方向の回転はページの縦スクロールに使う。
		if ((delta < 0 && el.scrollLeft <= 0) || (delta > 0 && el.scrollLeft >= max - 1)) return;
		event.preventDefault();
		el.scrollLeft = Math.max(0, Math.min(max, el.scrollLeft + delta));
	}

	$effect(() => {
		const el = scroller;
		if (!el) return;
		// preventDefault するので passive にできない。Svelte の onwheel は passive になる。
		el.addEventListener('wheel', wheel, { passive: false });
		return () => el.removeEventListener('wheel', wheel);
	});

	function choose(tab: FeedTab, close: (restoreFocus?: boolean) => void) {
		close(false);
		if (href) void goto(href(tab));
		else onselect?.(tab);
	}
</script>

<!-- Bluesky のフィードのタブは、名前だけでは Nagi のタブと見分けられないので印を付ける。 -->
{#snippet tabLabel(tab: FeedTab)}
	{#if tab.kind === 'bsky'}<span class="feed-tab-bsky" aria-hidden="true"
			><Icon name="bluesky" size={14} /></span
		>{/if}{feedTabLabel(tab)}{#if tab.kind === 'bsky'}<span class="visually-hidden"
			>{m.feedTabsBskyHint()}</span
		>{/if}
{/snippet}

<nav class="feed-tabs" class:scrollable class:overflowing aria-label={ariaLabel}>
	<div
		class="feed-tabs-scroll"
		class:fade-start={fadeStart}
		class:fade-end={fadeEnd}
		bind:this={scroller}
		onscroll={measure}
	>
		{#each tabs as tab (tab.id)}
			{#if href}
				<a class="feed-tab" class:active={current === tab.id} href={href(tab)}
					>{@render tabLabel(tab)}</a
				>
			{:else}
				<button
					type="button"
					class="feed-tab"
					class:active={current === tab.id}
					onclick={() => onselect?.(tab)}>{@render tabLabel(tab)}</button
				>
			{/if}
		{/each}
	</div>
	{#if !customizeHref}
		<span class="feed-tab-end" aria-hidden="true">
			<Icon name={overflowing ? 'chevronDown' : 'plus'} size={18} />
		</span>
	{:else if overflowing}
		<span class="feed-tab-end feed-tab-menu">
			<ActionMenu label={m.feedTabsAll()} icon="chevronDown" triggerSize="news">
				{#snippet menu(close)}
					{#each tabs as tab (tab.id)}
						<button
							type="button"
							role="menuitemradio"
							aria-checked={current === tab.id}
							class:active={current === tab.id}
							onclick={() => choose(tab, close)}
						>
							<span>{@render tabLabel(tab)}</span>
						</button>
					{/each}
					<button
						type="button"
						role="menuitem"
						class="feed-tab-menu-customize"
						onclick={() => {
							close(false);
							void goto(customizeHref);
						}}
					>
						<Icon name="plus" size={16} /><span>{m.feedTabsCustomize()}</span>
					</button>
				{/snippet}
			</ActionMenu>
		</span>
	{:else}
		<a
			class="feed-tab-end feed-tab-add"
			href={customizeHref}
			aria-label={m.feedTabsCustomize()}
			title={m.feedTabsCustomize()}><Icon name="plus" size={18} /></a
		>
	{/if}
</nav>

<style>
	.feed-tab-bsky {
		display: inline-flex;
		margin-right: 4px;
		vertical-align: -2px;
	}
</style>
