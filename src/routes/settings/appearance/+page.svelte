<script lang="ts">
	import { getThemePreference, setThemePreference, type ThemePreference } from '$lib/theme';
	import { m } from '$lib/i18n/i18n.svelte';
	import { onMount } from 'svelte';
	let theme = $state<ThemePreference>('system');
	onMount(() => (theme = getThemePreference()));
	function changeTheme(preference: ThemePreference) {
		theme = preference;
		setThemePreference(preference);
	}
</script>

<section class="auth-card settings-detail">
	<a class="settings-back" href="/settings">← {m.backToSettings()}</a>
	<h1>{m.settingsAppearanceTitle()}</h1>
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
</section>
