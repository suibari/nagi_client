<script lang="ts">
	import { goto } from '$app/navigation';
	import SettingsCategoryCard from '$lib/components/SettingsCategoryCard.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import { signOut } from '$lib/oauth/session.svelte';

	async function handleSignOut() {
		await signOut();
		await goto('/');
	}
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
			href="/settings/emoji"
			icon="emoji"
			title={m.emojiSettingsTitle()}
			description={m.emojiSettingsDescription()}
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
			href="/settings/notifications"
			icon="bell"
			title={m.settingsNotificationsTitle()}
			description={m.settingsNotificationsDescription()}
		/>
		<SettingsCategoryCard
			href="/settings/crosspost"
			icon="send"
			title={m.settingsCrosspostTitle()}
			description={m.settingsCrosspostDescription()}
		/>
		<SettingsCategoryCard
			href="/settings/about"
			icon="info"
			title={m.settingsAboutTitle()}
			description={m.settingsAboutDescription()}
		/>
		<SettingsCategoryCard
			icon="logout"
			title={m.signOut()}
			description={m.signOutDescription()}
			onclick={() => void handleSignOut()}
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
