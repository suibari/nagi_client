<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import jaI18n from 'emoji-picker-element/i18n/ja';
	import enI18n from 'emoji-picker-element/i18n/en';
	import emojiDataUrlJa from 'emoji-picker-element-data/ja/emojibase/data.json?url';
	import emojiDataUrlEn from 'emoji-picker-element-data/en/emojibase/data.json?url';
	import { i18n, m } from '$lib/i18n/i18n.svelte';
	import { searchEmojis } from '$lib/api/appview';
	import { displayEmojiName } from '$lib/atproto/bluemoji';
	import {
		loadUnicodeEmojiIndex,
		searchUnicodeEmojis,
		type UnicodeEmoji,
	} from '$lib/emoji/unicodeSearch';
	import type { EmojiView } from '$lib/api/types';
	import { reactionChoiceKey, type ReactionChoice } from '$lib/emoji/reactionUsage';
	import { loadFavorites, saveFavorites } from '$lib/emoji/favorites';
	import SortableEmojiGrid from './SortableEmojiGrid.svelte';
	import BluemojiMedia from './BluemojiMedia.svelte';
	import InfiniteScroll from './InfiniteScroll.svelte';

	let {
		anchor,
		select,
		close,
		showFavorites = true,
		oncustomunavailable,
	}: {
		anchor: HTMLElement;
		select: (emoji: string | EmojiView) => void;
		close: () => void;
		/** 設定画面から「お気に入りに追加する絵文字」を選ぶときは false。 */
		showFavorites?: boolean;
		oncustomunavailable?: (uri: string) => void;
	} = $props();
	type FavoriteItem = { id: string; choice: ReactionChoice };
	// パレットを開いた時点のお気に入りを編集対象にし、並び替えのたびに保存する。
	// svelte-ignore state_referenced_locally -- showFavorites は開いている間変わらない
	const initialFavorites = showFavorites
		? loadFavorites().map((choice) => ({ id: reactionChoiceKey(choice), choice }))
		: [];
	let favorites = $state<FavoriteItem[]>(initialFavorites);
	let host: HTMLDivElement;
	let unicodeHost = $state<HTMLDivElement>();
	let positionStyle = $state('');
	let positioned = $state(false);
	let tab = $state<'favorites' | 'unicode' | 'custom'>(
		initialFavorites.length ? 'favorites' : 'unicode',
	);
	let query = $state('');
	let customEmojis = $state<EmojiView[]>([]);
	let customLoading = $state(false);
	let customError = $state(false);
	let customCursor = $state<string>();
	let customLoadingMore = $state(false);
	let customMoreError = $state(false);
	let customRequestId = 0;
	let unicodeInput = $state<HTMLInputElement>();
	let unicodeQuery = $state('');
	let unicodeIndex = $state<UnicodeEmoji[]>([]);
	let unicodeLoading = $state(false);
	let unicodeError = $state(false);
	let unicodeRequested = false;

	const unicodeSearching = $derived(unicodeQuery.trim().length > 0);
	const unicodeResults = $derived(
		unicodeSearching ? searchUnicodeEmojis(unicodeIndex, unicodeQuery, 60) : [],
	);
	const returnTo = $derived(encodeURIComponent(`${page.url.pathname}${page.url.search}`));
	const addCustomHref = $derived(`/settings/emoji?returnTo=${returnTo}`);
	const favoritesSettingsHref = $derived(`/settings/emoji-favorites?returnTo=${returnTo}`);

	const persistFavorites = (items: FavoriteItem[]) =>
		saveFavorites(items.map((item) => item.choice));

	// 検索データ（ja+en）は初回入力時にだけ取りに行く。以降はメモリ上で絞り込む。
	async function ensureUnicodeIndex() {
		if (unicodeRequested) return;
		unicodeRequested = true;
		unicodeLoading = true;
		try {
			unicodeIndex = await loadUnicodeEmojiIndex(i18n.locale);
			unicodeError = false;
		} catch {
			unicodeRequested = false;
			unicodeError = true;
		} finally {
			unicodeLoading = false;
		}
	}

	const VIEWPORT_MARGIN = 16;
	const ANCHOR_GAP = 8;
	const DESKTOP_BREAKPOINT = 768;
	const PICKER_WIDTH = 352;
	const PICKER_HEIGHT = 440;

	// カスタムタブは AppView 検索。打鍵ごとに叩かないよう少し待ってから問い合わせる。
	const SEARCH_DEBOUNCE_MS = 250;
	$effect(() => {
		if (tab !== 'custom') return;
		const q = query.trim();
		const requestId = ++customRequestId;
		let cancelled = false;
		customLoading = true;
		customLoadingMore = false;
		customCursor = undefined;
		customMoreError = false;
		const timer = setTimeout(async () => {
			try {
				const result = await searchEmojis({ q: q || undefined, limit: 60 });
				if (!cancelled && requestId === customRequestId) {
					customEmojis = result.emojis;
					customCursor = result.cursor;
					customError = false;
				}
			} catch {
				if (!cancelled && requestId === customRequestId) customError = true;
			} finally {
				if (!cancelled && requestId === customRequestId) customLoading = false;
			}
		}, SEARCH_DEBOUNCE_MS);
		return () => {
			cancelled = true;
			clearTimeout(timer);
		};
	});

	async function loadMoreCustom() {
		const cursor = customCursor;
		if (!cursor || customLoadingMore) return;
		const requestId = customRequestId;
		customLoadingMore = true;
		customMoreError = false;
		try {
			const q = query.trim();
			const result = await searchEmojis({ q: q || undefined, limit: 60, cursor });
			if (requestId !== customRequestId) return;
			const known = new Set(customEmojis.map((emoji) => emoji.uri));
			customEmojis = [...customEmojis, ...result.emojis.filter((emoji) => !known.has(emoji.uri))];
			customCursor = result.cursor;
		} catch {
			if (requestId === customRequestId) customMoreError = true;
		} finally {
			if (requestId === customRequestId) customLoadingMore = false;
		}
	}

	onMount(() => {
		let disposed = false;
		let picker: HTMLElement | undefined;
		let positionFrame: number | undefined;

		const updatePosition = () => {
			positionFrame = undefined;
			if (window.innerWidth < DESKTOP_BREAKPOINT) {
				positionStyle = '';
				positioned = true;
				return;
			}

			const anchorRect = anchor.getBoundingClientRect();
			const width = Math.min(PICKER_WIDTH, window.innerWidth - VIEWPORT_MARGIN * 2);
			const belowTop = anchorRect.bottom + ANCHOR_GAP;
			const belowSpace = window.innerHeight - VIEWPORT_MARGIN - belowTop;
			const aboveSpace = anchorRect.top - ANCHOR_GAP - VIEWPORT_MARGIN;
			const openBelow = belowSpace >= PICKER_HEIGHT || belowSpace >= aboveSpace;
			const height = Math.min(PICKER_HEIGHT, Math.max(0, openBelow ? belowSpace : aboveSpace));
			const preferredLeft = anchorRect.right - width;
			const left = Math.min(
				Math.max(VIEWPORT_MARGIN, preferredLeft),
				window.innerWidth - VIEWPORT_MARGIN - width,
			);
			const top = openBelow ? belowTop : anchorRect.top - ANCHOR_GAP - height;

			positionStyle = `top: ${top}px; left: ${left}px; width: ${width}px; height: ${height}px;`;
			positioned = true;
		};
		const schedulePositionUpdate = () => {
			if (positionFrame !== undefined) return;
			positionFrame = requestAnimationFrame(updatePosition);
		};

		const handleKeydown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') close();
		};
		const handlePointerDown = (event: PointerEvent) => {
			if (!host.contains(event.target as Node)) close();
		};

		window.addEventListener('keydown', handleKeydown);
		window.addEventListener('pointerdown', handlePointerDown);
		window.addEventListener('resize', schedulePositionUpdate);
		window.addEventListener('scroll', schedulePositionUpdate, true);
		updatePosition();
		void import('emoji-picker-element').then(({ Picker }) => {
			if (disposed || !unicodeHost) return;
			const locale = i18n.locale;
			picker = new Picker({
				locale,
				dataSource: locale === 'ja' ? emojiDataUrlJa : emojiDataUrlEn,
				i18n: {
					...(locale === 'ja' ? jaI18n : enI18n),
					favoritesLabel: m.emojiFavoritesLabel(),
					searchLabel: m.emojiSearchLabel(),
				},
			});
			picker.addEventListener('emoji-click', (event) => {
				const emoji = (event as CustomEvent<{ unicode?: string }>).detail.unicode;
				if (emoji) select(emoji);
			});
			unicodeHost.append(picker);
			// 検索と頻出履歴は Nagi 側で Unicode・カスタム共通に扱うため内蔵UIを隠す。
			const hideSearchRow = document.createElement('style');
			hideSearchRow.textContent = '.search-row, .favorites { display: none; }';
			picker.shadowRoot?.append(hideSearchRow);
			if (tab === 'unicode') requestAnimationFrame(() => unicodeInput?.focus());
		});

		return () => {
			disposed = true;
			if (positionFrame !== undefined) cancelAnimationFrame(positionFrame);
			window.removeEventListener('keydown', handleKeydown);
			window.removeEventListener('pointerdown', handlePointerDown);
			window.removeEventListener('resize', schedulePositionUpdate);
			window.removeEventListener('scroll', schedulePositionUpdate, true);
			picker?.remove();
		};
	});
