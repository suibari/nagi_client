<script lang="ts">
	import { onMount, untrack, type Snippet } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { feedTabs } from '$lib/feed-tabs/feed-tabs.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import { startVisiblePolling } from '$lib/polling';
	import { feedGestures, swipeDirection } from '$lib/feed/gestures';
	import type { FeedTab } from '$lib/feed-tabs/types';
	import FeedPeek from './FeedPeek.svelte';
	import NewPostsButton from './NewPostsButton.svelte';

	let {
		activeKey,
		version = 0,
		ready = true,
		enabled = true,
		canAutoRefresh = () => true,
		onrefresh,
		children,
		preview,
	}: {
		activeKey: string;
		version?: number;
		ready?: boolean;
		enabled?: boolean;
		canAutoRefresh?: () => boolean;
		onrefresh: () => Promise<unknown> | undefined;
		children: Snippet;
		/** スワイプ中に隣から覗かせる中身。既定はキャッシュから描く FeedPeek。 */
		preview?: Snippet<[FeedTab]>;
	} = $props();
	let newPosts = $state(false);
	let seenKey = '';
	let seenVersion = 0;
	// Every activation uses the same refresh path, including returning to a cached tab.
	$effect(() => {
		if (!ready || !enabled) return;
		const key = activeKey;
		if (key === seenKey) return;
		seenKey = key;
		seenVersion = untrack(() => version);
		newPosts = false;
		untrack(() => void onrefresh());
	});
	$effect(() => {
		const current = version;
		if (current === seenVersion) return;
		seenVersion = current;
		if (enabled && window.scrollY > 24) newPosts = true;
	});
	onMount(() => {
		const stop = startVisiblePolling(
			() => {
				if (enabled && ready && canAutoRefresh()) void onrefresh();
			},
			30_000,
			{ onReturn: true },
		);
		const scroll = () => {
			if (window.scrollY <= 24) newPosts = false;
		};
		window.addEventListener('scroll', scroll, { passive: true });
		return () => {
			stop();
			window.removeEventListener('scroll', scroll);
		};
	});
	function currentTabIndex() {
		const currentId =
			page.url.searchParams.get('tab') ??
			(page.url.pathname === '/global'
				? 'global'
				: page.url.pathname === '/affirmation'
					? 'affirmation'
					: feedTabs.fallback.id);
		return feedTabs.tabs.findIndex((tab) => tab.id === currentId);
	}
	function neighbor(direction: -1 | 1): FeedTab | undefined {
		const index = currentTabIndex();
		return index < 0 ? undefined : feedTabs.tabs[index + direction];
	}
	const tabHref = (tab: FeedTab) =>
		tab.kind === 'list' && !$session ? '/login' : `/?tab=${encodeURIComponent(tab.id)}`;

	/*
	 * スワイプの見た目。指に合わせて今のフィード（track）を横へずらし、空いた側から
	 * 隣のタブ（peek）を並走させる。離したら最後まで流してから URL を切り替えるか、元へ戻す。
	 * 止まっている間は transform を外す（中の position: fixed を壊さないため）。
	 */
	const SETTLE_MS = 260;
	const GAP = 16;
	let surface = $state<HTMLElement>();
	/** idle → drag →（settle で戻る | commit で流して切り替え → reveal で peek を消す）→ idle */
	let phase = $state<'idle' | 'drag' | 'settle' | 'commit' | 'reveal'>('idle');
	let offset = $state(0);
	let direction = $state<-1 | 1>(1);
	let target = $state<FeedTab>();
	let frame = $state({ left: 0, width: 0, top: 0 });
	let timer: ReturnType<typeof setTimeout> | undefined;
	const full = $derived(frame.width + GAP);
	const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

	function measure() {
		if (!surface) return;
		const rect = surface.getBoundingClientRect();
		// モバイルの上部ヘッダは sticky なので、その下から覗かせる。
		const header = parseFloat(getComputedStyle(surface).getPropertyValue('--mobile-header-h')) || 0;
		frame = { left: rect.left, width: rect.width, top: Math.max(rect.top, header) };
	}
	function after(ms: number, next: () => void) {
		clearTimeout(timer);
		timer = setTimeout(next, ms);
	}
	function drag(dx: number) {
		if (reducedMotion() || phase === 'commit' || phase === 'reveal') return;
		if (phase !== 'drag') {
			clearTimeout(timer);
			measure();
			phase = 'drag';
		}
		direction = dx < 0 ? 1 : -1;
		target = neighbor(direction);
		// 先が無い側はゴムのように重くして、行き止まりだと分かるようにする。
		offset = target ? dx : dx / 3;
	}
	function settle() {
		if (phase !== 'drag') return;
		phase = 'settle';
		offset = 0;
		after(SETTLE_MS, () => {
			phase = 'idle';
			target = undefined;
		});
	}
	function release(dx: number, velocity: number) {
		const dir = swipeDirection(dx, velocity, frame.width || window.innerWidth);
		const next = dir ? neighbor(dir) : undefined;
		if (!next || phase !== 'drag') {
			if (next && reducedMotion()) void goto(tabHref(next));
			settle();
			return;
		}
		direction = dir as -1 | 1;
		target = next;
		phase = 'commit';
		offset = -direction * full;
		after(SETTLE_MS, () => void finish(next));
	}
	async function finish(next: FeedTab) {
		try {
			await goto(tabHref(next));
		} finally {
			// 新しいタブが描かれた後で track を戻し、上に被せていた peek を短く溶かす。
			offset = 0;
			phase = 'reveal';
			after(160, () => {
				phase = 'idle';
				target = undefined;
			});
		}
	}
	onMount(() => () => clearTimeout(timer));
	function newest() {
		newPosts = false;
		window.scrollTo({
			top: 0,
			behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
		});
	}
