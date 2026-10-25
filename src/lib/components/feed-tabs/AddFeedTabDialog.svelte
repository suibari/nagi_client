<script lang="ts">
	import {
		builtinTabId,
		DEFAULT_SOURCE,
		MAX_TAB_LABEL_LENGTH,
		MAX_TAB_QUERY_LENGTH,
		newTabId,
		tabIdentity,
		type FeedTab,
		type FeedTabKind,
	} from '$lib/feed-tabs/types';
	import { m } from '$lib/i18n/i18n.svelte';
	import { normalizeTag } from '$lib/tags';
	import Icon from '$lib/components/shell/Icon.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { getSavedBskyFeeds, lookupBskyFeed, type BskyFeedGenerator } from '$lib/bsky/agent';
	import { markCrosspostPending } from '$lib/crosspost/preferences';
	import { grantedOptIns, hasBlueskyViewScope } from '$lib/optin/scope-optin';
	import { session, signIn } from '$lib/oauth/session.svelte';

	/**
	 * タブの追加。種別を選ぶ1段目と、タグ／検索語入力／Bluesky フィード選択の2段目からなる。
	 * 「リスト」「カスタム」は中身が1つずつしか無いので、種別を選んだ時点で確定する。
	 */
	let {
		existing,
		onadd,
		onclose,
	}: { existing: FeedTab[]; onadd: (tab: FeedTab) => void; onclose: () => void } = $props();

	type Step = 'kind' | 'hashtag' | 'search' | 'bsky';
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
		// Bluesky のフィードは Nagi の外の中身なので最後に置く。ログインしていないと読めない。
		...($session
			? [
					{
						kind: 'bsky' as const,
						label: m.feedTabsKindBsky,
						hint: m.feedTabsKindBskyHint,
						icon: 'bluesky',
					},
				]
			: []),
	];

	/** list / custom は中身が1つなので、既にあるなら選ばせない。 */
	const disabledKind = (kind: FeedTabKind) =>
		kind === 'hashtag' || kind === 'search' || kind === 'bsky'
			? false
			: taken.has(kind === 'global' ? 'global' : `${kind}:${DEFAULT_SOURCE[kind]}`);

	function pickKind(kind: FeedTabKind) {
		if (disabledKind(kind)) return;
		if (kind === 'hashtag' || kind === 'search') {
			step = kind;
			return;
		}
		if (kind === 'bsky') {
			step = kind;
			void openBsky();
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

	// --- Bluesky フィードタブ ---------------------------------------------------
	// 権限は Bluesky 連携（クロスポストと同じオプトイン）で付く。無ければ再認可へ案内する。
	let bskyGranted = $state<boolean>();
	let savedFeeds = $state<BskyFeedGenerator[]>();
	let savedFeedsFailed = $state(false);
	let bskyReauthorizing = $state(false);
	let feedInput = $state('');
	let lookingUp = $state(false);
	let lookupError = $state('');

	async function openBsky() {
		bskyGranted = await hasBlueskyViewScope();
		if (!bskyGranted) return;
		try {
			savedFeeds = await getSavedBskyFeeds();
		} catch (error) {
			console.warn('[AddFeedTabDialog] saved feeds failed', error);
			savedFeedsFailed = true;
			savedFeeds = [];
		}
	}

	async function reauthorizeBsky() {
		if (!$session || bskyReauthorizing) return;
		bskyReauthorizing = true;
		markCrosspostPending();
		try {
			await signIn($session.did, { ...(await grantedOptIns()), crosspost: true });
		} finally {
			bskyReauthorizing = false;
		}
	}

	const feedTaken = (uri: string) => taken.has(`bsky:${uri}`);
	const followingTaken = $derived(taken.has('bsky:following'));

	/** Bluesky のホームタイムライン（フォロー中）。保存済みフィードとは別に、いつでも選べる。 */
	function addFollowing() {
		if (followingTaken) return;
		onadd({ id: newTabId('bsky'), kind: 'bsky', source: 'following' });
	}

	function addBsky(feed: BskyFeedGenerator) {
		if (feedTaken(feed.uri)) return;
		onadd({
			id: newTabId('bsky'),
			kind: 'bsky',
			uri: feed.uri,
			label: feed.displayName.slice(0, MAX_TAB_LABEL_LENGTH),
		});
	}

	async function addFromInput() {
		if (!feedInput.trim() || lookingUp) return;
		lookingUp = true;
		lookupError = '';
		try {
			const feed = await lookupBskyFeed(feedInput);
			if (!feed) lookupError = m.bskyFeedNotFound();
			else if (feedTaken(feed.uri)) lookupError = m.feedTabsDuplicate();
			else addBsky(feed);
		} catch (error) {
			console.warn('[AddFeedTabDialog] feed lookup failed', error);
			lookupError = m.bskyFeedNotFound();
		} finally {
			lookingUp = false;
		}
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
		{:else if step === 'bsky'}
			<button type="button" class="settings-back" onclick={() => (step = 'kind')}
				>← {m.feedTabsBackToKinds()}</button
			>
			{#if bskyGranted === undefined}
				<Spinner />
			{:else if !bskyGranted}
				<p>{m.bskyFeedNeedsPermission()}</p>
				<button type="button" disabled={bskyReauthorizing} onclick={reauthorizeBsky}
					>{#if bskyReauthorizing}<Spinner inline size="sm" decorative />{/if}{bskyReauthorizing
						? m.crosspostReauthPending()
						: m.crosspostReauthSubmit()}</button
				>
			{:else}
				<ul class="feed-tab-kinds bsky-following">
					<li>
						<button
							type="button"
							class="feed-tab-kind"
							disabled={followingTaken}
							onclick={addFollowing}
						>
							<Icon name="home" size={18} />
							<span class="feed-tab-kind-text">
								<strong>{m.feedTabsBskyFollowing()}</strong>
								<small>{m.feedTabsBskyFollowingHint()}</small>
							</span>
						</button>
					</li>
				</ul>
				<p class="bsky-section-label">{m.bskyFeedSavedLabel()}</p>
				{#if savedFeeds === undefined}
					<Spinner size="sm" />
				{:else if savedFeedsFailed}
					<p class="error">{m.bskyFeedLoadFailed()}</p>
				{:else if !savedFeeds.length}
					<p>{m.bskyFeedNoSaved()}</p>
				{:else}
					<ul class="feed-tab-kinds bsky-saved-feeds">
						{#each savedFeeds as feed (feed.uri)}
							<li>
								<button
									type="button"
									class="feed-tab-kind"
									disabled={feedTaken(feed.uri)}
									onclick={() => addBsky(feed)}
								>
									<Avatar
										actor={{ displayName: feed.displayName, avatar: feed.avatar }}
										size="small"
									/>
									<span class="feed-tab-kind-text">
										<strong>{feed.displayName}</strong>
										<small>@{feed.creator.handle}</small>
									</span>
								</button>
							</li>
						{/each}
					</ul>
				{/if}
				<label class="field"
					>{m.bskyFeedUrlLabel()}
					<input
						bind:value={feedInput}
						placeholder="https://bsky.app/profile/…/feed/…"
						onkeydown={(event) => event.key === 'Enter' && addFromInput()}
					/>
					<small>{m.bskyFeedUrlHint()}</small>
				</label>
				{#if lookupError}<p class="error">{lookupError}</p>{/if}
			{/if}
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
			{:else if step === 'bsky' && bskyGranted}
				<button
					type="button"
					class="primary"
					disabled={!feedInput.trim() || lookingUp}
					aria-busy={lookingUp}
					onclick={addFromInput}
					>{#if lookingUp}<Spinner inline size="sm" decorative />{/if}{m.feedTabsAdd()}</button
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

<style>
	/*
	 * ダイアログは max-height 付きの縦 flex。.feed-tab-kinds は overflow を持つので、
	 * あふれると高さ0近くまで縮められる。フォロー中の1件は縮めず、あふれた分は
	 * 保存済み一覧（.bsky-saved-feeds）のスクロールだけで受け持つ。
	 */
	.bsky-following {
		flex-shrink: 0;
		max-height: none;
		overflow: visible;
	}
	.bsky-section-label {
		margin: 0;
		color: var(--text-muted);
		font-size: 0.88rem;
	}
</style>
