<script lang="ts">
	import { m } from '$lib/i18n/i18n.svelte';
	import { oauthReady, session } from '$lib/oauth/session.svelte';
	import AgeAssuranceForm from '$lib/components/AgeAssuranceForm.svelte';
	import SignedOutNotice from '$lib/components/SignedOutNotice.svelte';
	import { ageAssurance } from '$lib/moderation/age.svelte';
	import {
		moderationPreferences,
		setModerationPreference,
		type ModerationPreference,
		type ModerationPreferenceKey,
	} from '$lib/moderation/preferences.svelte';

	const groups: Array<{ key: ModerationPreferenceKey; label: () => string }> = [
		{ key: 'automatic', label: () => m.moderationAutomaticLabel() },
		{ key: 'selfAi', label: () => m.moderationSelfAiLabel() },
		{ key: 'selfNsfw', label: () => m.moderationSelfNsfwLabel() },
	];
	const options: Array<{ value: ModerationPreference; label: () => string }> = [
		{ value: 'warn', label: () => m.moderationOptionWarn() },
		{ value: 'hide', label: () => m.moderationOptionHide() },
		{ value: 'ignore', label: () => m.moderationOptionIgnore() },
	];
</script>

<section class="auth-card settings-detail">
	<a class="settings-back" href="/settings">← {m.backToSettings()}</a>
	<h1>{m.settingsModerationTitle()}</h1>

	<!--
		年齢確認と表示設定は、どちらもアカウントに紐づく判断（年齢は AppView が持ち、
		成人向けの出し分けもサーバが行う）。他の設定ページと同じくログインを必須にする。
	-->
	{#if !$session && $oauthReady}
		<SignedOutNotice message={m.moderationLoginRequired()} />
	{:else if $session}
		<AgeAssuranceForm />
		<p>{m.moderationSettingsHelp()}</p>
		<!--
			未成年に成人向けを見せない強制はサーバ側（AppView が返さない）。ここでの設定は
			成人ユーザーの好みなので、未成年アカウントには効かないことを明示する。
		-->
		{#if !ageAssurance.loading && !ageAssurance.isAdult}
			<p class="adult-locked">{m.ageAdultLocked()}</p>
		{/if}
		{#each groups as group (group.key)}
			<fieldset class="theme-settings">
				<legend>{group.label()}</legend>
				<div class="theme-options">
					{#each options as option (option.value)}
						<label class:checked={moderationPreferences[group.key] === option.value}>
							<input
								type="radio"
								name={group.key}
								value={option.value}
								checked={moderationPreferences[group.key] === option.value}
								onchange={() => setModerationPreference(group.key, option.value)}
							/>
							<span>{option.label()}</span>
						</label>
					{/each}
				</div>
			</fieldset>
		{/each}
	{/if}
</section>

<style>
	.adult-locked {
		color: var(--text-muted);
		font-size: 0.9rem;
	}
</style>
