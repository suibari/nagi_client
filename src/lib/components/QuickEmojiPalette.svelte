<script lang="ts">
	import { untrack } from 'svelte';
	import { portal } from '$lib/actions/portal';
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
	import {
		favoritesFull,
		insertFavorite,
		loadFavorites,
		removeFavorite,
		saveFavorites,
	} from '$lib/emoji/favorites';
	import { createEmojiDrag } from '$lib/emoji/emojiDrag.svelte';
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
	const dragHintId = $props.id();
	let flashKey = $state<string>();
	let announcement = $state('');
	let finePointer = $state(false);
	// ドラッグでお気に入りを編集したら、開いた時点のスナップショットで
	// localStorage を上書きさせない（下の prepareReactionPalette 参照）。
	let favoritesDirty = false;
	const QUICK_COLUMNS = 6;
	const QUICK_MIN_COLUMNS = 3;
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
		favoritesDirty = false;
		flashKey = undefined;
		announcement = '';
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
				.then((prepared) => {
					// ドラッグで編集した後は、開いた時点のスナップショットで巻き戻さない。
					if (favoritesDirty) return;
					saveFavorites(prepared.favorites);
				})
				.catch(() => undefined);
	});

	// Shift+クリックのヒントとドラッグは、マウス相当のポインタを持つ端末だけの機能。
	// この $effect は位置計算より先に宣言する（estimateQuickHeight がヒント行の
	// 高さを見込むため、初回の推定に間に合わせる必要がある）。
	$effect(() => {
		const query = window.matchMedia('(hover: hover) and (pointer: fine)');
		const apply = () => (finePointer = query.matches);
		apply();
		query.addEventListener('change', apply);
		return () => query.removeEventListener('change', apply);
	});

	const QUICK_CELL = 42;
	const QUICK_LABEL = 17;
	const QUICK_HINT = 21;
	const QUICK_RESULTS_MAX = QUICK_CELL * 3;
	function estimateQuickHeight(columns: number) {
		const favoriteRows = favorites.length
			? Math.min(Math.ceil(favorites.length / columns), QUICK_MAX_FAVORITE_ROWS)
			: 0;
		const recentCount = recentItems.length || quickItems.length;
		const recentRows = recentCount ? Math.ceil(recentCount / columns) : 0;
		const labels = (favoriteRows ? QUICK_LABEL : 0) + (recentItems.length ? QUICK_LABEL : 0);
		const body = labels + (favoriteRows + recentRows) * QUICK_CELL;
		return 16 + Math.max(body, QUICK_RESULTS_MAX) + (finePointer ? QUICK_HINT : 0) + 40 + 39;
	}

	$effect(() => {
		if (!open || !anchor || fullPickerOpen) return;
		const updatePosition = () => {
			const rect = anchor.getBoundingClientRect();
			const margin = 12;
			const width = Math.min(336, window.innerWidth - margin * 2);
			const innerWidth = Math.max(0, width - 18);
			const columns = Math.max(
				QUICK_MIN_COLUMNS,
				Math.min(QUICK_COLUMNS, Math.floor((innerWidth + 4) / 38)),
			);
			const left = Math.min(Math.max(margin, rect.left), window.innerWidth - margin - width);
			const estimatedHeight = estimateQuickHeight(columns);
			const openAbove = rect.top > estimatedHeight + margin;
			const top = openAbove ? rect.top - estimatedHeight - 8 : rect.bottom + 8;
			quickPickerStyle = `top:${Math.max(margin, top)}px;left:${left}px;width:${width}px;--quick-columns:${columns};`;
		};
		const handleKeydown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') closePalette();
		};
		// ドラッグでお気に入りの行数が変わるたびにポップオーバーが跳ねないよう、
		// 初回の測定は追跡しない。代わりに開き直すまで位置は固定される。
		untrack(updatePosition);
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

	/** keepOpen は Shift+クリック。Discord と同じく閉じずに続けて選べる。 */
	function choose(emoji: string | EmojiView, keepOpen = false) {
		recordReactionUsage(loadReactionUsage(), emoji);
		select(emoji);
		if (!keepOpen) {
			closePalette();
			return;
		}
		// 同じタイルを連打してもアニメを再生し直すため、いったん外してから付け直す。
		const key = reactionChoiceKey(
			typeof emoji === 'string' ? { kind: 'unicode', emoji } : { kind: 'custom', emoji },
		);
		flashKey = undefined;
		requestAnimationFrame(() => (flashKey = key));
	}

	type DragSource = 'favorites' | 'recent' | 'quick' | 'search';
	type DragPayload = { source: DragSource; choice: ReactionChoice; index: number };

	const drag = createEmojiDrag<DragPayload>({ onDrop: applyDrop });
	const labelOf = (choice: ReactionChoice) =>
		choice.kind === 'custom' ? displayEmojiName(choice.emoji.name) : choice.emoji;

	function commitFavorites(next: ReactionChoice[]) {
		favoritesDirty = true;
		favorites = next;
	}

	/**
	 * 「最近使った」からお気に入りへはコピー（履歴 localStorage は触らない）。
	 * お気に入りからバーへドロップすると外す。お気に入り同士は並び替え。
	 */
	function applyDrop(payload: DragPayload, zone: { kind: string; index?: number } | undefined) {
		if (!zone) return;
		const { choice, source } = payload;
		const key = reactionChoiceKey(choice);
		if (source === 'favorites') {
			if (zone.kind === 'bar') {
				commitFavorites(removeFavorite(favorites, key));
				announcement = m.emojiFavoriteRemoved({ emoji: labelOf(choice) });
				return;
			}
			if (zone.kind !== 'favorite' || zone.index === undefined) return;
			const from = favorites.findIndex((item) => reactionChoiceKey(item) === key);
			if (from < 0 || from === zone.index) return;
			const next = [...favorites];
			const [moved] = next.splice(from, 1);
			next.splice(zone.index, 0, moved);
			saveFavorites(next);
			commitFavorites(next);
			announcement = m.emojiFavoriteMoved({ position: zone.index + 1 });
			return;
		}
		if (zone.kind !== 'favorite' && zone.kind !== 'bar') return;
		if (favoritesFull(favorites)) {
			announcement = m.emojiFavoritesFull();
			return;
		}
		const at = zone.kind === 'favorite' && zone.index !== undefined ? zone.index : favorites.length;
		const next = insertFavorite(favorites, choice.emoji, at);
		if (next === favorites) return;
		commitFavorites(next);
		// お気に入りにあるものは「最近使った」に出さない規則（上の $effect）と
		// 食い違わないよう、表示中のリストからも取り除く。履歴自体は残す。
		recentItems = recentItems.filter((item) => reactionChoiceKey(item) !== key);
		quickItems = quickItems.filter((item) => reactionChoiceKey(item) !== key);
		announcement = m.emojiFavoriteAdded({ emoji: labelOf(choice) });
	}

	/** キーボードだけの利用者がお気に入りを外せる唯一の経路。並び替えは設定画面へ。 */
	function favoriteKeydown(event: KeyboardEvent, source: DragSource, choice: ReactionChoice) {
		if (source !== 'favorites') return;
		if (event.key !== 'Delete' && event.key !== 'Backspace') return;
		event.preventDefault();
		commitFavorites(removeFavorite(favorites, reactionChoiceKey(choice)));
		announcement = m.emojiFavoriteRemoved({ emoji: labelOf(choice) });
	}

	const draggingKey = $derived(drag.payload ? reactionChoiceKey(drag.payload.choice) : undefined);
	const dropBarLabel = $derived.by(() => {
		if (drag.payload?.source === 'favorites') return m.quickReactionDropRemove();
		if (favoritesFull(favorites)) return m.emojiFavoritesFull();
		return m.quickReactionDropFavorite();
	});
</script>

{#snippet quickChoice(item: ReactionChoice, source: DragSource, index: number)}
	{@const key = reactionChoiceKey(item)}
	<button
		class="reaction-quick-item"
		class:flash={flashKey === key}
		class:dragging={draggingKey === key}
		class:drop-target={source === 'favorites' &&
			draggingKey !== undefined &&
			draggingKey !== key &&
			drag.zone?.kind === 'favorite' &&
			drag.zone.index === index}
		data-emoji-drop={source === 'favorites' ? 'favorite' : undefined}
		data-emoji-drop-index={source === 'favorites' ? index : undefined}
		aria-label={choiceAriaLabel(labelOf(item))}
		aria-describedby={source === 'favorites' ? dragHintId : undefined}
		onclick={(event) => {
			// ドラッグ直後の互換 click でリアクションを飛ばさない。
			if (drag.justDragged) return;
			choose(item.emoji, event.shiftKey);
		}}
		onpointerdown={(event) => drag.start(event, { source, choice: item, index })}
		onpointermove={drag.move}
		onpointerup={drag.end}
		onpointercancel={drag.end}
		onlostpointercapture={drag.end}
		onkeydown={(event) => favoriteKeydown(event, source, item)}
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
	<div class="emoji-palette-portal" use:portal>
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
			<button
				class="reaction-picker-backdrop"
				aria-label={m.closeEmojiAria()}
				onclick={() => !drag.justDragged && closePalette()}
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
								{#each quickResults as item, index (reactionChoiceKey(item))}{@render quickChoice(
										item,
										'search',
										index,
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
								{#each favorites as item, index (reactionChoiceKey(item))}{@render quickChoice(
										item,
										'favorites',
										index,
									)}{/each}
							</div>
						</div>
					{/if}
					{#if recentItems.length}
						<div class="reaction-quick-section">
							<span class="reaction-quick-label">{m.quickReactionRecent()}</span>
							<div class="reaction-quick-grid">
								{#each recentItems as item, index (reactionChoiceKey(item))}{@render quickChoice(
										item,
										'recent',
										index,
									)}{/each}
							</div>
						</div>
					{:else if quickItems.length}
						<div class="reaction-quick-section">
							<div class="reaction-quick-grid">
								{#each quickItems as item, index (reactionChoiceKey(item))}{@render quickChoice(
										item,
										'quick',
										index,
									)}{/each}
							</div>
						</div>
					{/if}
				{/if}
				{#if finePointer}
					<p class="reaction-quick-hint">
						{drag.dragging ? m.quickReactionDragHint() : m.quickReactionShiftHint()}
					</p>
				{/if}
				<!-- お気に入りタイルの説明。ドラッグできない環境でも Delete は使える。 -->
				<span class="visually-hidden" id={dragHintId}>
					{finePointer ? m.quickReactionDragHint() : ''}
					{m.emojiFavoriteRemoveKeyHint()}
				</span>
				<!--
					ドロップ先は検索 input に重ねる。行を足すとお気に入りの増減と合わせて
					高さが変わり、estimateQuickHeight とズレてポップオーバーが飛ぶ。
					ここなら常に同じ位置に出るので狙いやすくもある。
				-->
				<div class="reaction-quick-footer">
					<input
						class="reaction-quick-search"
						type="search"
						bind:value={quickQuery}
						oninput={ensureUnicodeIndex}
						placeholder={m.emojiSearchLabel()}
						aria-label={m.emojiSearchLabel()}
					/>
					{#if drag.dragging}
						{@const removing = drag.payload?.source === 'favorites'}
						{@const full = !removing && favoritesFull(favorites)}
						<div
							class="reaction-quick-dropbar"
							class:danger={removing}
							class:accept={!removing && !full}
							class:full
							class:over={drag.zone?.kind === 'bar'}
							data-emoji-drop="bar"
							aria-hidden="true"
						>
							<Icon name={removing ? 'trash' : 'emojiPlus'} size={15} />
							<span>{dropBarLabel}</span>
						</div>
					{/if}
				</div>
				<button class="reaction-show-all" onclick={() => (fullPickerOpen = true)}>
					<Icon name="emoji" size={17} />
					<span>{m.showAllReactions()}</span>
				</button>
				<span class="visually-hidden" aria-live="polite">{announcement}</span>
			</div>
		{/if}
	</div>
{/if}