</script>

<div
	bind:this={surface}
	class="feed-surface"
	class:interactive={enabled}
	class:moving={phase !== 'idle'}
	use:feedGestures={{
		enabled: () => enabled && ready && (phase === 'idle' || phase === 'drag'),
		drag,
		release,
		cancel: settle,
	}}
>
	{#if enabled}
		<NewPostsButton visible={newPosts} onclick={newest} />
	{/if}
	<div
		class="feed-track"
		class:animated={phase === 'settle' || phase === 'commit'}
		style:transform={phase === 'idle' || phase === 'reveal' ? undefined : `translateX(${offset}px)`}
	>
		{@render children()}
	</div>
	{#if phase !== 'idle' && target}
		<div
			class="feed-peek-pane"
			class:animated={phase === 'settle' || phase === 'commit'}
			class:fading={phase === 'reveal'}
			data-testid="feed-peek"
			inert
			aria-hidden="true"
			style:left="{frame.left}px"
			style:width="{frame.width}px"
			style:top="{frame.top}px"
			style:transform={phase === 'reveal'
				? undefined
				: `translateX(${direction * full + offset}px)`}
		>
			{#key target.id}
				{#if preview}{@render preview(target)}{:else}<FeedPeek tab={target} />{/if}
			{/key}
		</div>
	{/if}
</div>

<style>
	.feed-surface.interactive {
		min-height: 50vh;
	}
	/* ずらしている間だけ、はみ出した track でページが横スクロールしないようにする。 */
	.feed-surface.moving {
		overflow-x: clip;
	}
	.feed-surface.moving .feed-track {
		will-change: transform;
	}
	.feed-peek-pane {
		position: fixed;
		bottom: 0;
		z-index: 10;
		overflow: hidden;
		background: var(--bg);
		pointer-events: none;
		will-change: transform;
	}
	.animated {
		transition: transform 260ms cubic-bezier(0.22, 0.61, 0.36, 1);
	}
	.feed-peek-pane.fading {
		opacity: 0;
		transition: opacity 160ms ease-out;
	}
</style>
