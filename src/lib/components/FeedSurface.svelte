<script lang="ts">
	import { onMount, untrack, type Snippet } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { feedTabs } from '$lib/feed-tabs/feed-tabs.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import { startVisiblePolling } from '$lib/polling';
	import { feedGestures } from '$lib/feed/gestures';
	import NewPostsButton from './NewPostsButton.svelte';

	let {
		activeKey,
		version = 0,
		ready = true,
		enabled = true,
		canAutoRefresh = () => true,
		onrefresh,
		children,
	}: {
		activeKey: string;
		version?: number;
		ready?: boolean;
		enabled?: boolean;
		canAutoRefresh?: () => boolean;
		onrefresh: () => Promise<unknown> | undefined;
		children: Snippet;
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
	function swipe(direction: -1 | 1) {
		const currentId =
			page.url.searchParams.get('tab') ??
			(page.url.pathname === '/global'
				? 'global'
				: page.url.pathname === '/affirmation'
					? 'affirmation'
					: feedTabs.fallback.id);
		const index = feedTabs.tabs.findIndex((tab) => tab.id === currentId);
		const next = index < 0 ? undefined : feedTabs.tabs[index + direction];
		if (!next) return;
		void goto(
			next.kind === 'list' && !$session ? '/login' : `/?tab=${encodeURIComponent(next.id)}`,
		);
	}
	function newest() {
		newPosts = false;
		window.scrollTo({
			top: 0,
			behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
		});
	}
</script>

<div
	class="feed-surface"
	class:interactive={enabled}
	use:feedGestures={{
		swipe,
		enabled: () => enabled && ready,
	}}
>
	{#if enabled}
		<NewPostsButton visible={newPosts} onclick={newest} />
	{/if}
	{@render children()}
</div>

<style>
	.feed-surface.interactive {
		min-height: 50vh;
	}
</style>
