<script lang="ts">
	import { getChannels, searchChannelsByQuery } from '$lib/api/appview';
	import type { ChannelView } from '$lib/api/types';
	import { rememberChannelLabel } from '$lib/feed-tabs/labels.svelte';
	import {
		builtinTabId,
		DEFAULT_SOURCE,
		newTabId,
		tabIdentity,
		type FeedTab,
		type FeedTabKind,
	} from '$lib/feed-tabs/types';
	import { m } from '$lib/i18n/i18n.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';

	/**
	 * タブの追加。種別を選ぶ1段目と、チャンネル選択／検索語入力の2段目からなる。
	 * 「リスト」「カスタム」は中身が1つずつしか無いので、種別を選んだ時点で確定する。
	 */
	let {
		existing,
		onadd,
		onclose,
	}: { existing: FeedTab[]; onadd: (tab: FeedTab) => void; onclose: () => void } = $props();

	type Step = 'kind' | 'channel' | 'search';
	let step = $state<Step>('kind');

	const taken = $derived(new Set(existing.map(tabIdentity)));

	const KINDS: { kind: FeedTabKind; label: () => string; hint: () => string; icon: string }[] = [
		{ kind: 'list', label: m.feedTabsKindList, hint: m.feedTabsKindListHint, icon: 'text' },
		{
			kind: 'global',
			label: m.feedTabsKindGlobal,
			hint: m.feedTabsKindGlobalHint,
			icon: 'language',
		},
		{ kind: 'custom', label: m.feedTabsKindCustom, hint: m.feedTabsKindCustomHint, icon: 'heart' },
		{
			kind: 'channel',
			label: m.feedTabsKindChannel,
			hint: m.feedTabsKindChannelHint,
			icon: 'hash',
		},
		{ kind: 'search', label: m.feedTabsKindSearch, hint: m.feedTabsKindSearchHint, icon: 'search' },
	];

	/** list / custom は中身が1つなので、既にあるなら選ばせない。 */
	const disabledKind = (kind: FeedTabKind) =>
		kind === 'channel' || kind === 'search'
			? false
			: taken.has(kind === 'global' ? 'global' : `${kind}:${DEFAULT_SOURCE[kind]}`);

	function pickKind(kind: FeedTabKind) {
		if (disabledKind(kind)) return;
		if (kind === 'channel') {
			step = 'channel';
			void loadChannels();
			return;
		}
		if (kind === 'search') {
			step = 'search';
			return;
		}
		const source = DEFAULT_SOURCE[kind];
		const tab: FeedTab = { id: kind, kind, ...(source ? { source } : {}) };
		// 組み込みタブは id を固定にして `/feed?tab=global` を端末間で安定させる。
		onadd({ ...tab, id: builtinTabId(tab) ?? kind });
	}

	// --- チャンネル選択 -------------------------------------------------------
	let channels = $state<ChannelView[]>([]);
	let channelsLoading = $state(false);
	let channelsError = $state('');
	let query = $state('');
	let searching = $state(false);

	/**
	 * 参加中とトレンドを合流させ、viewerSubscribed で二分する。
	 * 追加済みを上、それ以外を下に並べる。
	 */
	async function loadChannels() {
		if (channels.length || channelsLoading) return;
		channelsLoading = true;
		channelsError = '';
		try {
			const [subscribed, trending] = await Promise.all([
				$session
					? getChannels('list')
							.then((page) => page.channels)
							.catch(() => [] as ChannelView[])
					: Promise.resolve([] as ChannelView[]),
				getChannels('trend').then((page) => page.channels),
			]);
			const byUri = new Map<string, ChannelView>();
			for (const channel of [...subscribed, ...trending]) {
				const merged = { ...byUri.get(channel.uri), ...channel };
				byUri.set(channel.uri, merged);
			}
			channels = [...byUri.values()];
			for (const channel of channels) rememberChannelLabel(channel.uri, channel.name);
		} catch (error) {
			channelsError = error instanceof Error ? error.message : m.loadFailed();
		} finally {
			channelsLoading = false;
		}
	}

	async function runSearch() {
		const q = query.trim();
		if (!q) {
			channels = [];
			await loadChannels();
			return;
		}
		searching = true;
		channelsError = '';
		try {
			const page = await searchChannelsByQuery(q, undefined, 'exact');
			channels = page.channels;
			for (const channel of channels) rememberChannelLabel(channel.uri, channel.name);
		} catch (error) {
			channelsError = error instanceof Error ? error.message : m.loadFailed();
		} finally {
			searching = false;
		}
	}

	const subscribed = $derived(channels.filter((channel) => channel.viewerSubscribed));
	const others = $derived(channels.filter((channel) => !channel.viewerSubscribed));

	function pickChannel(channel: ChannelView) {
		rememberChannelLabel(channel.uri, channel.name);
		onadd({ id: newTabId('ch'), kind: 'channel', uri: channel.uri, label: channel.name });
	}

	// --- 検索タブ -------------------------------------------------------------
	let searchQuery = $state('');
	let searchKind = $state<'keyword' | 'tag'>('keyword');
	// 先頭に # を打った時点でタグ検索の意図とみなす。
	$effect(() => {
		if (/^[#＃]/.test(searchQuery)) {
			searchKind = 'tag';
			searchQuery = searchQuery.replace(/^[#＃]+/, '');
		}
	});
	const trimmedQuery = $derived(searchQuery.trim());
	const searchDuplicate = $derived(
		Boolean(trimmedQuery) && taken.has(`search:${searchKind}:${trimmedQuery.toLowerCase()}`),
	);

	function addSearch() {
		if (!trimmedQuery || searchDuplicate) return;
		onadd({
			id: newTabId('q'),
			kind: 'search',
			query: trimmedQuery,
			queryKind: searchKind,
			label: trimmedQuery,
		});
	}
</script>

<div class="draft-backdrop" role="presentation">
	<div class="draft-dialog" role="dialog" aria-modal="true" aria-label={m.feedTabsAdd()}>
		<h2>{m.feedTabsAdd()}</h2>

		{#if step === 'kind'}
			<ul class="feed-tab-kinds">
				{#each KINDS as option (option.kind)}
					<li>
						<button
							type="button"
							class="feed-tab-kind"
							disabled={disabledKind(option.kind)}
							onclick={() => pickKind(option.kind)}
						>
							<Icon name={option.icon} size={18} />
							<span class="feed-tab-kind-text">
								<strong>{option.label()}</strong>
								<small>{option.hint()}</small>
							</span>
						</button>
					</li>
				{/each}
			</ul>
		{:else if step === 'channel'}
			<button type="button" class="settings-back" onclick={() => (step = 'kind')}
				>← {m.feedTabsBackToKinds()}</button
			>
			<label class="field"
				>{m.feedTabsPickChannel()}
				<input
					bind:value={query}
					placeholder={m.searchPlaceholder()}
					onkeydown={(event) => event.key === 'Enter' && runSearch()}
				/>
			</label>
			{#if channelsLoading || searching}
				<div class="timeline-loading" role="status" aria-label={m.loading()}>
					<span class="spinner" aria-hidden="true"></span>
				</div>
			{:else if channelsError}
				<p class="error">{channelsError}</p>
			{:else}
				{#if subscribed.length}
					<h3 class="feed-tab-group">{m.feedTabsAddedChannels()}</h3>
					<ul class="feed-tab-channels">
						{#each subscribed as channel (channel.uri)}
							<li>
								<button
									type="button"
									disabled={taken.has(`channel:${channel.uri}`)}
									onclick={() => pickChannel(channel)}>{channel.name}</button
								>
							</li>
						{/each}
					</ul>
				{/if}
				{#if others.length}
					<h3 class="feed-tab-group">{m.feedTabsOtherChannels()}</h3>
					<ul class="feed-tab-channels">
						{#each others as channel (channel.uri)}
							<li>
								<button
									type="button"
									disabled={taken.has(`channel:${channel.uri}`)}
									onclick={() => pickChannel(channel)}>{channel.name}</button
								>
							</li>
						{/each}
					</ul>
				{/if}
				{#if !subscribed.length && !others.length}<p>{m.channelsEmpty()}</p>{/if}
			{/if}
		{:else}
			<button type="button" class="settings-back" onclick={() => (step = 'kind')}
				>← {m.feedTabsBackToKinds()}</button
			>
			<div class="feed-tab-search-kind" role="group" aria-label={m.feedTabsKindSearch()}>
				<button
					type="button"
					class:active={searchKind === 'keyword'}
					onclick={() => (searchKind = 'keyword')}>{m.feedTabsSearchKindKeyword()}</button
				>
				<button type="button" class:active={searchKind === 'tag'} onclick={() => (searchKind = 'tag')}
					>{m.feedTabsSearchKindTag()}</button
				>
			</div>
			<label class="field"
				>{m.feedTabsSearchLabel()}
				<input
					bind:value={searchQuery}
					maxlength="128"
					placeholder={m.feedTabsSearchPlaceholder()}
					onkeydown={(event) => event.key === 'Enter' && addSearch()}
				/>
				<small>{m.feedTabsSearchHint()}</small>
			</label>
			{#if searchDuplicate}<p class="error">{m.feedTabsDuplicate()}</p>{/if}
		{/if}

		<div class="delete-actions">
			<button type="button" class="ghost" onclick={onclose}>{m.cancel()}</button>
			{#if step === 'search'}
				<button type="button" class="primary" disabled={!trimmedQuery || searchDuplicate} onclick={addSearch}
					>{m.feedTabsAdd()}</button
				>
			{/if}
		</div>
	</div>
</div>
