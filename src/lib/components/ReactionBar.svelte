<script lang="ts">
	import type { ActorView, EmojiView, ReactionView } from '$lib/api/types';
	import { session } from '$lib/oauth/session.svelte';
	import { createReaction, deleteRecord } from '$lib/atproto/records';
	import { displayEmojiName, searchAvailableBluemoji } from '$lib/atproto/bluemoji';
	import { myProfile } from '$lib/profile/me.svelte';
	import EmojiPicker from './EmojiPicker.svelte';
	import Avatar from './Avatar.svelte';
	import { i18n, m } from '$lib/i18n/i18n.svelte';
	import Icon from './shell/Icon.svelte';
	import { onMount, untrack } from 'svelte';
	import {
		buildQuickReactionChoices,
		loadCustomSuggestionPool,
		loadReactionUsage,
		reactionChoiceKey,
		recentReactionChoices,
		recordReactionUsage,
		refreshReactionUsage,
		SAFE_UNICODE_REACTIONS,
		type ReactionChoice,
		type ReactionUsage,
	} from '$lib/emoji/reactionUsage';
	import { loadFavorites, refreshFavorites } from '$lib/emoji/favorites';
	import BluemojiMedia from './BluemojiMedia.svelte';
	import {
		loadUnicodeEmojiIndex,
		searchUnicodeEmojis,
		type UnicodeEmoji,
	} from '$lib/emoji/unicodeSearch';
	let {
		uri,
		cid,
		reactions = [],
		pickerOpen = $bindable(false),
		pickerAnchor,
	}: {
		uri: string;
		cid: string;
		reactions?: ReactionView[];
		pickerOpen?: boolean;
		pickerAnchor?: HTMLElement;
	} = $props();
	const REACTION = 'com.suibari.nagi.reaction';
	// The appview only learns about reactions via jetstream (a few seconds behind),
	// so we keep an optimistic local copy and ignore prop-driven resets for a while
	// after a local toggle — otherwise the next feed refresh would undo the click.
	const HOLD_MS = 15_000;
	// svelte-ignore state_referenced_locally -- initial snapshot; kept in sync by the $effect below
	let local = $state<ReactionView[]>([...reactions]);
	let holdUntil = 0;
	let busy = $state(false);
	let fullPickerOpen = $state(false);
	let usage = $state<ReactionUsage[]>([]);
	let failedCustomUris = $state<string[]>([]);
	let quickPickerStyle = $state('');
	let quickItems = $state<ReactionChoice[]>([]);
	let quickLoading = $state(false);
	let pickerGeneration = 0;
	let favorites = $state<ReactionChoice[]>([]);
	let recentItems = $state<ReactionChoice[]>([]);
	let quickQuery = $state('');
	let customPool = $state<EmojiView[]>([]);
	let quickCustomResults = $state<EmojiView[]>([]);
	let quickSearchRequestId = 0;
	let unicodeIndex = $state<UnicodeEmoji[]>([]);
	let unicodeRequested = false;
	// クイックパレットは1行6マス。お気に入りは最大3行まで見せて、あふれた分はスクロール。
	const QUICK_COLUMNS = 6;
	const QUICK_MAX_FAVORITE_ROWS = 3;
	const quickSearching = $derived(quickQuery.trim().length > 0);
	const quickResults = $derived.by(() => {
		const q = quickQuery.trim();
		if (!q) return [] as ReactionChoice[];
		const custom: ReactionChoice[] = quickCustomResults
			.filter((emoji) => !failedCustomUris.includes(emoji.uri))
			.slice(0, 12)
			.map((emoji) => ({ kind: 'custom', emoji }));
		const unicode: ReactionChoice[] = searchUnicodeEmojis(unicodeIndex, q, 24).map((item) => ({
			kind: 'unicode',
			emoji: item.emoji,
		}));
		return [...custom, ...unicode];
	});
	// 本人分はPDSキャッシュ、他ユーザー分はAppViewへ問い合わせる。
	// Unicode索引は従来どおりクライアント内で検索する。
	$effect(() => {
		const q = quickQuery.trim();
		const requestId = ++quickSearchRequestId;
		quickCustomResults = [];
		if (!q) return;
		const timer = setTimeout(async () => {
			try {
				const result = await searchAvailableBluemoji({ q, limit: 12 });
				if (requestId === quickSearchRequestId) quickCustomResults = result.emojis;
			} catch {
				// Unicode検索は継続する。次の入力でBluemoji検索を再試行する。
			}
		}, 250);
		return () => clearTimeout(timer);
	});
	onMount(() => {
		usage = loadReactionUsage();
	});
	// 検索データ（ja+en）は初回入力時にだけ取りに行く。
	async function ensureUnicodeIndex() {
		if (unicodeRequested) return;
		unicodeRequested = true;
		try {
			unicodeIndex = await loadUnicodeEmojiIndex(i18n.locale);
		} catch {
			unicodeRequested = false;
		}
	}
	$effect(() => {
		const incoming = reactions;
		if (Date.now() >= holdUntil) local = [...incoming];
	});
	$effect(() => {
		if (!pickerOpen || fullPickerOpen) return;
		const generation = ++pickerGeneration;
		const usageSnapshot = untrack(loadReactionUsage);
		const failedSnapshot = untrack(() => failedCustomUris);
		const favoriteSnapshot = untrack(loadFavorites);
		quickQuery = '';
		favorites = [];
		recentItems = [];
		quickItems = [];
		quickLoading = true;
		void Promise.all([
			refreshReactionUsage(usageSnapshot),
			refreshFavorites(favoriteSnapshot),
			loadCustomSuggestionPool(),
		]).then(([refreshedUsage, refreshedFavorites, pool]) => {
			if (generation !== pickerGeneration || !pickerOpen || fullPickerOpen) return;
			const favoriteKeys = new Set(refreshedFavorites.map(reactionChoiceKey));
			const refreshedRecent = recentReactionChoices(
				refreshedUsage,
				QUICK_COLUMNS,
				failedSnapshot,
			).filter((item) => !favoriteKeys.has(reactionChoiceKey(item)));
			const empty = refreshedFavorites.length === 0 && refreshedRecent.length === 0;
			usage = refreshedUsage;
			favorites = refreshedFavorites;
			recentItems = refreshedRecent;
			customPool = pool;
			if (empty) quickItems = buildQuickReactionChoices(refreshedUsage, pool, failedSnapshot);
			quickLoading = false;
		});
		return () => {
			pickerGeneration += 1;
		};
	});
	// 検索中も高さが変わらないよう、結果欄の最大高さ（3行分）を下限に見積もる。
	const QUICK_CELL = 42;
	const QUICK_LABEL = 17;
	const QUICK_RESULTS_MAX = QUICK_CELL * 3;
	function estimateQuickHeight() {
		const favoriteRows = favorites.length
			? Math.min(Math.ceil(favorites.length / QUICK_COLUMNS), QUICK_MAX_FAVORITE_ROWS)
			: 0;
		const recentRows = recentItems.length || quickItems.length ? 1 : 0;
		const labels = (favoriteRows ? QUICK_LABEL : 0) + (recentItems.length ? QUICK_LABEL : 0);
		const body = labels + (favoriteRows + recentRows) * QUICK_CELL;
		// padding(16) + 本体 + 検索欄(40) + すべて見る(39)
		return 16 + Math.max(body, QUICK_RESULTS_MAX) + 40 + 39;
	}
	$effect(() => {
		if (!pickerOpen || !pickerAnchor || fullPickerOpen) return;
		const updatePosition = () => {
			const rect = pickerAnchor.getBoundingClientRect();
			const margin = 12;
			const width = Math.min(336, window.innerWidth - margin * 2);
			const left = Math.min(Math.max(margin, rect.left), window.innerWidth - margin - width);
			const estimatedHeight = estimateQuickHeight();
			const openAbove = rect.top > estimatedHeight + margin;
			const top = openAbove ? rect.top - estimatedHeight - 8 : rect.bottom + 8;
			quickPickerStyle = `top:${Math.max(margin, top)}px;left:${left}px;width:${width}px;`;
		};
		const handleKeydown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') closePicker();
		};
		updatePosition();
		window.addEventListener('resize', updatePosition);
		window.addEventListener('scroll', updatePosition, true);
		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('resize', updatePosition);
			window.removeEventListener('scroll', updatePosition, true);
			window.removeEventListener('keydown', handleKeydown);
		};
	});
	const rkeyOf = (u?: string) => u?.split('/').pop();
	// カスタム絵文字は同じ :name: でも作者ごとに別物なので、item の URI で区別する。
	const keyOf = (reaction: ReactionView) => reaction.bluemoji?.uri ?? reaction.emoji;
	const reactedByViewer = (reaction: ReactionView) =>
		reaction.reactedByMe ||
		Boolean($session?.did && reaction.reactors.some((actor) => actor.did === $session?.did));
	const labelOf = (reaction: ReactionView) =>
		reaction.bluemoji ? displayEmojiName(reaction.bluemoji.name) : reaction.emoji;
	function closePicker() {
		pickerOpen = false;
		fullPickerOpen = false;
		requestAnimationFrame(() => pickerAnchor?.focus());
	}
	function markCustomUnavailable(uri: string) {
		if (!failedCustomUris.includes(uri)) failedCustomUris = [...failedCustomUris, uri];
		const notFailed = (item: ReactionChoice) => item.kind !== 'custom' || item.emoji.uri !== uri;
		favorites = favorites.filter(notFailed);
		recentItems = recentItems.filter(notFailed);
		const failedIndex = quickItems.findIndex(
			(item) => item.kind === 'custom' && item.emoji.uri === uri,
		);
		if (failedIndex < 0) return;
		const remaining = quickItems.filter((item) => item.kind !== 'custom' || item.emoji.uri !== uri);
		const used = new Set(remaining.map(reactionChoiceKey));
		const fallback = SAFE_UNICODE_REACTIONS.find((emoji) => !used.has(emoji));
		if (!fallback) {
			quickItems = remaining;
			return;
		}
		remaining.splice(failedIndex, 0, { kind: 'unicode', emoji: fallback });
		quickItems = remaining.slice(0, 6);
	}
	async function toggle(raw: string | EmojiView) {
		if (!$session) {
			location.href = '/login';
			return;
		}
		if (busy) return;
		pickerOpen = false;
		fullPickerOpen = false;
		const custom = typeof raw === 'string' ? undefined : raw;
		const emoji = custom ? custom.name : (raw as string).normalize('NFC');
		const key = custom ? custom.uri : emoji;
		const existing = local.find((r) => keyOf(r) === key);
		const snapshot = local.map((r) => ({ ...r, reactors: [...r.reactors] }));
		const viewerDid = $session.did;
		// 楽観表示用の自分。AppView が追いつくまでの間もアバターを出したいので、
		// 同じ投稿の既存リアクター → 自分のプロフィール → DIDだけ、の順で埋める。
		const viewer =
			local.flatMap((reaction) => reaction.reactors).find((actor) => actor.did === viewerDid) ??
			(myProfile.current?.did === viewerDid
				? ({
						did: viewerDid,
						handle: myProfile.current.handle,
						displayName: myProfile.current.displayName,
						avatar: myProfile.current.avatar,
					} satisfies ActorView)
				: ({ did: viewerDid, handle: viewerDid } satisfies ActorView));
		busy = true;
		holdUntil = Date.now() + HOLD_MS;
		try {
			if (existing && reactedByViewer(existing)) {
				const rkey = rkeyOf(existing.viewerReactionUri);
				if (!rkey) return;
				local = local
					.map((r) =>
						keyOf(r) === key
							? {
									...r,
									reactors: r.reactors.filter((actor) => actor.did !== viewerDid),
									reactedByMe: false,
									viewerReactionUri: undefined,
								}
							: r,
					)
					.filter((r) => r.reactors.length > 0 || r.hasMoreReactors);
				await deleteRecord(REACTION, rkey);
			} else {
				local = existing
					? local.map((r) =>
							keyOf(r) === key
								? {
										...r,
										reactors: [
											viewer,
											...r.reactors.filter((actor) => actor.did !== viewerDid),
										].slice(0, 5),
										hasMoreReactors: r.hasMoreReactors || r.reactors.length >= 5 || undefined,
										reactedByMe: true,
									}
								: r,
						)
					: [
							...local,
							{
								emoji,
								...(custom ? { bluemoji: custom } : {}),
								reactors: [viewer],
								reactedByMe: true,
							},
						];
				const res = await createReaction({ uri, cid }, custom ?? emoji);
				usage = recordReactionUsage(loadReactionUsage(), raw);
				local = local.map((r) =>
					keyOf(r) === key ? { ...r, viewerReactionUri: res.data.uri } : r,
				);
			}
		} catch {
			local = snapshot;
		} finally {
			busy = false;
		}
	}
