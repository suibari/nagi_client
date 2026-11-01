<script lang="ts">
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';
	import SettingRow from '$lib/components/SettingRow.svelte';
	import SettingsPage from '$lib/components/SettingsPage.svelte';
	import SettingsSection from '$lib/components/SettingsSection.svelte';
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
	const themes = $derived([
		{ value: 'system' as const, label: m.optionSystem() },
		{ value: 'light' as const, label: m.themeLight() },
		{ value: 'dark' as const, label: m.themeDark() },
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

<SettingsPage title={m.settingsAppearanceTitle()}>
	<SettingsSection>
		<SettingRow label={m.themeLegend()} description={m.themeHelp()}>
			{#snippet control({ labelId, descriptionId })}
				<SegmentedControl
					options={themes}
					value={theme}
					onchange={changeTheme}
					labelledby={labelId}
					describedby={descriptionId}
				/>
			{/snippet}
		</SettingRow>
		<SettingRow label={m.themePaletteLegend()} description={m.themePaletteHelp()}>
			<div class="palette-options" role="radiogroup" aria-label={m.themePaletteLegend()}>
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
		</SettingRow>
	</SettingsSection>
</SettingsPage>
