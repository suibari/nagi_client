<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { Feed } from '$lib/feed/feed.svelte';
	import { postedSignal } from '$lib/feed/posted-signal.svelte';
	import type { FeedTabSpec } from '$lib/feed-tabs/resolve';
	import { startVisiblePolling } from '$lib/polling';
	import ThreadUnit from './ThreadUnit.svelte';
	import InfiniteScroll from './InfiniteScroll.svelte';
	import Icon from './shell/Icon.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import { m } from '$lib/i18n/i18n.svelte';

	/**
	 * フィード1本の描画。タブ（ホーム/グローバル/カスタム/チャンネル/検索）はすべて
	 * これに spec を渡すだけで、取得経路の違いは resolveFeedTab が吸収する。
	 *
	 * spec.key ごとに Feed インスタンスをキャッシュするので、タブを行き来しても
	 * 読み込み位置とスクロール位置が残る（profile ページと同じ作り）。
	 */
	let { spec, homeAuthError = false }: { spec: FeedTabSpec; homeAuthError?: boolean } = $props();

	/** 抱え込む本数の上限。16タブぶんのタイムラインをメモリに置かないための LRU。 */
	const MAX_CACHED = 8;
	const cache = new Map<string, Feed>();

	/**
	 * spec.key ごとに1つ。取得は初回だけで、戻ってきたときはキャッシュをそのまま出す
	 * （ポーリングが最新へ寄せるので、再取得しなくても古びない）。
	 */
	function feedFor(current: FeedTabSpec): Feed {
		const existing = cache.get(current.key);
		if (existing) {
			// LRU: 触ったものを末尾へ回す。
			cache.delete(current.key);
			cache.set(current.key, existing);
			return existing;
		}
		const created = new Feed(current.fetcher, current.optimisticFilter, current.watermark);
		cache.set(current.key, created);
		if (cache.size > MAX_CACHED) cache.delete(cache.keys().next().value!);
		void created.load();
		return created;
	}

	// 生成は副作用（load を走らせる）なので $derived には置かない。
	let feed = $state<Feed>(untrack(() => feedFor(spec)));
	let shownKey = untrack(() => spec.key);
	$effect(() => {
		if (spec.key === shownKey) return;
		shownKey = spec.key;
		feed = feedFor(spec);
	});

	onMount(() => {
		// ポーラーは1組だけ。タブごとに張るとタブを開くたびに増えて必ずリークする。
		// 実行時に現在の feed を読むので、タブを切り替えても同じ2本で足りる。
		const base = startVisiblePolling(() => feed.refresh(), 30_000, { onReturn: true });
		const fast = startVisiblePolling(() => feed.refresh(), 3_000, {
			when: () => feed.hasOptimistic() || feed.hasPendingFor($session?.did),
		});
		return () => {
			base();
			fast();
		};
	});

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

{#if spec.showGuestHero && !$session}
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
