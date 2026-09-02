<script lang="ts">
	import { goto } from '$app/navigation';
	import { deleteAccountData, prepareDeleteAccountData } from '$lib/api/appview';
	import { deleteAllNagiRecords } from '$lib/atproto/records';
	import DeleteAccountDataDialog from '$lib/components/DeleteAccountDataDialog.svelte';
	import { clearLocalePreference, m } from '$lib/i18n/i18n.svelte';
	import { clearLanguagePreferences } from '$lib/i18n/languagePreferences.svelte';
	import { oauthReady, session, signOut } from '$lib/oauth/session.svelte';
	import SignedOutNotice from '$lib/components/SignedOutNotice.svelte';
	import { clearThemePreference } from '$lib/theme';
	import { clearModerationPreferences } from '$lib/moderation/preferences.svelte';
	import { drafts } from '$lib/drafts/drafts.svelte';
	import { clearLocalPreferenceCache } from '$lib/preferences/sync.svelte';
	import { clearBookmarkPreferenceCache } from '$lib/bookmarks/bookmarks.svelte';
	import { clearLegacyCommunityAffirmationHandledUris } from '$lib/community-affirmation/seen';

	let confirmation = $state('');
	let dialogOpen = $state(false);
	let busy = $state(false);
	let error = $state('');
	let matches = $derived(confirmation === m.deleteDataPhrase());

	async function removeEverything() {
		if (busy || !$session) return;
		busy = true;
		error = '';
		const did = $session.did;
		try {
			await prepareDeleteAccountData();
			await deleteAllNagiRecords();
			await deleteAccountData();
			// AppViewの下書きはサーバ削除済み。移行未完了の画像付き旧下書きも端末から消す。
			await drafts.clear(did).catch(() => undefined);
			clearThemePreference();
			clearModerationPreferences(did);
			clearLanguagePreferences();
			clearLocalePreference();
			// 既読位置とお気に入りは AppView と端末の両方にある。サーバー側は
			// deleteAccountData が消すので、端末のキャッシュもここで揃えて消す。
			clearLocalPreferenceCache(did);
			clearBookmarkPreferenceCache(did);
			clearLegacyCommunityAffirmationHandledUris();
			await signOut().catch(() => undefined);
			await goto('/');
		} catch (e) {
			error = e instanceof Error ? e.message : m.deleteDataFailed();
			busy = false;
			dialogOpen = false;
		}
	}
</script>

<section class="auth-card settings-detail delete-data-page">
	<a class="settings-back" href="/settings">← {m.backToSettings()}</a>
	<h1>{m.settingsDeleteTitle()}</h1>
	<p>{m.deleteDataWarning()}</p>
	<p>{m.draftsClearedNote()}</p>
	<p class="delete-data-kept">{m.deleteDataKeptNote()}</p>
	{#if !$session && $oauthReady}
		<SignedOutNotice message={m.deleteDataLoginRequired()} />
	{:else if $session}
		<label
			>{m.deleteDataInstruction()}<strong>{m.deleteDataPhrase()}</strong><input
				bind:value={confirmation}
				autocomplete="off"
			/></label
		>
		<button
			class="danger-button"
			disabled={!matches || busy}
			onclick={() => {
				error = '';
				dialogOpen = true;
			}}>{m.deleteDataButton()}</button
		>
		{#if error}<p class="error" role="alert">{error}</p>
			<button class="retry-delete" disabled={busy} onclick={() => (dialogOpen = true)}
				>{m.retry()}</button
			>{/if}
	{/if}
</section>

{#if dialogOpen}<DeleteAccountDataDialog
		{busy}
		{error}
		onconfirm={() => void removeEverything()}
		oncancel={() => {
			if (!busy) dialogOpen = false;
		}}
	/>{/if}
