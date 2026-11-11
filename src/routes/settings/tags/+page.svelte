<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/components/Button.svelte';
	import SettingRow from '$lib/components/SettingRow.svelte';
	import SettingsPage from '$lib/components/SettingsPage.svelte';
	import SettingsSection from '$lib/components/SettingsSection.svelte';
	import SignedOutNotice from '$lib/components/SignedOutNotice.svelte';
	import TagMuteSection from '$lib/components/TagMuteSection.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import { mutes } from '$lib/mute/mutes.svelte';
	import { oauthReady, session } from '$lib/oauth/session.svelte';
	import { preferencesReady } from '$lib/preferences/sync.svelte';
	import { toStoredTag } from '$lib/tag-favorites/list';
	import { tagFavorites } from '$lib/tag-favorites/tag-favorites.svelte';
	import { hashtagHref } from '$lib/tags';

	let error = $state('');
	let muteLoading = $state(false);
	// 同期の取り込みが済むまで編集させない。先に触ると、同期前の一覧に新しい updatedAt が付き、
	// サーバー側の値を上書きしてしまう（タブ設定画面と同じ理由）。
	let ready = $state(false);

	onMount(() => {
		void preferencesReady().then(() => (ready = true));
	});
	$effect(() => {
		if ($session && $oauthReady && !mutes.loaded && !muteLoading) void reloadMutes();
	});

	async function reloadMutes() {
		muteLoading = true;
		await mutes.load();
		if (!mutes.loaded) error = m.muteLoadFailed();
		muteLoading = false;
	}

	let tagInput = $state('');
	const newTag = $derived(toStoredTag(tagInput));
	const duplicate = $derived(Boolean(newTag) && tagFavorites.has(newTag!));

	function addFavorite(event: SubmitEvent) {
		event.preventDefault();
		if (!newTag || duplicate) {
			tagInput = '';
			return;
		}
		if (tagFavorites.add(newTag)) tagInput = '';
		else error = m.tagFavoritesFull();
	}
</script>

<SettingsPage title={m.settingsTagsTitle()} description={m.tagSettingsHelp()}>
	{#if !$session && $oauthReady}
		<SignedOutNotice message={m.tagSettingsSignInRequired()} />
	{:else if $session}
		{#if error}<p class="settings-error" role="alert">{error}</p>{/if}

		<SettingsSection title={m.tagFavoritesLegend()}>
			<SettingRow>
				<form class="tag-favorite-form" onsubmit={addFavorite}>
					<input
						class="settings-input"
						bind:value={tagInput}
						maxlength="65"
						placeholder={m.tagFavoritePlaceholder()}
						aria-label={m.tagFavoriteAdd()}
						disabled={!ready}
					/>
					<Button
						variant="primary"
						type="submit"
						disabled={!ready || !newTag || duplicate || tagFavorites.full}
					>
						{tagFavorites.full ? m.tagFavoritesFull() : m.tagFavoriteAdd()}
					</Button>
				</form>
			</SettingRow>
			{#if !tagFavorites.favorites.length}
				<SettingRow description={m.tagFavoritesEmpty()} />
			{:else}
				{#each tagFavorites.favorites as tag, index (tag)}
					<div class="setting-row has-control">
						<a class="tag-favorite-subject" href={hashtagHref(tag)}>#{tag}</a>
						<div class="tag-favorite-actions">
							<button
								class="icon-action"
								type="button"
								aria-label={m.tagFavoriteMoveUp({ tag })}
								title={m.tagFavoriteMoveUp({ tag })}
								disabled={!ready || index === 0}
								onclick={() => tagFavorites.move(index, -1)}
								><Icon name="arrowUp" size={16} /></button
							>
							<button
								class="icon-action"
								type="button"
								aria-label={m.tagFavoriteMoveDown({ tag })}
								title={m.tagFavoriteMoveDown({ tag })}
								disabled={!ready || index === tagFavorites.favorites.length - 1}
								onclick={() => tagFavorites.move(index, 1)}
								><Icon name="arrowDown" size={16} /></button
							>
							<button
								class="icon-action"
								type="button"
								aria-label={m.tagFavoriteRemoveAria({ tag })}
								title={m.tagFavoriteRemove()}
								disabled={!ready}
								onclick={() => tagFavorites.remove(tag)}><Icon name="trash" size={16} /></button
							>
						</div>
					</div>
				{/each}
			{/if}
		</SettingsSection>

		<TagMuteSection loading={muteLoading} onerror={(message) => (error = message)} />
	{/if}
</SettingsPage>

<style>
	.tag-favorite-form {
		display: flex;
		gap: 8px;
		min-width: 0;
	}
	.tag-favorite-form input {
		flex: 1;
		min-width: 0;
	}
	.tag-favorite-subject {
		min-width: 0;
		overflow: hidden;
		color: inherit;
		font-weight: 500;
		text-decoration: none;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.tag-favorite-actions {
		display: flex;
		flex-shrink: 0;
		gap: 2px;
	}
</style>
