<script lang="ts">
	import Icon from '$lib/components/shell/Icon.svelte';
	import SettingRow from '$lib/components/SettingRow.svelte';
	import SettingsPage from '$lib/components/SettingsPage.svelte';
	import SettingsSection from '$lib/components/SettingsSection.svelte';
	import Button from '$lib/components/Button.svelte';
	import {
		getBlueskyProfileDraft,
		getOwnBlueskyWebsite,
		getOwnNagiProfile,
		ensureOwnNagiProfile,
		hasBlueskyProfileScope,
		normalizeProfileWebsite,
		putProfile,
		putOwnBlueskyWebsite,
		type ProfileDraft,
		uploadAvatar,
	} from '$lib/atproto/records';
	import AvatarCropper from '$lib/components/AvatarCropper.svelte';
	import { APPVIEW_URL, getProfile } from '$lib/api/appview';
	import { session, oauthReady, setOAuthReturnTo, signIn } from '$lib/oauth/session.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { i18n, m } from '$lib/i18n/i18n.svelte';
	import { myProfile } from '$lib/profile/me.svelte';
	import ProfileAppLinks from '$lib/components/ProfileAppLinks.svelte';
	import AgeAssuranceForm from '$lib/components/AgeAssuranceForm.svelte';
	import SignedOutNotice from '$lib/components/SignedOutNotice.svelte';
	import { hasStandardSiteScope } from '$lib/standardsite/preferences';
	import { syncExistingPublicationFromProfile } from '$lib/standardsite/publication';
	import { onDestroy } from 'svelte';
	import { grantedOptIns } from '$lib/optin/scope-optin';

	let name = $state('');
	let description = $state('');
	let website = $state('');
	let initialWebsite = $state('');
	let websiteLoaded = $state(false);
	let websiteGranted = $state(false);
	let websiteReauthBusy = $state(false);
	let websiteWarning = $state('');
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
	let onboarding = $derived(page.url.searchParams.get('onboarding') === '1');

	onDestroy(() => {
		if (avatarPreview?.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
	});
	$effect(() => {
		const did = $session?.did;
		if (!did || loaded) return;
		const profilePromise = getOwnNagiProfile().then(async (profile) => {
			if (!profile) {
				const initial = await ensureOwnNagiProfile();
				if (initial.displayName || initial.description || initial.avatar) return initial;
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
		Promise.all([
			profilePromise,
			getOwnBlueskyWebsite()
				.then((value) => ({ value, failed: false }))
				.catch(() => ({ value: '', failed: true })),
			hasBlueskyProfileScope(),
		])
			.then(([profile, websiteResult, granted]) => {
				if (loaded) return;
				draft = profile;
				avatarPreview = profile.avatarUrl;
				name = profile.displayName;
				description = profile.description;
				website = websiteResult.value;
				initialWebsite = websiteResult.value;
				websiteLoaded = !websiteResult.failed;
				websiteGranted = granted;
				if (websiteResult.failed) websiteWarning = m.profileWebsiteLoadWarning();
				loaded = true;
			})
			.catch((e) => {
				error = e instanceof Error ? e.message : m.profileLoadFailed();
				loaded = true;
			});
	});
	async function reauthorizeWebsite() {
		if (!$session || websiteReauthBusy) return;
		websiteReauthBusy = true;
		setOAuthReturnTo('/settings/profile');
		try {
			await signIn($session.did, { ...(await grantedOptIns()), refreshPermissions: true });
		} finally {
			websiteReauthBusy = false;
		}
	}
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
		const websiteChanged = website.trim() !== initialWebsite;
		if (websiteChanged && (!websiteGranted || !websiteLoaded)) {
			error = m.profileWebsiteUnavailable();
			return;
		}
		const normalizedWebsite = websiteChanged ? normalizeProfileWebsite(website) : initialWebsite;
		if (normalizedWebsite === undefined) {
			error = m.profileWebsiteInvalid();
			return;
		}
		busy = true;
		status = '';
		error = '';
		syncWarning = '';
		websiteWarning = '';
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
			if (websiteChanged && websiteGranted) {
				try {
					await putOwnBlueskyWebsite(normalizedWebsite);
					website = normalizedWebsite;
					initialWebsite = normalizedWebsite;
				} catch {
					websiteWarning = m.profileWebsiteSaveWarning();
				}
			}
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
			if (onboarding) await goto('/');
		} catch (e) {
			error = e instanceof Error ? e.message : m.saveFailed();
		} finally {
			busy = false;
		}
	}
</script>

<SettingsPage
	title={m.profileSettingsTitle()}
	description={m.profileSettingsNote()}
	back={onboarding ? null : undefined}
>
	{#if onboarding}<p class="settings-section-description">{m.onboardingLoadedNote()}</p>{/if}
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
					readonly={!websiteGranted || !websiteLoaded}
				/>
				{#if !websiteGranted}
					<div class="profile-website-permission">
						<p>{m.profileWebsitePermissionNote()}</p>
						<Button
							variant="secondary"
							size="sm"
							type="button"
							disabled={websiteReauthBusy}
							onclick={reauthorizeWebsite}
						>
							{websiteReauthBusy ? m.profileWebsiteReauthPending() : m.profileWebsiteReauthSubmit()}
						</Button>
					</div>
				{/if}
			</SettingRow>
		</SettingsSection>
		{#if onboarding}
			<!--
				初回登録でだけ年齢を訊く。任意なので、入力せず「保存」で先へ進める
				（その場合は18歳未満として扱われ、あとから設定→コンテンツ表示で
				1度だけ登録できる）。
			-->
			<SettingsSection description={m.onboardingAgeIntro()}>
				<SettingRow><AgeAssuranceForm /></SettingRow>
			</SettingsSection>
		{/if}
		<div class="settings-actions">
			<Button variant="primary" disabled={busy || !loaded} onclick={save}
				>{busy ? m.saving() : m.save()}</Button
			>
			{#if status}<p class="settings-status" role="status">{status}</p>{/if}
		</div>
		{#if syncWarning}<p class="settings-error" role="status">{syncWarning}</p>{/if}
		{#if websiteWarning}<p class="settings-error" role="status">{websiteWarning}</p>{/if}
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

<style>
	.profile-website-permission {
		display: grid;
		justify-items: start;
		gap: 8px;
		padding: 12px;
		background: var(--bg-inset);
		border-radius: var(--r-md);
	}
	.profile-website-permission p {
		margin: 0;
		color: var(--text-muted);
		font-size: 0.85rem;
		line-height: 1.6;
	}
</style>
