<script lang="ts">
	import { i18n, m, setLocalePreference, type LocalePreference } from '$lib/i18n/i18n.svelte';
	import {
		languageName,
		languagePreferences,
		setPostLanguagePreference,
		setTranslationLanguagePreference,
		SUPPORTED_LANGUAGES,
		type LanguagePreference,
	} from '$lib/i18n/languagePreferences.svelte';
	import { onMount } from 'svelte';
	let localePref = $state<LocalePreference>('system');
	onMount(() => (localePref = i18n.preference));
	function changeLocale(preference: LocalePreference) {
		localePref = preference;
		setLocalePreference(preference);
	}
</script>

<section class="auth-card settings-detail">
	<a class="settings-back" href="/settings">← {m.backToSettings()}</a>
	<h1>{m.settingsLanguageTitle()}</h1>
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
	{#each [{ legend: m.postLanguageLegend(), help: m.postLanguageHelp(), label: m.postLanguageLabel(), value: languagePreferences.postPreference, change: setPostLanguagePreference }, { legend: m.translationLanguageLegend(), help: m.translationLanguageHelp(), label: m.translationLanguageLabel(), value: languagePreferences.translationPreference, change: setTranslationLanguagePreference }] as setting (setting.legend)}
		<fieldset class="theme-settings language-settings">
			<legend>{setting.legend}</legend>
			<p>{setting.help}</p>
			<label
				><span>{setting.label}</span><select
					value={setting.value}
					onchange={(event) =>
						setting.change((event.currentTarget as HTMLSelectElement).value as LanguagePreference)}
				>
					<option value="browser">{m.optionBrowser()}</option>
					{#each SUPPORTED_LANGUAGES as language}<option value={language}
							>{languageName(language, i18n.locale)}</option
						>{/each}
				</select></label
			>
		</fieldset>
	{/each}
</section>

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