</script>

{#snippet quickChoice(item: ReactionChoice)}
	<button
		class="reaction-quick-item"
		aria-label={m.reactWithAria({
			emoji: item.kind === 'custom' ? displayEmojiName(item.emoji.name) : item.emoji,
		})}
		onclick={() => toggle(item.emoji)}
	>
		{#if item.kind === 'custom'}
			<BluemojiMedia
				emoji={item.emoji}
				onunavailable={() => markCustomUnavailable(item.emoji.uri)}
			/>
		{:else}
			{item.emoji}
		{/if}
	</button>
{/snippet}

{#if local.length}
	<div class="reactions">
		{#each local as reaction (keyOf(reaction))}
			<div class="reaction-group">
				<button
					class="reaction-emoji"
					class:active={reactedByViewer(reaction)}
					aria-pressed={reactedByViewer(reaction)}
					aria-label={m.reactWithAria({ emoji: labelOf(reaction) })}
					onclick={() => toggle(reaction.bluemoji ?? reaction.emoji)}
				>
					{#if reaction.bluemoji}
						<BluemojiMedia class="reaction-image" emoji={reaction.bluemoji} />
					{:else}
						{reaction.emoji}
					{/if}
				</button>
				<div class="reaction-actors">
					{#each reaction.reactors as actor (actor.did)}
						<a
							class="reaction-avatar"
							href={`/profile/${actor.did}`}
							aria-label={m.viewProfileOfAria({ name: actor.displayName ?? actor.handle })}
							title={actor.displayName ?? actor.handle}><Avatar {actor} size="small" /></a
						>
					{/each}
					{#if reaction.hasMoreReactors}<span
							class="reaction-more"
							aria-label={m.moreReactorsAria()}>…</span
						>{/if}
				</div>
			</div>
		{/each}
	</div>
{/if}

{#if pickerOpen && pickerAnchor}
	{#if fullPickerOpen}
		<button class="emoji-picker-backdrop" aria-label={m.closeEmojiAria()} onclick={closePicker}
		></button>
		<EmojiPicker
			anchor={pickerAnchor}
			select={toggle}
			close={closePicker}
			oncustomunavailable={markCustomUnavailable}
		/>
	{:else}
		<button class="reaction-picker-backdrop" aria-label={m.closeEmojiAria()} onclick={closePicker}
		></button>
		<div
			class="reaction-quick-picker"
			style={quickPickerStyle}
			role="dialog"
			aria-label={m.quickReactionAria()}
			aria-busy={quickLoading}
		>
			{#if quickSearching}
				<div class="reaction-quick-results">
					{#if quickResults.length}
						<div class="reaction-quick-grid">
							{#each quickResults as item (reactionChoiceKey(item))}{@render quickChoice(
									item,
								)}{/each}
						</div>
					{:else}
						<p class="reaction-quick-empty">{m.emojiUnicodeEmpty()}</p>
					{/if}
				</div>
			{:else if quickLoading}
				<div class="reaction-quick-loading" role="status">{m.loading()}</div>
			{:else}
				{#if favorites.length}
					<div class="reaction-quick-section">
						<span class="reaction-quick-label">{m.quickReactionFavorites()}</span>
						<div class="reaction-quick-grid reaction-quick-favorites">
							{#each favorites as item (reactionChoiceKey(item))}{@render quickChoice(item)}{/each}
						</div>
					</div>
				{/if}
				{#if recentItems.length}
					<div class="reaction-quick-section">
						<span class="reaction-quick-label">{m.quickReactionRecent()}</span>
						<div class="reaction-quick-grid">
							{#each recentItems as item (reactionChoiceKey(item))}{@render quickChoice(
									item,
								)}{/each}
						</div>
					</div>
				{:else if quickItems.length}
					<div class="reaction-quick-section">
						<div class="reaction-quick-grid">
							{#each quickItems as item (reactionChoiceKey(item))}{@render quickChoice(item)}{/each}
						</div>
					</div>
				{/if}
			{/if}
			<input
				class="reaction-quick-search"
				type="search"
				bind:value={quickQuery}
				oninput={ensureUnicodeIndex}
				placeholder={m.emojiSearchLabel()}
				aria-label={m.emojiSearchLabel()}
			/>
			<button class="reaction-show-all" onclick={() => (fullPickerOpen = true)}>
				<Icon name="emoji" size={17} />
				<span>{m.showAllReactions()}</span>
			</button>
		</div>
	{/if}
{/if}
