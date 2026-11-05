<script lang="ts">
	import { preferences } from '$lib/preferences/preferences.svelte';
	import { session } from '$lib/oauth/session.svelte';
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

	type FavoriteItem = { id: string; choice: ReactionChoice };

	let items = $state<FavoriteItem[]>([]);
	let pickerOpen = $state(false);
	let addButton = $state<HTMLElement>();
	const full = $derived(favoritesFull(items.map((item) => item.choice)));

	const toItems = (favorites: ReactionChoice[]) =>
		favorites.map((choice) => ({ id: reactionChoiceKey(choice), choice }));

	// 取得中・失敗中も端末のキャッシュを表示し、再試行が成功したら読み直す。
	$effect(() => {
		preferences.cacheVersion;
		$session?.did;
		items = toItems(loadFavorites());
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

<section class="emoji-favorites-section" id="favorites" aria-labelledby="emoji-favorites-heading">
	<div class="emoji-favorites-head">
		<h2 id="emoji-favorites-heading">{m.emojiFavoritesSettingsTitle()}</h2>
		<p>{m.emojiFavoritesSettingsNote()}</p>
	</div>
	<PreferencesSyncNotice />

	<!-- リアクションパレット（QuickEmojiPalette）と同じ6列・同じタイルで見せ、並びをそのまま確かめられるようにする -->
	<div class="emoji-favorites-palette">
		{#if items.length}
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
		{:else}
			<p class="emoji-favorites-empty">
				{$session && !preferences.synced ? m.emojiFavoritesUnconfirmed() : m.emojiFavoritesEmpty()}
			</p>
		{/if}
		<button
			type="button"
			class="emoji-favorites-add"
			bind:this={addButton}
			disabled={full}
			onclick={() => (pickerOpen = true)}
		>
			<Icon name="emojiPlus" size={16} />
			<span>{full ? m.emojiFavoritesFull() : m.emojiFavoriteAdd()}</span>
		</button>
	</div>
</section>

{#if pickerOpen && addButton}
	<EmojiPicker
		anchor={addButton}
		select={add}
		close={() => (pickerOpen = false)}
		showFavorites={false}
	/>
{/if}
