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
	import { getThemePreference, setThemePreference, type ThemePreference } from '$lib/theme';
	import { i18n, m, setLocalePreference, type LocalePreference } from '$lib/i18n/i18n.svelte';
	import {
		languageName,
		languagePreferences,
		setPostLanguagePreference,
		setTranslationLanguagePreference,
		SUPPORTED_LANGUAGES,
		type LanguagePreference,
	} from '$lib/i18n/languagePreferences.svelte';
	import { onDestroy, onMount } from 'svelte';
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
	let theme = $state<ThemePreference>('system');
	let localePref = $state<LocalePreference>('system');
	let onboarding = $derived(page.url.searchParams.get('onboarding') === '1');
	onMount(() => {
		theme = getThemePreference();
		localePref = i18n.preference;
	});
	onDestroy(() => {
		if (avatarPreview?.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
	});
	function changeTheme(preference: ThemePreference) {
		theme = preference;
		setThemePreference(preference);
	}
	function changeLocale(preference: LocalePreference) {
		localePref = preference;
		setLocalePreference(preference);
	}
	// Use the Nagi profile when editing. On first login, start with the Bluesky profile.
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
					// The PDS record remains the source of truth if AppView has not indexed it yet.
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
			if (onboarding) await goto('/');
		} catch (e) {
			error = e instanceof Error ? e.message : m.saveFailed();
		} finally {
			busy = false;
		}
	}
</script>

<section class="auth-card">
	<h1>{m.navSettings()}</h1>
	<fieldset class="theme-settings">
		<legend>{m.themeLegend()}</legend>
		<p>{m.themeHelp()}</p>
		<div class="theme-options">
			{#each [{ value: 'system', label: m.optionSystem() }, { value: 'light', label: m.themeLight() }, { value: 'dark', label: m.themeDark() }] as option (option.value)}
				<label class:checked={theme === option.value}>
					<input
						type="radio"
						name="theme"
						value={option.value}
						checked={theme === option.value}
						onchange={() => changeTheme(option.value as ThemePreference)}
					/>
					<span>{option.label}</span>
				</label>
			{/each}
		</div>
	</fieldset>
	<fieldset class="theme-settings">
		<legend>{m.languageLegend()}</legend>
		<p>{m.languageHelp()}</p>
		<div class="theme-options">
			{#each [{ value: 'system', label: m.optionSystem() }, { value: 'ja', label: m.localeJa() }, { value: 'en', label: m.localeEn() }] as option (option.value)}
				<label class:checked={localePref === option.value}>
					<input
						type="radio"
						name="locale"
						value={option.value}
						checked={localePref === option.value}
						onchange={() => changeLocale(option.value as LocalePreference)}
					/>
					<span>{option.label}</span>
				</label>
			{/each}
		</div>
	</fieldset>
	<fieldset class="theme-settings language-settings">
		<legend>{m.postLanguageLegend()}</legend>
		<p>{m.postLanguageHelp()}</p>
		<label>
			<span>{m.postLanguageLabel()}</span>
			<select
				value={languagePreferences.postPreference}
				onchange={(event) =>
					setPostLanguagePreference(
						(event.currentTarget as HTMLSelectElement).value as LanguagePreference,
					)}
			>
				<option value="browser">{m.optionBrowser()}</option>
				{#each SUPPORTED_LANGUAGES as language}
					<option value={language}>{languageName(language, i18n.locale)}</option>
				{/each}
			</select>
		</label>
	</fieldset>
	<fieldset class="theme-settings language-settings">
		<legend>{m.translationLanguageLegend()}</legend>
		<p>{m.translationLanguageHelp()}</p>
		<label>
			<span>{m.translationLanguageLabel()}</span>
			<select
				value={languagePreferences.translationPreference}
				onchange={(event) =>
					setTranslationLanguagePreference(
						(event.currentTarget as HTMLSelectElement).value as LanguagePreference,
					)}
			>
				<option value="browser">{m.optionBrowser()}</option>
				{#each SUPPORTED_LANGUAGES as language}
					<option value={language}>{languageName(language, i18n.locale)}</option>
				{/each}
			</select>
		</label>
	</fieldset>
	<h2>{m.profileSettingsTitle()}</h2>
	<p>
		{m.profileSettingsNote()}
	</p>
	{#if onboarding}<p>
			{m.onboardingLoadedNote()}
		</p>{/if}
	{#if !$session && $oauthReady}
		<p>{m.loginRequired()}</p>
		<a class="login" href="/login">{m.login()}</a>
	{:else}
		<div class="avatar-setting">
			{#if avatarPreview}
				<img class="avatar-preview" src={avatarPreview} alt={m.currentAvatarAlt()} />
			{:else}
				<span class="avatar large">{name.slice(0, 1) || '○'}</span>
			{/if}
			<div class="avatar-controls">
				<label class="avatar-select">
					{m.selectImage()}
					<input type="file" accept="image/jpeg,image/png,image/webp" onchange={selectAvatar} />
				</label>
				{#if avatarPreview}
					<button type="button" class="ghost avatar-remove" onclick={removeAvatar}
						>{m.remove()}</button
					>
				{/if}
				<small>{m.avatarNote()}</small>
			</div>
		</div>
		<label>{m.displayNameLabel()}<input bind:value={name} maxlength="640" /></label>
		<label
			>{m.bioLabel()}<textarea bind:value={description} maxlength="2560" rows="4"></textarea></label
		>
		<button disabled={busy || !loaded} onclick={save}>{busy ? m.saving() : m.save()}</button>
		{#if status}<p>{status}</p>{/if}
		{#if error}<p class="error">{error}</p>{/if}
	{/if}
	<div class="legal-links">
		<a href="/terms">{m.termsLink()}</a><a href="/privacy">{m.privacyLink()}</a>
	</div>
</section>

{#if cropFile}
	<AvatarCropper file={cropFile} onconfirm={applyAvatar} oncancel={() => (cropFile = undefined)} />
{/if}

<style>
	.language-settings label {
		margin: 0;
	}

	.language-settings select {
		width: 100%;
		border: 1px solid var(--line-strong);
		border-radius: 12px;
		padding: 13px;
		outline: none;
		background: var(--bg-inset);
		color: var(--text);
	}

	.language-settings select:focus {
		border-color: var(--accent);
	}
</style>