</script>

<div
	bind:this={host}
	class="emoji-picker"
	class:positioned
	style={positionStyle}
	role="dialog"
	aria-label={m.emojiPickerAria()}
>
	<div class="emoji-tabs" role="tablist">
		{#if showFavorites}
			<button
				role="tab"
				aria-selected={tab === 'favorites'}
				class:active={tab === 'favorites'}
				onclick={() => (tab = 'favorites')}>{m.emojiTabFavorites()}</button
			>
		{/if}
		<button
			role="tab"
			aria-selected={tab === 'unicode'}
			class:active={tab === 'unicode'}
			onclick={() => (tab = 'unicode')}>{m.emojiTabUnicode()}</button
		>
		<button
			role="tab"
			aria-selected={tab === 'custom'}
			class:active={tab === 'custom'}
			onclick={() => (tab = 'custom')}>{m.emojiTabCustom()}</button
		>
	</div>
	{#if tab === 'favorites'}
		<div class="emoji-panel emoji-favorites">
			{#if favorites.length}
				<SortableEmojiGrid
					bind:items={favorites}
					onselect={(item) => select(item.choice.emoji)}
					onreorder={persistFavorites}
				>
					{#snippet children(item)}
						{#if item.choice.kind === 'custom'}
							<BluemojiMedia
								emoji={item.choice.emoji}
								onunavailable={() =>
									item.choice.kind === 'custom' && oncustomunavailable?.(item.choice.emoji.uri)}
							/>
						{:else}
							{item.choice.emoji}
						{/if}
					{/snippet}
				</SortableEmojiGrid>
			{:else}
				<p class="emoji-custom-empty">{m.emojiFavoritesEmpty()}</p>
			{/if}
			<a class="emoji-custom-add" href={favoritesSettingsHref}>{m.emojiFavoriteAdd()}</a>
		</div>
	{/if}
	<div class="emoji-panel emoji-unicode" hidden={tab !== 'unicode'}>
		<input
			class="emoji-search"
			type="search"
			bind:this={unicodeInput}
			bind:value={unicodeQuery}
			oninput={ensureUnicodeIndex}
			placeholder={m.emojiSearchLabel()}
			aria-label={m.emojiSearchLabel()}
		/>
		<div class="emoji-unicode-host" bind:this={unicodeHost} hidden={unicodeSearching}></div>
		{#if unicodeSearching}
			<div class="emoji-unicode-results">
				{#if unicodeError}
					<p class="emoji-custom-empty">{m.emojiSearchFailed()}</p>
				{:else if unicodeLoading && !unicodeIndex.length}
					<p class="emoji-custom-empty">{m.loading()}</p>
				{:else if !unicodeResults.length}
					<p class="emoji-custom-empty">{m.emojiUnicodeEmpty()}</p>
				{:else}
					<div class="emoji-custom-grid">
						{#each unicodeResults as emoji (emoji.emoji)}
							<button
								class="emoji-custom-item emoji-unicode-item"
								title={emoji.label}
								aria-label={m.reactWithAria({ emoji: emoji.label })}
								onclick={() => select(emoji.emoji)}
							>
								{emoji.emoji}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	</div>
	{#if tab === 'custom'}
		<div class="emoji-panel emoji-custom">
			<input
				class="emoji-search"
				type="search"
				bind:value={query}
				placeholder={m.emojiSearchLabel()}
				aria-label={m.emojiSearchLabel()}
			/>
			{#if customError}
				<p class="emoji-custom-empty">{m.emojiSearchFailed()}</p>
			{:else if customLoading && !customEmojis.length}
				<p class="emoji-custom-empty">{m.loading()}</p>
			{:else if !customEmojis.length}
				<p class="emoji-custom-empty">{m.emojiCustomEmpty()}</p>
			{:else}
				<div class="emoji-custom-grid">
					{#each customEmojis as emoji (emoji.uri)}
						<button
							class="emoji-custom-item"
							title={displayEmojiName(emoji.name)}
							aria-label={m.reactWithAria({ emoji: displayEmojiName(emoji.name) })}
							onclick={() => select(emoji)}
						>
							<BluemojiMedia {emoji} />
						</button>
					{/each}
					<InfiniteScroll
						hasMore={Boolean(customCursor)}
						loading={customLoadingMore}
						error={customMoreError ? m.emojiSearchFailed() : ''}
						onload={loadMoreCustom}
					/>
				</div>
			{/if}
			<a class="emoji-custom-add" href={addCustomHref}>{m.emojiAddCustom()}</a>
		</div>
	{/if}
</div>
