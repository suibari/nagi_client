<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { onMount } from 'svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import { oauthReady, session } from '$lib/oauth/session.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import SignedOutNotice from '$lib/components/SignedOutNotice.svelte';
	import SettingRow from '$lib/components/SettingRow.svelte';
	import SettingsPage from '$lib/components/SettingsPage.svelte';
	import SettingsSection from '$lib/components/SettingsSection.svelte';
	import { mutes } from '$lib/mute/mutes.svelte';
	import type { ActorView } from '$lib/api/types';
	import { hashtagHref, normalizeTag } from '$lib/tags';

	let error = $state('');
	let loading = $state(false);

	onMount(() => {
		// レイアウト側でサインイン時に読んでいるが、直リンクで来た場合に備えて自分でも確かめる。
		if ($session && !mutes.loaded) void reload();
	});
	$effect(() => {
		if ($session && $oauthReady && !mutes.loaded && !loading) void reload();
	});

	async function reload() {
		loading = true;
		error = '';
		await mutes.load();
		if (!mutes.loaded) error = m.muteLoadFailed();
		loading = false;
	}

	async function unmuteActor(actor: ActorView) {
		error = '';
		try {
			await mutes.toggleActor(actor, false);
		} catch {
			error = m.muteUpdateFailed();
		}
	}
	async function setTagMute(tag: string, muted: boolean) {
		error = '';
		try {
			await mutes.toggleTag(tag, muted);
			return true;
		} catch {
			error = m.muteUpdateFailed();
			return false;
		}
	}

	let tagInput = $state('');
	const newTag = $derived(normalizeTag(tagInput));
	async function addTagMute(event: SubmitEvent) {
		event.preventDefault();
		if (!newTag || mutes.hasTag(newTag)) {
			tagInput = '';
			return;
		}
		if (await setTagMute(newTag, true)) tagInput = '';
	}
</script>

<SettingsPage title={m.settingsMuteTitle()} description={m.muteHelp()}>
	{#if !$session && $oauthReady}
		<SignedOutNotice message={m.muteSignInRequired()} />
	{:else if $session}
		<ul class="mute-notes">
			<li>{m.mutePrivateNote()}</li>
			<li>{m.muteThreadNote()}</li>
			<li>{m.muteVisibleNote()}</li>
		</ul>

		{#if error}<p class="settings-error" role="alert">{error}</p>{/if}

		<SettingsSection title={m.muteUsersLegend()}>
			{#if loading && !mutes.loaded}
				<SettingRow><Spinner /></SettingRow>
			{:else if !mutes.actors.length}
				<SettingRow description={m.muteUsersEmpty()} />
			{:else}
				{#each mutes.actors as actor (actor.did)}
					<div class="setting-row has-control">
						<a class="mute-subject" href="/profile/{actor.did}">
							<Avatar {actor} size="small" />
							<span class="mute-names">
								<strong>{actor.displayName ?? actor.handle}</strong>
								<span class="muted">@{actor.handle}</span>
							</span>
						</a>
						<Button
							variant="secondary"
							size="sm"
							type="button"
							disabled={mutes.isPending(actor.did)}
							onclick={() => void unmuteActor(actor)}
						>
							{m.unmuteUser()}
						</Button>
					</div>
				{/each}
			{/if}
		</SettingsSection>

		<SettingsSection title={m.muteTagsLegend()}>
			<SettingRow>
				<form class="mute-tag-form" onsubmit={addTagMute}>
					<input
						class="settings-input"
						bind:value={tagInput}
						maxlength="128"
						placeholder={m.muteTagPlaceholder()}
						aria-label={m.muteTagAdd()}
					/>
					<Button variant="primary" type="submit" disabled={!newTag || mutes.isPending(newTag)}>
						{m.muteTagAdd()}
					</Button>
				</form>
			</SettingRow>
			{#if loading && !mutes.loaded}
				<SettingRow><Spinner /></SettingRow>
			{:else if !mutes.tags.length}
				<SettingRow description={m.muteTagsEmpty()} />
			{:else}
				{#each mutes.tags as tag (tag)}
					<div class="setting-row has-control">
						<a class="mute-subject" href={hashtagHref(tag)}>
							<span class="mute-names"><strong>#{tag}</strong></span>
						</a>
						<Button
							variant="secondary"
							size="sm"
							type="button"
							disabled={mutes.isPending(tag)}
							onclick={() => void setTagMute(tag, false)}
						>
							{m.unmuteTag()}
						</Button>
					</div>
				{/each}
			{/if}
		</SettingsSection>
	{/if}
</SettingsPage>

<style>
	.mute-notes {
		display: grid;
		gap: 4px;
		margin: 0;
		padding-inline-start: 1.25em;
		color: var(--text-muted);
		font-size: 0.8rem;
		line-height: 1.6;
	}
	.mute-subject {
		display: flex;
		align-items: center;
		gap: 12px;
		min-width: 0;
		color: inherit;
		text-decoration: none;
	}
	.mute-names {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.mute-names strong {
		font-weight: 500;
	}
	.mute-names > * {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.mute-names .muted {
		font-size: 0.8rem;
	}
	.mute-tag-form {
		display: flex;
		gap: 8px;
		min-width: 0;
	}
	.mute-tag-form input {
		flex: 1;
		min-width: 0;
	}
</style>
