<script lang="ts">
	import { goto } from '$app/navigation';
	import { deleteAccountData, prepareDeleteAccountData } from '$lib/api/appview';
	import { deleteAllNagiRecords } from '$lib/atproto/records';
	import DeleteAccountDataDialog from '$lib/components/DeleteAccountDataDialog.svelte';
	import { clearLocalePreference, m } from '$lib/i18n/i18n.svelte';
	import { clearLanguagePreferences } from '$lib/i18n/languagePreferences.svelte';
	import { oauthReady, session, signOut } from '$lib/oauth/session.svelte';
	import { clearThemePreference } from '$lib/theme';
	import { drafts } from '$lib/drafts/drafts.svelte';

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
			// 下書きは AppView に無く端末ローカルなので、ここで一緒に消す。
			await drafts.clear(did).catch(() => undefined);
			clearThemePreference();
			clearLanguagePreferences();
			clearLocalePreference();
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
	{#if !$session && $oauthReady}
		<p>{m.deleteDataLoginRequired()}</p>
		<a class="login" href="/login">{m.login()}</a>
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
