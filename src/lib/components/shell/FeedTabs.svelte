<script lang="ts">
	import { page } from '$app/state';
	import { feedTabs } from '$lib/feed-tabs/feed-tabs.svelte';
	import type { FeedTab } from '$lib/feed-tabs/types';
	import { m } from '$lib/i18n/i18n.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import FeedTabBar from './FeedTabBar.svelte';
	import { feedPath } from './nav';

	/** フィードのタブバー。並び・出し入れ・追加はユーザー設定（$lib/feed-tabs）で決まる。 */
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

	// ホームは本人のリストなので、未ログインではサインインへ送る（従来どおり）。
	const href = (tab: FeedTab) =>
		tab.kind === 'list' && !$session
			? '/login'
			: `${feedPath(Boolean($session))}?tab=${encodeURIComponent(tab.id)}`;

	// 設定から戻るときは設定ハブではなく、いま見ていたフィードへ返す。
	const customizeHref = $derived(
		`/settings/feed-tabs?returnTo=${encodeURIComponent(`${page.url.pathname}${page.url.search}`)}`,
	);
</script>

<FeedTabBar tabs={feedTabs.tabs} {current} {href} {customizeHref} ariaLabel={m.feedTabsAria()} />
