<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { onMount } from 'svelte';
	import { getPreferences, putPreferences } from '$lib/api/appview';
	import { m } from '$lib/i18n/i18n.svelte';
	import { oauthReady, session } from '$lib/oauth/session.svelte';
	import SignedOutNotice from '$lib/components/SignedOutNotice.svelte';
	import SettingRow from '$lib/components/SettingRow.svelte';
	import SettingsPage from '$lib/components/SettingsPage.svelte';
	import SettingsSection from '$lib/components/SettingsSection.svelte';

	/** lexicon の maxGraphemes と揃えること（サーバ側も同じ値で弾く）。 */
	const MAX_LENGTH = 40;

	let loading = $state(true);
	let saving = $state(false);
	let error = $state('');
	let saved = $state(false);
	/** サーバに保存されている呼び名。空文字＝未設定（表示名で呼ばれる）。 */
	let current = $state('');
	let draft = $state('');

	let trimmed = $derived(draft.trim());
	let tooLong = $derived([...trimmed].length > MAX_LENGTH);
	let dirty = $derived(trimmed !== current);

	onMount(async () => {
		if (!$session) {
			loading = false;
			return;
		}
		try {
			const view = await getPreferences();
			current = view.preferredName ?? '';
			draft = current;
		} catch (e) {
			error = e instanceof Error ? e.message : m.botNameLoadFailed();
		} finally {
			loading = false;
		}
	});

	async function save(next: string) {
		if (saving) return;
		saving = true;
		error = '';
		saved = false;
		try {
			// 空文字を送ると登録を解除して表示名に戻る（サーバ側で行を消す）。
			const view = await putPreferences({ preferredName: next });
			current = view.preferredName ?? '';
			draft = current;
			saved = true;
		} catch (e) {
			error = e instanceof Error ? e.message : m.botNameSaveFailed();
		} finally {
			saving = false;
		}
	}
</script>

<SettingsPage title={m.settingsBotNameTitle()}>
	{#if !$session && $oauthReady}
		<SignedOutNotice message={m.botNameLoginRequired()} />
	{:else if $session}
		{#if loading}
			<Spinner />
		{:else}
			<SettingsSection description={m.botNameHelp()}>
				<SettingRow
					label={m.botNameLabel()}
					description={current ? m.botNameCurrent({ name: current }) : m.botNameUnset()}
				>
					<input
						class="settings-input"
						bind:value={draft}
						maxlength={MAX_LENGTH * 3}
						autocomplete="off"
						aria-label={m.botNameLabel()}
						placeholder={m.botNamePlaceholder()}
						disabled={saving}
					/>
					{#if tooLong}<p class="settings-error" role="alert">
							{m.botNameTooLong({ max: MAX_LENGTH })}
						</p>{/if}
				</SettingRow>
			</SettingsSection>
			<div class="settings-actions">
				<Button
					variant="primary"
					disabled={!dirty || tooLong || !trimmed || saving}
					onclick={() => void save(trimmed)}
				>
					{saving ? m.botNameSaving() : m.save()}
				</Button>
				<!-- 解除は取り返しがつく（表示名に戻るだけ）ので、danger ではなく控えめに。 -->
				{#if current}
					<Button variant="secondary" disabled={saving} onclick={() => void save('')}>
						{m.botNameClear()}
					</Button>
				{/if}
				{#if saved && !dirty}<p class="settings-status" role="status">{m.botNameSaved()}</p>{/if}
			</div>
		{/if}
	{/if}

	{#if error}<p class="settings-error" role="alert">{error}</p>{/if}
</SettingsPage>
