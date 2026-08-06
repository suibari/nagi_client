<script lang="ts">
	import { page } from '$app/state';
	import { feedTabs } from '$lib/feed-tabs/feed-tabs.svelte';
	import { feedTabLabel } from '$lib/feed-tabs/resolve';
	import type { FeedTab } from '$lib/feed-tabs/types';
	import { m } from '$lib/i18n/i18n.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import Icon from './Icon.svelte';

	/**
	 * フィードのタブバー。並び・出し入れ・追加はユーザー設定（$lib/feed-tabs）で決まる。
	 * 末尾の ＋ から /settings/feed-tabs へ。
	 */
	let { activeId }: { activeId?: string } = $props();

	// 昔の URL（/global, /affirmation）から来たときも、対応するタブを光らせる。
	const legacyId = $derived(
		page.url.pathname.startsWith('/affirmation')
			? 'affirmation'
			: page.url.pathname.startsWith('/global')
				? 'global'
				: undefined,
	);
	const current = $derived(
		activeId ?? page.url.searchParams.get('tab') ?? legacyId ?? feedTabs.fallback.id,
	);
	const tabs = $derived(feedTabs.tabs);

	// ホームは本人のリストなので、未ログインではサインインへ送る（従来どおり）。
	const href = (tab: FeedTab) =>
		tab.kind === 'list' && !$session ? '/login' : `/feed?tab=${encodeURIComponent(tab.id)}`;

	// 4本以上でスクロールに切り替える。3本以下は今までどおり等分幅のまま。
	const scrollable = $derived(tabs.length > 3);

	let bar = $state<HTMLElement>();
	$effect(() => {
		if (!scrollable || !bar) return;
		// 選択中のタブが画面外にあると、どこを見ているのか分からなくなる。
		bar.querySelector('a.active')?.scrollIntoView({ inline: 'center', block: 'nearest' });
	});
</script>

<nav class="feed-tabs" class:scrollable aria-label={m.feedTabsAria()} bind:this={bar}>
	{#each tabs as tab (tab.id)}
		<a href={href(tab)} class:active={current === tab.id}>{feedTabLabel(tab)}</a>
	{/each}
	<!-- 設定から戻るときは設定ハブではなく、いま見ていたフィードへ返す。 -->
	<a
		class="feed-tab-add"
		href="/settings/feed-tabs?returnTo={encodeURIComponent(
			`${page.url.pathname}${page.url.search}`,
		)}"
		aria-label={m.feedTabsCustomize()}
		title={m.feedTabsCustomize()}><Icon name="plus" size={18} /></a
	>
</nav>
