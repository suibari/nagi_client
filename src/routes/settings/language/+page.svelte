<script lang="ts">
	import { i18n, m, setLocalePreference, type LocalePreference } from '$lib/i18n/i18n.svelte';
	import {
		languageName,
		languagePreferences,
		setAutoTranslatePreference,
		setPostLanguagePreference,
		setTranslationLanguagePreference,
		setTranslationProviderPreference,
		SUPPORTED_LANGUAGES,
		type LanguagePreference,
	} from '$lib/i18n/languagePreferences.svelte';
	import { TRANSLATION_PROVIDERS, type TranslationProvider } from '$lib/i18n/translationProviders';
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';
	import SettingRow from '$lib/components/SettingRow.svelte';
	import SettingsPage from '$lib/components/SettingsPage.svelte';
	import SettingsSection from '$lib/components/SettingsSection.svelte';
	import ToggleSwitch from '$lib/components/ToggleSwitch.svelte';
	import { onMount } from 'svelte';
	let localePref = $state<LocalePreference>('system');
	onMount(() => (localePref = i18n.preference));
	function changeLocale(preference: LocalePreference) {
		localePref = preference;
		setLocalePreference(preference);
	}
	const locales = $derived([
		{ value: 'system' as const, label: m.optionSystem() },
		{ value: 'ja' as const, label: m.localeJa() },
		{ value: 'en' as const, label: m.localeEn() },
	]);
</script>

{#snippet languageSelect(
	value: LanguagePreference,
	change: (value: LanguagePreference) => void,
	labelledby: string,
	describedby: string | undefined,
)}
	<select
		class="settings-select"
		{value}
		aria-labelledby={labelledby}
		aria-describedby={describedby}
		onchange={(event) =>
			change((event.currentTarget as HTMLSelectElement).value as LanguagePreference)}
	>
		<option value="browser">{m.optionBrowser()}</option>
		{#each SUPPORTED_LANGUAGES as language (language)}<option value={language}
				>{languageName(language, i18n.locale)}</option
			>{/each}
	</select>
{/snippet}

<SettingsPage title={m.settingsLanguageTitle()}>
	<SettingsSection>
		<SettingRow label={m.languageLegend()} description={m.languageHelp()}>
			{#snippet control({ labelId, descriptionId })}
				<SegmentedControl
					options={locales}
					value={localePref}
					onchange={changeLocale}
					labelledby={labelId}
					describedby={descriptionId}
				/>
			{/snippet}
		</SettingRow>
		<SettingRow label={m.postLanguageLegend()} description={m.postLanguageHelp()}>
			{#snippet control({ labelId, descriptionId })}
				{@render languageSelect(
					languagePreferences.postPreference,
					setPostLanguagePreference,
					labelId,
					descriptionId,
				)}
			{/snippet}
		</SettingRow>
	</SettingsSection>
	<SettingsSection>
		<SettingRow label={m.translationLanguageLegend()} description={m.translationLanguageHelp()}>
			{#snippet control({ labelId, descriptionId })}
				{@render languageSelect(
					languagePreferences.translationPreference,
					setTranslationLanguagePreference,
					labelId,
					descriptionId,
				)}
			{/snippet}
		</SettingRow>
		<SettingRow label={m.autoTranslateLegend()} description={m.autoTranslateHelp()}>
			{#snippet control({ labelId, descriptionId })}
				<ToggleSwitch
					checked={languagePreferences.autoTranslate}
					labelledby={labelId}
					describedby={descriptionId}
					onchange={setAutoTranslatePreference}
				/>
			{/snippet}
		</SettingRow>
		<SettingRow label={m.translationProviderLegend()} description={m.translationProviderHelp()}>
			{#snippet control({ labelId, descriptionId })}
				<select
					class="settings-select"
					value={languagePreferences.translationProvider}
					aria-labelledby={labelId}
					aria-describedby={descriptionId}
					onchange={(event) =>
						setTranslationProviderPreference(
							(event.currentTarget as HTMLSelectElement).value as TranslationProvider,
						)}
				>
					{#each TRANSLATION_PROVIDERS as provider (provider.id)}<option value={provider.id}
							>{provider.name}</option
						>{/each}
				</select>
			{/snippet}
		</SettingRow>
	</SettingsSection>
</SettingsPage>
