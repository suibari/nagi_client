<script lang="ts">
	import Spinner from '$lib/components/Spinner.svelte';
	import { onMount } from 'svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import { oauthReady, session } from '$lib/oauth/session.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import SignedOutNotice from '$lib/components/SignedOutNotice.svelte';
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

<section class="auth-card settings-detail">
	<a class="settings-back" href="/settings">← {m.backToSettings()}</a>
	<h1>{m.settingsMuteTitle()}</h1>

	{#if !$session && $oauthReady}
		<SignedOutNotice message={m.muteSignInRequired()} legend={m.settingsMuteTitle()} />
	{:else if $session}
		<fieldset class="theme-settings">
			<legend>{m.settingsMuteTitle()}</legend>
			<p>{m.muteHelp()}</p>
			<p class="muted">{m.mutePrivateNote()}</p>
			<p class="muted">{m.muteThreadNote()}</p>
			<p class="muted">{m.muteVisibleNote()}</p>
		</fieldset>

		{#if error}<p class="mute-error" role="alert">{error}</p>{/if}

		<fieldset class="theme-settings">
			<legend>{m.muteUsersLegend()}</legend>
			{#if loading && !mutes.loaded}
				<Spinner />
			{:else if !mutes.actors.length}
				<p class="muted">{m.muteUsersEmpty()}</p>
			{:else}
				<ul class="mute-list">
					{#each mutes.actors as actor (actor.did)}
						<li class="mute-item">
							<a class="mute-subject" href="/profile/{actor.did}">
								<Avatar {actor} size="small" />
								<span class="mute-names">
									<strong>{actor.displayName ?? actor.handle}</strong>
									<span class="muted">@{actor.handle}</span>
								</span>
							</a>
							<button
								type="button"
								class="ghost"
								disabled={mutes.isPending(actor.did)}
								onclick={() => void unmuteActor(actor)}
							>
								{m.unmuteUser()}
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</fieldset>

		<fieldset class="theme-settings">
			<legend>{m.muteTagsLegend()}</legend>
			<form class="mute-tag-form" onsubmit={addTagMute}>
				<input
					bind:value={tagInput}
					maxlength="128"
					placeholder={m.muteTagPlaceholder()}
					aria-label={m.muteTagAdd()}
				/>
				<button type="submit" class="ghost" disabled={!newTag || mutes.isPending(newTag)}>
					{m.muteTagAdd()}
				</button>
			</form>
			{#if loading && !mutes.loaded}
				<Spinner />
			{:else if !mutes.tags.length}
				<p class="muted">{m.muteTagsEmpty()}</p>
			{:else}
				<ul class="mute-list">
					{#each mutes.tags as tag (tag)}
						<li class="mute-item">
							<a class="mute-subject" href={hashtagHref(tag)}>
								<span class="mute-names"><strong>#{tag}</strong></span>
							</a>
							<button
								type="button"
								class="ghost"
								disabled={mutes.isPending(tag)}
								onclick={() => void setTagMute(tag, false)}
							>
								{m.unmuteTag()}
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</fieldset>
	{/if}
</section>

<style>
	.mute-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.mute-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		justify-content: space-between;
	}
	.mute-subject {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		min-width: 0;
		flex: 1;
		color: inherit;
		text-decoration: none;
	}
	.mute-names {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.mute-names > * {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.mute-tag-form {
		display: flex;
		gap: 0.5rem;
		margin-block-end: 0.75rem;
		min-width: 0;
	}
	.mute-tag-form input {
		flex: 1;
		min-width: 0;
	}
	.mute-error {
		color: var(--danger, #c0392b);
	}
</style>
