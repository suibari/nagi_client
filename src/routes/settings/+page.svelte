<script lang="ts">
	import SettingsCategoryCard from '$lib/components/SettingsCategoryCard.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
</script>

<section class="settings-page">
	<h1>{m.navSettings()}</h1>
	<div class="settings-categories">
		<SettingsCategoryCard
			href="/settings/profile"
			icon="profile"
			title={m.settingsProfileTitle()}
			description={m.settingsProfileDescription()}
		/>
		<SettingsCategoryCard
			href="/settings/appearance"
			icon="sun"
			title={m.settingsAppearanceTitle()}
			description={m.settingsAppearanceDescription()}
		/>
		<SettingsCategoryCard
			href="/settings/language"
			icon="language"
			title={m.settingsLanguageTitle()}
			description={m.settingsLanguageDescription()}
		/>
		<SettingsCategoryCard
			href="/settings/about"
			icon="info"
			title={m.settingsAboutTitle()}
			description={m.settingsAboutDescription()}
		/>
		<SettingsCategoryCard
			href="/settings/delete-data"
			icon="trash"
			title={m.settingsDeleteTitle()}
			description={m.settingsDeleteDescription()}
			danger
		/>
	</div>
</section>
