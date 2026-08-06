<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import AddFeedTabDialog from '$lib/components/feed-tabs/AddFeedTabDialog.svelte';
	import FeedTabPreview from '$lib/components/feed-tabs/FeedTabPreview.svelte';
	import FeedTabSortList from '$lib/components/feed-tabs/FeedTabSortList.svelte';
	import PreferencesSyncNotice from '$lib/components/PreferencesSyncNotice.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';
	import { feedTabs } from '$lib/feed-tabs/feed-tabs.svelte';
	import { feedTabLabel } from '$lib/feed-tabs/resolve';
	import { FEED_TABS_LIMIT, type FeedTab } from '$lib/feed-tabs/types';
	import { m } from '$lib/i18n/i18n.svelte';
	import { preferencesReady } from '$lib/preferences/sync.svelte';
	import { toInternalPath } from '$lib/utils/url';

	/**
	 * フィードのタブ構成。編集は即保存（送信側で 1.5s デバウンスされる）。
	 * draft はストアのコピーで、並び替え中の中間状態を持つためだけに存在する。
	 */
	let draft = $state<FeedTab[]>([]);
	let addOpen = $state(false);

	/**
	 * タブバーの ＋ から来たときは、設定ハブではなく見ていたフィードへ返す。
	 * 戻り先はフィードのページだけに限る（任意の内部 URL を通すと、設定から入った人が
	 * 「フィードに戻る」で知らない場所へ飛ぶ）。
	 */
	const FEED_PATHS = ['/feed', '/global', '/affirmation'];
	const returnTo = $derived.by(() => {
		const path = toInternalPath(page.url.searchParams.get('returnTo'));
		return path && FEED_PATHS.some((feed) => path.startsWith(feed)) ? path : undefined;
	});
	const backHref = $derived(returnTo ?? '/settings');
	const backLabel = $derived(returnTo ? m.feedTabsBackToFeed() : m.backToSettings());

	// アカウント同期の取り込みが済んでから読む。先に読むと、同期前の構成を編集して
	// 上書きしてしまう（お気に入り絵文字と同じ理由）。
	onMount(() => {
		void preferencesReady().then(() => {
			draft = feedTabs.tabs.map((tab) => ({ ...tab }));
		});
	});

	const full = $derived(draft.length >= FEED_TABS_LIMIT);

	function persist(next: FeedTab[]) {
		draft = next;
		feedTabs.replace(next);
	}

	/**
	 * 名前の下に出す種別。組み込みタブは名前と種別が同じ語になってしまうので
	 * （「グローバル / グローバル」）、代わりに中身の説明を出す。
	 */
	const kindLabel = (tab: FeedTab) =>
		tab.kind === 'channel'
			? m.feedTabsKindChannel()
			: tab.kind === 'search'
				? tab.queryKind === 'tag'
					? m.feedTabsSearchKindTag()
					: m.feedTabsSearchKindKeyword()
				: tab.kind === 'custom'
					? m.feedTabsKindCustomHint()
					: tab.kind === 'global'
						? m.feedTabsKindGlobalHint()
						: m.feedTabsKindListHint();

	const iconOf = (tab: FeedTab) =>
		tab.kind === 'channel'
			? 'hash'
			: tab.kind === 'search'
				? 'search'
				: tab.kind === 'custom'
					? 'heart'
					: tab.kind === 'global'
						? 'language'
						: 'text';

	function remove(id: string) {
		persist(draft.filter((tab) => tab.id !== id));
	}

	function add(tab: FeedTab) {
		addOpen = false;
		persist([...draft, tab]);
	}
</script>

<section class="auth-card settings-detail">
	<a class="settings-back" href={backHref}>← {backLabel}</a>
	<h1>{m.settingsFeedTabsTitle()}</h1>
	<p>{m.feedTabsHelp()}</p>
	<PreferencesSyncNotice />

	<button type="button" class="primary feed-tab-add-button" disabled={full} onclick={() => (addOpen = true)}>
		<Icon name="plus" size={16} />{m.feedTabsAdd()}
	</button>
	{#if full}<p class="error">{m.feedTabsFull()}</p>{/if}

	<FeedTabSortList bind:items={draft} onreorder={(next) => persist(next as FeedTab[])}>
		{#snippet children(item)}
			{@const tab = item as FeedTab}
			<Icon name={iconOf(tab)} size={16} />
			<span class="feed-tab-row-text">
				<strong>{feedTabLabel(tab)}</strong>
				<small>{kindLabel(tab)}</small>
			</span>
			<button
				type="button"
				class="icon-action"
				aria-label={m.feedTabsRemove({ name: feedTabLabel(tab) })}
				title={m.feedTabsRemove({ name: feedTabLabel(tab) })}
				disabled={draft.length <= 1}
				onclick={() => remove(tab.id)}><Icon name="trash" size={16} /></button
			>
		{/snippet}
	</FeedTabSortList>

	<FeedTabPreview tabs={draft} />
</section>

{#if addOpen}
	<AddFeedTabDialog existing={draft} onadd={add} onclose={() => (addOpen = false)} />
{/if}
