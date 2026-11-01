<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import { goto } from '$app/navigation';
	import { deleteAccountData, prepareDeleteAccountData } from '$lib/api/appview';
	import { deleteAllNagiRecords } from '$lib/atproto/records';
	import DeleteAccountDataDialog from '$lib/components/DeleteAccountDataDialog.svelte';
	import { clearLocalePreference, m } from '$lib/i18n/i18n.svelte';
	import { clearLanguagePreferences } from '$lib/i18n/languagePreferences.svelte';
	import { oauthReady, session, signOut } from '$lib/oauth/session.svelte';
	import SignedOutNotice from '$lib/components/SignedOutNotice.svelte';
	import SettingRow from '$lib/components/SettingRow.svelte';
	import SettingsPage from '$lib/components/SettingsPage.svelte';
	import SettingsSection from '$lib/components/SettingsSection.svelte';
	import { clearThemePreference } from '$lib/theme';
	import { clearModerationPreferences } from '$lib/moderation/preferences.svelte';
	import { drafts } from '$lib/drafts/drafts.svelte';
	import { clearLocalPreferenceCache } from '$lib/preferences/sync.svelte';
	import { clearBookmarkPreferenceCache } from '$lib/bookmarks/bookmarks.svelte';

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
			// 廃止した「みんなで全肯定」で反応済みの URI（こっそり投稿を含みうる）。
			try {
				localStorage.removeItem('nagi:community-affirmation-reacted:v1');
			} catch {
				/* 端末側の掃除なので失敗しても続ける。 */
			}
			await signOut().catch(() => undefined);
			await goto('/');
		} catch (e) {
			error = e instanceof Error ? e.message : m.deleteDataFailed();
			busy = false;
			dialogOpen = false;
		}
	}
</script>

<SettingsPage title={m.settingsDeleteTitle()} description={m.deleteDataWarning()}>
	<SettingsSection>
		<SettingRow description={m.draftsClearedNote()} />
		<!-- 「残るもの」の注記。警告と役割が逆（消えない範囲の説明）なので、赤ではなく同じ面の行にする。 -->
		<SettingRow description={m.deleteDataKeptNote()} />
	</SettingsSection>
	{#if !$session && $oauthReady}
		<SignedOutNotice message={m.deleteDataLoginRequired()} />
	{:else if $session}
		<SettingsSection>
			<SettingRow label={m.deleteDataPhrase()} description={m.deleteDataInstruction()}>
				<input
					class="settings-input"
					bind:value={confirmation}
					autocomplete="off"
					aria-label={m.deleteDataInstruction()}
				/>
			</SettingRow>
		</SettingsSection>
		<div class="settings-actions">
			<Button
				variant="danger"
				disabled={!matches || busy}
				onclick={() => {
					error = '';
					dialogOpen = true;
				}}>{m.deleteDataButton()}</Button
			>
			{#if error}<Button variant="secondary" disabled={busy} onclick={() => (dialogOpen = true)}
					>{m.retry()}</Button
				>{/if}
		</div>
		{#if error}<p class="settings-error" role="alert">{error}</p>{/if}
	{/if}
</SettingsPage>

{#if dialogOpen}<DeleteAccountDataDialog
		{busy}
		{error}
		onconfirm={() => void removeEverything()}
		oncancel={() => {
			if (!busy) dialogOpen = false;
		}}
	/>{/if}
