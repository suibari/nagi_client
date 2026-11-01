<script lang="ts">
	import { m } from '$lib/i18n/i18n.svelte';
	import { oauthReady, session } from '$lib/oauth/session.svelte';
	import AgeAssuranceForm from '$lib/components/AgeAssuranceForm.svelte';
	import SignedOutNotice from '$lib/components/SignedOutNotice.svelte';
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';
	import SettingRow from '$lib/components/SettingRow.svelte';
	import SettingsPage from '$lib/components/SettingsPage.svelte';
	import SettingsSection from '$lib/components/SettingsSection.svelte';
	import { ageAssurance } from '$lib/moderation/age.svelte';
	import {
		moderationPreferences,
		setModerationPreference,
		type ModerationPreference,
		type ModerationPreferenceKey,
	} from '$lib/moderation/preferences.svelte';

	const groups: Array<{ key: ModerationPreferenceKey; label: () => string }> = [
		{ key: 'selfNsfw', label: () => m.moderationSelfNsfwLabel() },
		{ key: 'selfAi', label: () => m.moderationSelfAiLabel() },
		{ key: 'automatic', label: () => m.moderationAutomaticLabel() },
	];
	const options: Array<{ value: ModerationPreference; label: () => string }> = [
		{ value: 'warn', label: () => m.moderationOptionWarn() },
		{ value: 'hide', label: () => m.moderationOptionHide() },
		{ value: 'ignore', label: () => m.moderationOptionIgnore() },
	];
</script>

<SettingsPage title={m.settingsModerationTitle()}>
	<!--
		年齢確認と表示設定は、どちらもアカウントに紐づく判断（年齢は AppView が持ち、
		成人向けの出し分けもサーバが行う）。他の設定ページと同じくログインを必須にする。
	-->
	{#if !$session && $oauthReady}
		<SignedOutNotice message={m.moderationLoginRequired()} />
	{:else if $session}
		<!--
			未成年に成人向けを見せない強制はサーバ側（AppView が返さない）。ここでの設定は
			成人ユーザーの好みなので、未成年アカウントには効かないことを明示する。
		-->
		<SettingsSection
			title={m.moderationSectionTitle()}
			description={!ageAssurance.loading && !ageAssurance.isAdult
				? `${m.moderationSettingsHelp()} ${m.ageAdultLocked()}`
				: m.moderationSettingsHelp()}
		>
			{#each groups as group (group.key)}
				<SettingRow label={group.label()}>
					{#snippet control({ labelId })}
						<SegmentedControl
							options={options.map((option) => ({ value: option.value, label: option.label() }))}
							value={moderationPreferences[group.key]}
							onchange={(value) => setModerationPreference(group.key, value)}
							labelledby={labelId}
						/>
					{/snippet}
				</SettingRow>
			{/each}
		</SettingsSection>
		<SettingsSection title={m.ageSectionTitle()}>
			<SettingRow>
				<AgeAssuranceForm hideHeading />
			</SettingRow>
		</SettingsSection>
	{/if}
</SettingsPage>
