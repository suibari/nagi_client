<script lang="ts">
	import {
		getThemePalette,
		getThemePreference,
		setThemePalette,
		setThemePreference,
		type ThemePalette,
		type ThemePreference,
	} from '$lib/theme';
	import { m } from '$lib/i18n/i18n.svelte';
	import { onMount } from 'svelte';
	let theme = $state<ThemePreference>('system');
	let palette = $state<ThemePalette>('bot-mint');
	const palettes = $derived([
		{ value: 'bot-mint' as const, label: m.themePaletteBotMint() },
		{ value: 'latte-pink' as const, label: m.themePaletteLattePink() },
		{ value: 'kotomi-orange' as const, label: m.themePaletteKotomiOrange() },
		{ value: 'morpho-blue' as const, label: m.themePaletteMorphoBlue() },
		{ value: 'simple' as const, label: m.themePaletteSimple() },
	]);
	onMount(() => {
		theme = getThemePreference();
		palette = getThemePalette();
	});
	function changeTheme(preference: ThemePreference) {
		theme = preference;
		setThemePreference(preference);
	}
	function changePalette(value: ThemePalette) {
		palette = value;
		setThemePalette(value);
	}
</script>

<section class="auth-card settings-detail">
	<a class="settings-back" href="/settings">← {m.backToSettings()}</a>
	<h1>{m.settingsAppearanceTitle()}</h1>
	<fieldset class="theme-settings palette-settings">
		<legend>{m.themePaletteLegend()}</legend>
		<p>{m.themePaletteHelp()}</p>
		<div class="palette-options">
			{#each palettes as option (option.value)}
				<label class:checked={palette === option.value}>
					<input
						type="radio"
						name="palette"
						value={option.value}
						checked={palette === option.value}
						onchange={() => changePalette(option.value)}
					/>
					<span class="palette-preview" data-preview-palette={option.value} aria-hidden="true">
						{#each ['light', 'dark'] as mode (mode)}
							<span class={`preview-pane ${mode}`}>
								<span class="preview-rail">
									<span class="preview-avatar"></span>
									<span class="preview-nav active"></span>
									<span class="preview-nav"></span>
								</span>
								<span class="preview-content">
									<span class="preview-status"><i></i><i></i><i></i></span>
									<span class="preview-card"><i></i><i></i><i></i><i></i></span>
								</span>
							</span>
						{/each}
					</span>
					<span class="palette-option-name"
						><strong>{option.label}</strong><small>Light / Dark</small></span
					>
				</label>
			{/each}
		</div>
	</fieldset>
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
