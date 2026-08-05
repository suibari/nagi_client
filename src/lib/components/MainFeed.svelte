<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { ApiRequestError, getHomeTimeline, getTimeline } from '$lib/api/appview';
	import { Feed } from '$lib/feed/feed.svelte';
	import { postFollowNotice } from '$lib/feed/post-follow.svelte';
	import { globalFeedRead, homeFeedRead } from '$lib/feed/unread.svelte';
	import { postedSignal } from '$lib/feed/posted-signal.svelte';
	import { startVisiblePolling } from '$lib/polling';
	import ThreadUnit from './ThreadUnit.svelte';
	import InfiniteScroll from './InfiniteScroll.svelte';
	import FeedTabs from './shell/FeedTabs.svelte';
	import Icon from './shell/Icon.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import { m } from '$lib/i18n/i18n.svelte';

	let { mode }: { mode: 'home' | 'global' } = $props();
	const initialMode = untrack(() => mode);
	let homeAuthError = $state(false);
	let feedWatermark = globalFeedRead;
	if (initialMode === 'home') feedWatermark = homeFeedRead;
	const feed = new Feed(
		async (cursor) => {
			if (initialMode === 'home') homeAuthError = false;
			try {
				return initialMode === 'home' ? await getHomeTimeline(cursor) : await getTimeline(cursor);
			} catch (error) {
				if (
					initialMode === 'home' &&
					error instanceof ApiRequestError &&
					(error.status === 401 || error.status === 403)
				) {
					homeAuthError = true;
					throw new Error(m.homeFeedAuthRequired());
				}
				throw error;
			}
		},
		(item) => (initialMode === 'home' ? !item.reply && !item.channelOnly : !item.threadKossori),
		feedWatermark,
	);
	let lastDid = $state<string | undefined>(untrack(() => $session?.did));
	onMount(() => {
		void feed.load();
		const base = startVisiblePolling(() => feed.refresh(), 30_000, { onReturn: true });
		const fast = startVisiblePolling(() => feed.refresh(), 3_000, {
			when: () => feed.hasOptimistic() || feed.hasPendingFor($session?.did),
		});
		return () => {
			base();
			fast();
		};
	});

	$effect(() => {
		const did = $session?.did;
		if (did !== lastDid) {
			lastDid = did;
			void feed.load();
		}
	});

	// ポストモーダルからの投稿を拾う。楽観投稿は optimisticPosts が既に反映しているので、
	// ここはサーバ側の確定データ（botたんの返信予定など）へ寄せるための更新。
	let seenPosted = untrack(() => postedSignal.count);
	$effect(() => {
		if (postedSignal.count === seenPosted) return;
		seenPosted = postedSignal.count;
		void feed.refresh();
	});
</script>

<FeedTabs active={mode} />
{#if !$session}
	<section class="hero">
		<p class="eyebrow">{m.heroEyebrow()}</p>
		<h1>{m.heroTitle()}</h1>
		<p>{m.heroBody()}</p>
	</section>
	<aside class="welcome">
		<div>
			<strong>{m.welcomeTitle()}</strong><span>{m.welcomeBody()}</span>
			<a class="welcome-about" href="/about">{m.welcomeAboutLink()} →</a>
		</div>
		<a href="/login">{m.joinCta()}</a>
	</aside>
{/if}
<section class="timeline" aria-busy={feed.loading}>
	{#if feed.loading && !feed.visibleItems.length}
		<div class="timeline-loading" role="status" aria-label={m.feedWaiting()}>
			<span class="spinner" aria-hidden="true"></span>
		</div>
	{:else if feed.error && !feed.visibleItems.length}
		<div class="state error">
			{feed.error}<button
				class="icon-action"
				type="button"
				aria-label={m.retry()}
				title={m.retry()}
				onclick={() => feed.load()}><Icon name="refresh" size={18} /></button
			>
			{#if homeAuthError}<a class="welcome-about" href="/login">{m.homeFeedRefreshPermissions()}</a
				>{/if}
		</div>
	{:else if !feed.visibleItems.length}
		<div class="state">{mode === 'home' ? m.homeFeedEmpty() : m.feedEmpty()}</div>
	{:else}
		{#each feed.visibleItems as item (item.conversation?.threadRootUri ?? item.uri)}
			<ThreadUnit
				{item}
				unread={feed.isUnread(item, $session?.did)}
				botActor={feed.botActor}
				ondeleted={(uri) => feed.removePost(uri)}
				onposted={() => feed.refresh()}
			/>
		{/each}
		<InfiniteScroll
			hasMore={feed.hasMore}
			loading={feed.loading}
			error={feed.error}
			onload={() => feed.loadMore()}
		/>
	{/if}
</section>
