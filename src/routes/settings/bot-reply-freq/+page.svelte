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

	let loading = $state(true);
	let saving = $state(false);
	let error = $state('');
	let saved = $state(false);

	/** サーバに保存されている返信確率（0〜100、デフォルト100）。 */
	let currentFreq = $state(100);
	let draftFreq = $state(100);

	let dirty = $derived(draftFreq !== currentFreq);

	onMount(async () => {
		if (!$session) {
			loading = false;
			return;
		}
		try {
			const view = await getPreferences();
			currentFreq = view.replyFreq ?? 100;
			draftFreq = currentFreq;
		} catch (e) {
			error = e instanceof Error ? e.message : m.botReplyFreqLoadFailed();
		} finally {
			loading = false;
		}
	});

	async function save() {
		if (saving || !dirty) return;
		saving = true;
		error = '';
		saved = false;
		try {
			const view = await putPreferences({ replyFreq: draftFreq });
			currentFreq = view.replyFreq ?? 100;
			draftFreq = currentFreq;
			saved = true;
		} catch (e) {
			error = e instanceof Error ? e.message : m.botReplyFreqSaveFailed();
		} finally {
			saving = false;
		}
	}
</script>

<SettingsPage title={m.settingsBotReplyFreqTitle()}>
	{#if !$session && $oauthReady}
		<SignedOutNotice message={m.botReplyFreqLoginRequired()} />
	{:else if $session}
		{#if loading}
			<Spinner />
		{:else}
			<SettingsSection description={m.botReplyFreqHelp()}>
				<SettingRow label={m.botReplyFreqLabel()}>
					{#snippet control()}
						<output class="bot-reply-freq-value" for="bot-reply-freq-range">{draftFreq}%</output>
					{/snippet}
					<input
						id="bot-reply-freq-range"
						type="range"
						min="0"
						max="100"
						step="1"
						aria-label={m.botReplyFreqLabel()}
						bind:value={draftFreq}
						disabled={saving}
						class="bot-reply-freq-slider"
					/>
					<div class="bot-reply-freq-labels" aria-hidden="true">
						<span>0%</span>
						<span>50%</span>
						<span>100%</span>
					</div>
				</SettingRow>
			</SettingsSection>
			<div class="settings-actions">
				<Button variant="primary" disabled={!dirty || saving} onclick={() => void save()}>
					{saving ? m.botReplyFreqSaving() : m.save()}
				</Button>
				{#if saved && !dirty}
					<p class="settings-status" role="status">{m.botReplyFreqSaved()}</p>
				{/if}
			</div>
		{/if}
	{/if}

	{#if error}
		<p class="settings-error" role="alert">{error}</p>
	{/if}
</SettingsPage>
