<script lang="ts">
	import { untrack } from 'svelte';
	import type { EmojiView } from '$lib/api/types';
	import { displayEmojiName, searchAvailableBluemoji } from '$lib/atproto/bluemoji';
	import { i18n, m } from '$lib/i18n/i18n.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import {
		buildQuickReactionChoices,
		getPreparedCustomSuggestionPool,
		loadReactionUsage,
		prepareReactionPalette,
		reactionChoiceKey,
		recentReactionChoices,
		recordReactionUsage,
		SAFE_UNICODE_REACTIONS,
		type ReactionChoice,
	} from '$lib/emoji/reactionUsage';
	import { loadFavorites, saveFavorites } from '$lib/emoji/favorites';
	import {
		loadUnicodeEmojiIndex,
		searchUnicodeEmojis,
		type UnicodeEmoji,
	} from '$lib/emoji/unicodeSearch';
	import BluemojiMedia from './BluemojiMedia.svelte';
	import EmojiPicker from './EmojiPicker.svelte';
	import Icon from './shell/Icon.svelte';

	let {
		open = $bindable(false),
		anchor,
		select,
		close,
		ariaLabel = m.quickReactionAria(),
		choiceAriaLabel = (emoji: string) => m.reactWithAria({ emoji }),
	}: {
		open?: boolean;
		anchor?: HTMLElement;
		select: (emoji: string | EmojiView) => void;
		close?: () => void;
		ariaLabel?: string;
		choiceAriaLabel?: (emoji: string) => string;
	} = $props();

	let fullPickerOpen = $state(false);
	let failedCustomUris = $state<string[]>([]);
	let quickPickerStyle = $state('');
	let quickItems = $state<ReactionChoice[]>([]);
	let favorites = $state<ReactionChoice[]>([]);
	let recentItems = $state<ReactionChoice[]>([]);
	let quickQuery = $state('');
	let quickCustomResults = $state<EmojiView[]>([]);
	let quickSearchRequestId = 0;
	let unicodeIndex = $state<UnicodeEmoji[]>([]);
	let unicodeRequested = false;
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
		if (!open || fullPickerOpen) return;
		const usageSnapshot = untrack(loadReactionUsage);
		const failedSnapshot = untrack(() => failedCustomUris);
		const favoriteSnapshot = untrack(loadFavorites);
		const did = $session?.did;
		const preparedPool = did ? getPreparedCustomSuggestionPool(did) : undefined;
		const favoriteKeys = new Set(favoriteSnapshot.map(reactionChoiceKey));
		const localRecent = recentReactionChoices(usageSnapshot, QUICK_COLUMNS, failedSnapshot).filter(
			(item) => !favoriteKeys.has(reactionChoiceKey(item)),
		);
		quickQuery = '';
		favorites = favoriteSnapshot;
		recentItems = localRecent;
		quickItems =
			favoriteSnapshot.length || localRecent.length
				? []
				: buildQuickReactionChoices(usageSnapshot, preparedPool ?? [], failedSnapshot);
		// 開いている最中には候補を差し替えない。検証・候補取得結果は次回表示から使う。
		if (did)
			void prepareReactionPalette(did, usageSnapshot, favoriteSnapshot)
				.then((prepared) => saveFavorites(prepared.favorites))
				.catch(() => undefined);
	});

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
		return 16 + Math.max(body, QUICK_RESULTS_MAX) + 40 + 39;
	}

	$effect(() => {
		if (!open || !anchor || fullPickerOpen) return;
		const updatePosition = () => {
			const rect = anchor.getBoundingClientRect();
			const margin = 12;
			const width = Math.min(336, window.innerWidth - margin * 2);
			const left = Math.min(Math.max(margin, rect.left), window.innerWidth - margin - width);
			const estimatedHeight = estimateQuickHeight();
			const openAbove = rect.top > estimatedHeight + margin;
			const top = openAbove ? rect.top - estimatedHeight - 8 : rect.bottom + 8;
			quickPickerStyle = `top:${Math.max(margin, top)}px;left:${left}px;width:${width}px;`;
		};
		const handleKeydown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') closePalette();
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

	function closePalette() {
		open = false;
		fullPickerOpen = false;
		close?.();
		requestAnimationFrame(() => anchor?.focus());
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
		const remaining = quickItems.filter(notFailed);
		const used = new Set(remaining.map(reactionChoiceKey));
		const fallback = SAFE_UNICODE_REACTIONS.find((emoji) => !used.has(emoji));
		if (fallback) remaining.splice(failedIndex, 0, { kind: 'unicode', emoji: fallback });
		quickItems = remaining.slice(0, QUICK_COLUMNS);
	}

	function choose(emoji: string | EmojiView) {
		recordReactionUsage(loadReactionUsage(), emoji);
		select(emoji);
		closePalette();
	}
</script>

{#snippet quickChoice(item: ReactionChoice)}
	<button
		class="reaction-quick-item"
		aria-label={choiceAriaLabel(
			item.kind === 'custom' ? displayEmojiName(item.emoji.name) : item.emoji,
		)}
		onclick={() => choose(item.emoji)}
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

{#if open && anchor}
	{#if fullPickerOpen}
		<button class="emoji-picker-backdrop" aria-label={m.closeEmojiAria()} onclick={closePalette}
		></button>
		<EmojiPicker
			{anchor}
			select={choose}
			close={closePalette}
			{ariaLabel}
			{choiceAriaLabel}
			oncustomunavailable={markCustomUnavailable}
		/>
	{:else}
		<button class="reaction-picker-backdrop" aria-label={m.closeEmojiAria()} onclick={closePalette}
		></button>
		<div
			class="reaction-quick-picker"
			style={quickPickerStyle}
			role="dialog"
			aria-label={ariaLabel}
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
