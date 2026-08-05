<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { m } from '$lib/i18n/i18n.svelte';
	import { displayEmojiName } from '$lib/atproto/bluemoji';
	import { addFavorite, favoritesFull, loadFavorites, saveFavorites } from '$lib/emoji/favorites';
	import { reactionChoiceKey, type ReactionChoice } from '$lib/emoji/reactionUsage';
	import type { EmojiView } from '$lib/api/types';
	import EmojiPicker from '$lib/components/EmojiPicker.svelte';
	import SortableEmojiGrid from '$lib/components/SortableEmojiGrid.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';
	import BluemojiMedia from '$lib/components/BluemojiMedia.svelte';
	import PreferencesSyncNotice from '$lib/components/PreferencesSyncNotice.svelte';
	import { preferencesReady } from '$lib/preferences/sync.svelte';

	type FavoriteItem = { id: string; choice: ReactionChoice };

	let items = $state<FavoriteItem[]>([]);
	let pickerOpen = $state(false);
	let addButton = $state<HTMLButtonElement>();
	const full = $derived(favoritesFull(items.map((item) => item.choice)));

	const safeInternalReturnTo = (value: string | null) => {
		if (!value?.startsWith('/') || value.startsWith('//')) return undefined;
		try {
			const base = new URL('https://nagi.local');
			const resolved = new URL(value, base);
			if (resolved.origin !== base.origin) return undefined;
			return `${resolved.pathname}${resolved.search}${resolved.hash}`;
		} catch {
			return undefined;
		}
	};
	const returnTo = $derived(safeInternalReturnTo(page.url.searchParams.get('returnTo')));
	const backHref = $derived(returnTo ?? '/settings');
	const backLabel = $derived(returnTo ? m.emojiBackToSource() : m.backToSettings());

	const toItems = (favorites: ReactionChoice[]) =>
		favorites.map((choice) => ({ id: reactionChoiceKey(choice), choice }));

	// アカウント同期の取り込みが済んでから読む。先に読むと、初回同期の和集合が
	// 反映される前の一覧を編集して上書きしてしまう。
	onMount(() => {
		void preferencesReady().then(() => {
			items = toItems(loadFavorites());
		});
	});

	function add(raw: string | EmojiView) {
		items = toItems(
			addFavorite(
				items.map((item) => item.choice),
				raw,
			),
		);
		pickerOpen = false;
	}

	function remove(id: string) {
		items = items.filter((item) => item.id !== id);
		saveFavorites(items.map((item) => item.choice));
	}

	const persist = (next: FavoriteItem[]) => saveFavorites(next.map((item) => item.choice));
	const labelOf = (choice: ReactionChoice) =>
		choice.kind === 'custom' ? displayEmojiName(choice.emoji.name) : choice.emoji;
</script>

<section class="auth-card settings-detail">
	<a class="settings-back" href={backHref}>← {backLabel}</a>
	<h1>{m.emojiFavoritesSettingsTitle()}</h1>
	<p>{m.emojiFavoritesSettingsNote()}</p>
	<PreferencesSyncNotice />

	<button
		type="button"
		class="emoji-favorite-add"
		bind:this={addButton}
		disabled={full}
		onclick={() => (pickerOpen = true)}
	>
		<Icon name="emojiPlus" size={17} />
		<span>{m.emojiFavoriteAdd()}</span>
	</button>
	{#if full}<p class="error">{m.emojiFavoritesFull()}</p>{/if}

	{#if items.length}
		<div class="emoji-favorites-editor">
			<SortableEmojiGrid bind:items onreorder={persist}>
				{#snippet children(item)}
					{#if item.choice.kind === 'custom'}
						<BluemojiMedia emoji={item.choice.emoji} />
					{:else}
						{item.choice.emoji}
					{/if}
					<button
						type="button"
						class="emoji-sort-remove"
						aria-label={m.emojiFavoriteRemove({ emoji: labelOf(item.choice) })}
						title={m.emojiFavoriteRemove({ emoji: labelOf(item.choice) })}
						onclick={() => remove(item.id)}
					>
						<Icon name="close" size={12} />
					</button>
				{/snippet}
			</SortableEmojiGrid>
		</div>
	{:else}
		<p>{m.emojiFavoritesEmpty()}</p>
	{/if}
</section>

{#if pickerOpen && addButton}
	<EmojiPicker
		anchor={addButton}
		select={add}
		close={() => (pickerOpen = false)}
		showFavorites={false}
	/>
{/if}
