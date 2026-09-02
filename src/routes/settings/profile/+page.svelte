<script lang="ts">
	import {
		getBlueskyProfileDraft,
		getOwnBlueskyWebsite,
		getOwnNagiProfile,
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
			if (!profile) return getBlueskyProfileDraft();
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

<section class="auth-card settings-detail">
	{#if !onboarding}<a class="settings-back" href="/settings">← {m.backToSettings()}</a>{/if}
	<h1>{m.profileSettingsTitle()}</h1>
	<p>{m.profileSettingsNote()}</p>
	{#if onboarding}<p>{m.onboardingLoadedNote()}</p>{/if}
	{#if !$session && $oauthReady}
		<SignedOutNotice message={m.loginRequired()} />
	{:else if $session}
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
				<button type="button" class="avatar-select" onclick={() => avatarInput?.click()}
					>{m.selectImage()}</button
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
		<label
			>{m.profileWebsiteLabel()}<input
				type="url"
				inputmode="url"
				placeholder="https://example.com"
				bind:value={website}
				readonly={!websiteGranted || !websiteLoaded}
			/></label
		>
		<small class="profile-website-help">{m.profileWebsiteHelp()}</small>
		{#if $session && !websiteGranted}
			<div class="profile-website-permission">
				<p>{m.profileWebsitePermissionNote()}</p>
				<button type="button" disabled={websiteReauthBusy} onclick={reauthorizeWebsite}>
					{websiteReauthBusy ? m.profileWebsiteReauthPending() : m.profileWebsiteReauthSubmit()}
				</button>
			</div>
		{/if}
		{#if onboarding}
			<!--
				初回登録でだけ年齢を訊く。任意なので、入力せず「保存」で先へ進める
				（その場合は18歳未満として扱われ、あとから設定→コンテンツ表示で
				1度だけ登録できる）。
			-->
			<section class="onboarding-age">
				<p class="onboarding-age-intro">{m.onboardingAgeIntro()}</p>
				<AgeAssuranceForm />
			</section>
		{/if}
		<button disabled={busy || !loaded} onclick={save}>{busy ? m.saving() : m.save()}</button>
		{#if status}<p>{status}</p>{/if}
		{#if syncWarning}<p class="error" role="status">{syncWarning}</p>{/if}
		{#if websiteWarning}<p class="error" role="status">{websiteWarning}</p>{/if}
		{#if error}<p class="error">{error}</p>{/if}

		<section class="profile-card-settings" aria-labelledby="profile-card-settings-heading">
			<h2 id="profile-card-settings-heading">{m.profileCardsSettingsTitle()}</h2>
			<p>{m.profileCardsSettingsHelp()}</p>
			<ProfileAppLinks did={$session?.did} />
			<a class="profile-cards-manage" href="/settings/app-links">{m.profileCardsManage()}</a>
		</section>
	{/if}
</section>

{#if cropFile}<AvatarCropper
		file={cropFile}
		onconfirm={applyAvatar}
		oncancel={() => (cropFile = undefined)}
	/>{/if}

<style>
	.onboarding-age {
		display: grid;
		gap: 0.5rem;
		margin-top: 0.5rem;
		padding-top: 1.25rem;
		border-top: 1px solid var(--line);
		text-align: left;
	}
	.onboarding-age-intro {
		margin: 0;
		color: var(--text-muted);
		font-size: 0.9rem;
	}
	.profile-card-settings {
		display: grid;
		gap: 0.75rem;
		margin-top: 0.5rem;
		padding-top: 1.25rem;
		border-top: 1px solid var(--line);
		text-align: left;
	}
	.profile-card-settings h2,
	.profile-card-settings p {
		margin: 0;
	}
	.profile-cards-manage {
		width: fit-content;
		font-weight: 700;
	}
	.profile-website-help {
		margin-top: -0.5rem;
		color: var(--text-muted);
		text-align: left;
	}
	.profile-website-permission {
		padding: 0.75rem;
		border: 1px solid var(--line);
		border-radius: var(--radius-m);
		text-align: left;
	}
	.profile-website-permission p {
		margin-top: 0;
	}
</style>
