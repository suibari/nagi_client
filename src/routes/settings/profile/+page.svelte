<script lang="ts">
	import {
		getBlueskyProfileDraft,
		getOwnNagiProfile,
		putProfile,
		type ProfileDraft,
		uploadAvatar,
	} from '$lib/atproto/records';
	import AvatarCropper from '$lib/components/AvatarCropper.svelte';
	import { APPVIEW_URL, getProfile } from '$lib/api/appview';
	import { session, oauthReady } from '$lib/oauth/session.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { m } from '$lib/i18n/i18n.svelte';
	import { myProfile } from '$lib/profile/me.svelte';
	import { onDestroy } from 'svelte';

	let name = $state('');
	let description = $state('');
	let status = $state('');
	let error = $state('');
	let busy = $state(false);
	let loaded = $state(false);
	let draft = $state<ProfileDraft>();
	let avatarPreview = $state<string>();
	let avatarChange = $state<Blob | null>();
	let cropFile = $state<File>();
	let onboarding = $derived(page.url.searchParams.get('onboarding') === '1');

	onDestroy(() => {
		if (avatarPreview?.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
	});
	$effect(() => {
		const did = $session?.did;
		if (!did || loaded) return;
		getOwnNagiProfile()
			.then(async (profile) => {
				if (!profile) return getBlueskyProfileDraft();
				try {
					const currentProfile = await getProfile(did, { limit: 1 });
					const avatar = currentProfile.profile.avatar;
					profile.avatarUrl = avatar?.startsWith('/') ? APPVIEW_URL + avatar : avatar;
				} catch {
					/* The PDS remains the source of truth until AppView catches up. */
				}
				return profile;
			})
			.then((profile) => {
				if (loaded) return;
				draft = profile;
				avatarPreview = profile.avatarUrl;
				name = profile.displayName;
				description = profile.description;
				loaded = true;
			})
			.catch((e) => {
				error = e instanceof Error ? e.message : m.profileLoadFailed();
				loaded = true;
			});
	});
	function selectAvatar(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file) return;
		if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
			error = m.imageTypeError();
			return;
		}
		if (file.size > 25_000_000) {
			error = m.imageSizeError();
			return;
		}
		error = '';
		cropFile = file;
	}
	function applyAvatar(blob: Blob) {
		if (avatarPreview?.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
		avatarChange = blob;
		avatarPreview = URL.createObjectURL(blob);
		cropFile = undefined;
	}
	function removeAvatar() {
		if (avatarPreview?.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
		avatarChange = null;
		avatarPreview = undefined;
	}
	async function save() {
		if (!$session) {
			location.href = '/login';
			return;
		}
		busy = true;
		status = '';
		error = '';
		try {
			const avatar =
				avatarChange instanceof Blob ? await uploadAvatar(avatarChange) : draft?.avatar;
			const updatedDraft = {
				...draft,
				displayName: name,
				description,
				avatar: avatarChange === null ? undefined : avatar,
			};
			await putProfile(name, description, updatedDraft);
			draft = updatedDraft;
			avatarChange = undefined;
			status = m.saved();
			myProfile.refresh();
			if (onboarding) await goto('/');
		} catch (e) {
			error = e instanceof Error ? e.message : m.saveFailed();
		} finally {
			busy = false;
		}
	}
</script>

<section class="auth-card settings-detail">
	{#if !onboarding}<a class="settings-back" href="/settings">← {m.backToSettings()}</a>{/if}
	<h1>{m.profileSettingsTitle()}</h1>
	<p>{m.profileSettingsNote()}</p>
	{#if onboarding}<p>{m.onboardingLoadedNote()}</p>{/if}
	{#if !$session && $oauthReady}
		<p>{m.loginRequired()}</p>
		<a class="login" href="/login">{m.login()}</a>
	{:else}
		<div class="avatar-setting">
			{#if avatarPreview}<img
					class="avatar-preview"
					src={avatarPreview}
					alt={m.currentAvatarAlt()}
				/>{:else}<span class="avatar large">{name.slice(0, 1) || '○'}</span>{/if}
			<div class="avatar-controls">
				<label class="avatar-select"
					>{m.selectImage()}<input
						type="file"
						accept="image/jpeg,image/png,image/webp"
						onchange={selectAvatar}
					/></label
				>
				{#if avatarPreview}<button type="button" class="ghost avatar-remove" onclick={removeAvatar}
						>{m.remove()}</button
					>{/if}
				<small>{m.avatarNote()}</small>
			</div>
		</div>
		<label>{m.displayNameLabel()}<input bind:value={name} maxlength="640" /></label>
		<label
			>{m.bioLabel()}<textarea bind:value={description} maxlength="2560" rows="4"></textarea></label
		>
		<button disabled={busy || !loaded} onclick={save}>{busy ? m.saving() : m.save()}</button>
		{#if status}<p>{status}</p>{/if}{#if error}<p class="error">{error}</p>{/if}
	{/if}
</section>

{#if cropFile}<AvatarCropper
		file={cropFile}
		onconfirm={applyAvatar}
		oncancel={() => (cropFile = undefined)}
	/>{/if}
