<script module lang="ts">
	import { Feed } from '$lib/feed/feed.svelte';
	import { FeedCache } from '$lib/feed/cache';
	import type { FeedTabSpec } from '$lib/feed-tabs/resolve';
	const cache = new FeedCache<Feed>();
	function feedFor(spec: FeedTabSpec) {
		return cache.get(spec.key, () => {
			const feed = new Feed(spec.fetcher, spec.optimisticFilter, spec.watermark);
			void feed.load();
			return feed;
		});
	}
</script>

<script lang="ts">
	import Spinner from '$lib/components/Spinner.svelte';
	import { onMount, untrack } from 'svelte';
	import { followPostedScroll } from '$lib/feed/post-follow.svelte';
	import { postedSignal } from '$lib/feed/posted-signal.svelte';
	import { startVisiblePolling } from '$lib/polling';
	import ThreadUnit from './ThreadUnit.svelte';
	import InfiniteScroll from './InfiniteScroll.svelte';
	import Icon from './shell/Icon.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import GuestPostSection from './GuestPostSection.svelte';
	import FeedSurface from './FeedSurface.svelte';

	/**
	 * フィード1本の描画。タブ（ホーム/グローバル/カスタム/チャンネル/検索）はすべて
	 * これに spec を渡すだけで、取得経路の違いは resolveFeedTab が吸収する。
	 *
	 * spec.key ごとに Feed インスタンスをキャッシュするので、タブを行き来しても
	 * 読み込み位置とスクロール位置が残る（profile ページと同じ作り）。
	 */
	let { spec, homeAuthError = false }: { spec: FeedTabSpec; homeAuthError?: boolean } = $props();

	// 生成は副作用（load を走らせる）なので $derived には置かない。
	let feed = $state<Feed>(untrack(() => feedFor(spec)));
	let shownKey = untrack(() => spec.key);

	$effect(() => {
		if (spec.key === shownKey) return;
		shownKey = spec.key;
		feed = feedFor(spec);
	});
	onMount(() =>
		startVisiblePolling(() => feed.refresh(), 3_000, {
			when: () => feed.hasOptimistic() || feed.hasRecentPostFor($session?.did),
		}),
	);

	// 投稿直後の画面追従。楽観カード → 確定カードで DOM が入れ替わるので、
	// 並びが変わるたびに追従先を引き直す。
	followPostedScroll(() => feed.visibleItems);

	// ポストモーダルからの投稿を拾う。楽観投稿は optimisticPosts が既に反映しているので、
	// ここはサーバー側の確定データ（botたんの返信予定など）へ寄せるための更新。
	let seenPosted = untrack(() => postedSignal.count);
	$effect(() => {
		if (postedSignal.count === seenPosted) return;
		seenPosted = postedSignal.count;
		void feed.refresh();
	});

	/** 削除は今見ているタブだけでなく、キャッシュしている全タブへ伝播させる。 */
	export function removeEverywhere(uri: string) {
		for (const cached of cache.values()) cached.removePost(uri);
	}
	/** 現在のタブを取り直す。ナビの再タップ（pageRefresh）から呼ぶ。 */
	export function refresh() {
		return feed.refresh();
	}
	/**
	 * アカウントが変わったらキャッシュごと捨てる（本人向けフィードが混ざらないように）。
	 * spec.key には DID が入っているので、捨てたあと自然に取り直される。
	 */
	export function reset() {
		cache.clear();
		shownKey = spec.key;
		feed = feedFor(spec);
	}
</script>

<FeedSurface activeKey={spec.key} version={feed.newItemsVersion} onrefresh={() => feed.refresh()}>
	{#if spec.showGuestHero && !$session}
		<aside class="welcome">
			<div>
				<strong>{m.welcomeTitle()}</strong><span>{m.welcomeBody()}</span>
				<a class="welcome-about" href="/about">{m.welcomeAboutLink()} →</a>
			</div>
			<a href="/login">{m.joinCta()}</a>
		</aside>
		<!-- 歓迎カードを必ずタブ直下に置き、その次に端末保存スレッドを通常フィードと同じ列で並べる。 -->
		<GuestPostSection botActor={feed.botActor} />
	{/if}
	<section class="timeline" aria-busy={feed.loading}>
		{#if feed.loading && !feed.visibleItems.length}
			<Spinner label={m.feedWaiting()} />
		{:else if feed.error && !feed.visibleItems.length}
			<div class="state error">
				{feed.error}<button
					class="icon-action"
					type="button"
					aria-label={m.retry()}
					title={m.retry()}
					onclick={() => feed.load()}><Icon name="refresh" size={18} /></button
				>
				{#if spec.handleHomeAuthError && homeAuthError}<a class="welcome-about" href="/login"
						>{m.homeFeedRefreshPermissions()}</a
					>{/if}
			</div>
		{:else if !feed.visibleItems.length}
			<div class="state">{spec.empty()}</div>
		{:else}
			{#each feed.visibleItems as item (item.conversation?.threadRootUri ?? item.uri)}
				<ThreadUnit
					{item}
					entering={feed.isEntering(item)}
					isPostEntering={(uri) => feed.isPostEntering(uri)}
					unread={feed.isUnread(item, $session?.did)}
					botActor={feed.botActor}
					ondeleted={(uri) => removeEverywhere(uri)}
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
</FeedSurface>
