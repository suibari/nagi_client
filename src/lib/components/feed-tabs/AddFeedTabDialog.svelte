<script lang="ts">
	import {
		builtinTabId,
		DEFAULT_SOURCE,
		MAX_TAB_QUERY_LENGTH,
		newTabId,
		tabIdentity,
		type FeedTab,
		type FeedTabKind,
	} from '$lib/feed-tabs/types';
	import { m } from '$lib/i18n/i18n.svelte';
	import { normalizeTag } from '$lib/tags';
	import Icon from '$lib/components/shell/Icon.svelte';

	/**
	 * タブの追加。種別を選ぶ1段目と、タグ／検索語入力の2段目からなる。
	 * 「リスト」「カスタム」は中身が1つずつしか無いので、種別を選んだ時点で確定する。
	 */
	let {
		existing,
		onadd,
		onclose,
	}: { existing: FeedTab[]; onadd: (tab: FeedTab) => void; onclose: () => void } = $props();

	type Step = 'kind' | 'hashtag' | 'search';
	let step = $state<Step>('kind');

	const taken = $derived(new Set(existing.map(tabIdentity)));

	// 検索は自由文だけに絞ったので、迷いやすい検索を一番下に置く。
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
			kind: 'hashtag',
			label: m.feedTabsKindHashtag,
			hint: m.feedTabsKindHashtagHint,
			icon: 'hash',
		},
		{ kind: 'search', label: m.feedTabsKindSearch, hint: m.feedTabsKindSearchHint, icon: 'search' },
	];

	/** list / custom は中身が1つなので、既にあるなら選ばせない。 */
	const disabledKind = (kind: FeedTabKind) =>
		kind === 'hashtag' || kind === 'search'
			? false
			: taken.has(kind === 'global' ? 'global' : `${kind}:${DEFAULT_SOURCE[kind]}`);

	function pickKind(kind: FeedTabKind) {
		if (disabledKind(kind)) return;
		if (kind === 'hashtag' || kind === 'search') {
			step = kind;
			return;
		}
		const source = DEFAULT_SOURCE[kind];
		const tab: FeedTab = { id: kind, kind, ...(source ? { source } : {}) };
		// 組み込みタブは id を固定にして `/feed?tab=global` を端末間で安定させる。
		onadd({ ...tab, id: builtinTabId(tab) ?? kind });
	}

	// --- ハッシュタグタブ -----------------------------------------------------
	let tagQuery = $state('');
	const tag = $derived(normalizeTag(tagQuery));
	const tagDuplicate = $derived(Boolean(tag) && taken.has(`hashtag:${tag}`));

	function addHashtag() {
		if (!tag || tagDuplicate) return;
		onadd({ id: newTabId('tag'), kind: 'hashtag', query: tag });
	}

	// --- 検索タブ -------------------------------------------------------------
	let searchQuery = $state('');
	// 検索は自由文だけ。先頭に # を打ったらタグの意図とみなし、ハッシュタグの入力へ移す。
	$effect(() => {
		if (/^[#＃]/.test(searchQuery)) {
			tagQuery = searchQuery;
			searchQuery = '';
			step = 'hashtag';
		}
	});
	const trimmedQuery = $derived(searchQuery.trim());
	const searchDuplicate = $derived(
		Boolean(trimmedQuery) && taken.has(`search:${trimmedQuery.toLowerCase()}`),
	);

	function addSearch() {
		if (!trimmedQuery || searchDuplicate) return;
		onadd({ id: newTabId('q'), kind: 'search', query: trimmedQuery, label: trimmedQuery });
	}
</script>

<!-- 背景クリックで閉じる。アプリの他のモーダルと同じ扱い。 -->
<div
	class="draft-backdrop"
	role="presentation"
	onclick={(event) => event.target === event.currentTarget && onclose()}
>
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
		{:else if step === 'hashtag'}
			<button type="button" class="settings-back" onclick={() => (step = 'kind')}
				>← {m.feedTabsBackToKinds()}</button
			>
			<label class="field"
				>{m.feedTabsHashtagLabel()}
				<input
					bind:value={tagQuery}
					maxlength={MAX_TAB_QUERY_LENGTH}
					placeholder={m.feedTabsHashtagPlaceholder()}
					onkeydown={(event) => event.key === 'Enter' && addHashtag()}
				/>
				<small>{m.feedTabsHashtagHint()}</small>
			</label>
			{#if tagDuplicate}<p class="error">{m.feedTabsDuplicate()}</p>{/if}
		{:else}
			<button type="button" class="settings-back" onclick={() => (step = 'kind')}
				>← {m.feedTabsBackToKinds()}</button
			>
			<label class="field"
				>{m.feedTabsSearchLabel()}
				<input
					bind:value={searchQuery}
					maxlength={MAX_TAB_QUERY_LENGTH}
					placeholder={m.feedTabsSearchPlaceholder()}
					onkeydown={(event) => event.key === 'Enter' && addSearch()}
				/>
				<small>{m.feedTabsSearchHint()}</small>
			</label>
			{#if searchDuplicate}<p class="error">{m.feedTabsDuplicate()}</p>{/if}
		{/if}

		<div class="delete-actions">
			<button type="button" class="ghost" onclick={onclose}>{m.cancel()}</button>
			{#if step === 'hashtag'}
				<button type="button" class="primary" disabled={!tag || tagDuplicate} onclick={addHashtag}
					>{m.feedTabsAdd()}</button
				>
			{:else if step === 'search'}
				<button
					type="button"
					class="primary"
					disabled={!trimmedQuery || searchDuplicate}
					onclick={addSearch}>{m.feedTabsAdd()}</button
				>
			{/if}
		</div>
	</div>
</div>
