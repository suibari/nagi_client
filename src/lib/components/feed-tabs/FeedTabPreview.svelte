<script lang="ts">
	import ThreadUnit from '$lib/components/ThreadUnit.svelte';
	import { Feed } from '$lib/feed/feed.svelte';
	import { feedTabLabel, resolveFeedTab } from '$lib/feed-tabs/resolve';
	import type { FeedTab } from '$lib/feed-tabs/types';
	import { m } from '$lib/i18n/i18n.svelte';
	import { session } from '$lib/oauth/session.svelte';

	/**
	 * 設定中のタブ構成がフィードでどう見えるか。上は実物と同じマークアップのタブバー
	 * （押しても遷移せず、下のプレビュー対象が変わるだけ）、下は選択中タブの実データ。
	 */
	let { tabs }: { tabs: FeedTab[] } = $props();

	const PREVIEW_COUNT = 3;

	let selectedId = $state<string>();
	const selected = $derived(tabs.find((tab) => tab.id === selectedId) ?? tabs[0]);

	// プレビューで取得したフィードは使い回す。タブを行き来するたびに叩かない。
	const feeds = new Map<string, Feed>();
	let feed = $state<Feed>();

	$effect(() => {
		const tab = selected;
		if (!tab) {
			feed = undefined;
			return;
		}
		// ウォーターマークは渡さない。設定画面を開いただけで各フィードが既読になる。
		const spec = resolveFeedTab(tab, { did: $session?.did });
		const existing = feeds.get(spec.key);
		if (existing) {
			feed = existing;
			return;
		}
		const created = new Feed(spec.fetcher, spec.optimisticFilter);
		feeds.set(spec.key, created);
		feed = created;
		void created.load();
	});
</script>

<div class="feed-tab-preview">
	<p class="feed-tab-preview-label">{m.feedTabsPreview()}</p>
	<nav class="feed-tabs" class:scrollable={tabs.length > 3} aria-hidden="true">
		{#each tabs as tab (tab.id)}
			<button
				type="button"
				class="feed-tab-preview-tab"
				class:active={selected?.id === tab.id}
				onclick={() => (selectedId = tab.id)}>{feedTabLabel(tab)}</button
			>
		{/each}
		<span class="feed-tab-add" aria-hidden="true">＋</span>
	</nav>
	<div class="feed-tab-preview-body">
		{#if !feed || (feed.loading && !feed.items.length)}
			<div class="timeline-loading" role="status" aria-label={m.loading()}>
				<span class="spinner" aria-hidden="true"></span>
			</div>
		{:else if feed.error && !feed.items.length}
			<p class="state error">{feed.error}</p>
		{:else if !feed.items.length}
			<p class="state">{m.feedTabsPreviewEmpty()}</p>
		{:else}
			{#each feed.items.slice(0, PREVIEW_COUNT) as item (item.conversation?.threadRootUri ?? item.uri)}
				<ThreadUnit {item} botActor={feed.botActor} />
			{/each}
		{/if}
	</div>
</div>
