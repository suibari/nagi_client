<script lang="ts">
	import Icon from '$lib/components/shell/Icon.svelte';
	import SettingRow from '$lib/components/SettingRow.svelte';
	import SettingsPage from '$lib/components/SettingsPage.svelte';
	import SettingsSection from '$lib/components/SettingsSection.svelte';
	import Button from '$lib/components/Button.svelte';
	import {
		getBlueskyProfileDraft,
		getOwnNagiProfile,
		ensureOwnNagiProfile,
		normalizeProfileWebsite,
		putProfile,
		type ProfileDraft,
		uploadAvatar,
	} from '$lib/atproto/records';
	import AvatarCropper from '$lib/components/AvatarCropper.svelte';
	import { APPVIEW_URL, getProfile } from '$lib/api/appview';
	import { session, oauthReady } from '$lib/oauth/session.svelte';
	import { i18n, m } from '$lib/i18n/i18n.svelte';
	import { myProfile } from '$lib/profile/me.svelte';
	import ProfileAppLinks from '$lib/components/ProfileAppLinks.svelte';
	import SignedOutNotice from '$lib/components/SignedOutNotice.svelte';
	import { hasStandardSiteScope } from '$lib/standardsite/preferences';
	import { syncExistingPublicationFromProfile } from '$lib/standardsite/publication';
	import { onDestroy } from 'svelte';

	let name = $state('');
	let description = $state('');
	let website = $state('');
	let status = $state('');
	let error = $state('');
	let syncWarning = $state('');
	let busy = $state(false);
	let loaded = $state(false);
	let draft = $state<ProfileDraft>();
	let avatarPreview = $state<string>();
	let avatarChange = $state<Blob | null>();
	let cropFile = $state<File>();
	let avatarInput = $state<HTMLInputElement>();

	onDestroy(() => {
		if (avatarPreview?.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
	});
	$effect(() => {
		const did = $session?.did;
		if (!did || loaded) return;
		const profilePromise = getOwnNagiProfile().then(async (profile) => {
			if (!profile) {
				const initial = await ensureOwnNagiProfile();
				if (initial.displayName || initial.description || initial.avatar || initial.website)
					return initial;
				return { ...(await getBlueskyProfileDraft()), createdAt: initial.createdAt };
			}
			try {
				const currentProfile = await getProfile(did, { limit: 1, lang: i18n.locale });
				const avatar = currentProfile.profile.avatar;
				profile.avatarUrl = avatar?.startsWith('/') ? APPVIEW_URL + avatar : avatar;
			} catch {
				/* The PDS remains the source of truth until AppView catches up. */
			}
			return profile;
		});
		profilePromise
			.then((profile) => {
				if (loaded) return;
				draft = profile;
				avatarPreview = profile.avatarUrl;
				name = profile.displayName;
				description = profile.description;
				website = profile.website ?? '';
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
		const normalizedWebsite = normalizeProfileWebsite(website);
		if (normalizedWebsite === undefined) {
			error = m.profileWebsiteInvalid();
			return;
		}
		busy = true;
		status = '';
		error = '';
		syncWarning = '';
		try {
			const avatar =
				avatarChange instanceof Blob ? await uploadAvatar(avatarChange) : draft?.avatar;
			const updatedDraft = {
				...draft,
				displayName: name,
				description,
				website: normalizedWebsite,
				avatar: avatarChange === null ? undefined : avatar,
			};
			await putProfile(name, description, updatedDraft);
			website = normalizedWebsite;
			if (await hasStandardSiteScope()) {
				try {
					await syncExistingPublicationFromProfile({ fallbackName: name || $session.did });
				} catch {
					syncWarning = m.profilePublicationSyncWarning();
				}
			}
			draft = updatedDraft;
			avatarChange = undefined;
			status = m.saved();
			myProfile.refresh();
		} catch (e) {
			error = e instanceof Error ? e.message : m.saveFailed();
		} finally {
			busy = false;
		}
	}
</script>

<SettingsPage title={m.profileSettingsTitle()} description={m.profileSettingsNote()}>
	{#if !$session && $oauthReady}
		<SignedOutNotice message={m.loginRequired()} />
	{:else if $session}
		<SettingsSection>
			<SettingRow>
				<div class="avatar-setting">
					{#if avatarPreview}<img
							class="avatar-preview"
							src={avatarPreview}
							alt={m.currentAvatarAlt()}
						/>{:else}<span class="avatar large">{name.slice(0, 1) || '○'}</span>{/if}
					<div class="avatar-controls">
						<input
							bind:this={avatarInput}
							type="file"
							accept="image/jpeg,image/png,image/webp"
							class="visually-hidden"
							onchange={selectAvatar}
						/>
						<Button variant="secondary" size="sm" type="button" onclick={() => avatarInput?.click()}
							>{m.selectImage()}</Button
						>
						{#if avatarPreview}<Button
								variant="ghost"
								size="sm"
								type="button"
								onclick={removeAvatar}>{m.remove()}</Button
							>{/if}
						<small>{m.avatarNote()}</small>
					</div>
				</div>
			</SettingRow>
			<SettingRow label={m.displayNameLabel()}>
				<input
					class="settings-input"
					aria-label={m.displayNameLabel()}
					bind:value={name}
					maxlength="640"
				/>
			</SettingRow>
			<SettingRow label={m.bioLabel()}>
				<textarea
					class="settings-input"
					aria-label={m.bioLabel()}
					bind:value={description}
					maxlength="2560"
					rows="4"
				></textarea>
			</SettingRow>
			<SettingRow label={m.profileWebsiteLabel()} description={m.profileWebsiteHelp()}>
				<input
					class="settings-input"
					aria-label={m.profileWebsiteLabel()}
					type="url"
					inputmode="url"
					placeholder="https://example.com"
					bind:value={website}
					maxlength="2048"
				/>
			</SettingRow>
		</SettingsSection>
		<div class="settings-actions">
			<Button variant="primary" disabled={busy || !loaded} onclick={save}
				>{busy ? m.saving() : m.save()}</Button
			>
			{#if status}<p class="settings-status" role="status">{status}</p>{/if}
		</div>
		{#if syncWarning}<p class="settings-error" role="status">{syncWarning}</p>{/if}
		{#if error}<p class="settings-error">{error}</p>{/if}

		<SettingsSection
			title={m.profileCardsSettingsTitle()}
			description={m.profileCardsSettingsHelp()}
		>
			<SettingRow><ProfileAppLinks did={$session?.did} /></SettingRow>
			<a class="settings-category" href="/settings/app-links">
				<span class="settings-category-icon"><Icon name="link" size={20} /></span>
				<span class="settings-category-copy"><strong>{m.profileCardsManage()}</strong></span>
				<Icon name="chevron" size={18} />
			</a>
		</SettingsSection>
	{/if}
</SettingsPage>

{#if cropFile}<AvatarCropper
		file={cropFile}
		onconfirm={applyAvatar}
		oncancel={() => (cropFile = undefined)}
	/>{/if}
