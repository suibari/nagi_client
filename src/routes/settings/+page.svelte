<script lang="ts">
	import { goto } from '$app/navigation';
	import SettingsCategoryCard from '$lib/components/SettingsCategoryCard.svelte';
	import PreferencesSyncNotice from '$lib/components/PreferencesSyncNotice.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import { signOut } from '$lib/oauth/session.svelte';

	async function handleSignOut() {
		await signOut();
		await goto('/');
	}
</script>

<section class="settings-page">
	<h1>{m.navSettings()}</h1>
	<PreferencesSyncNotice />
	<div class="settings-groups">
		<section class="settings-group" aria-labelledby="settings-account-heading">
			<h2 id="settings-account-heading">{m.settingsGroupAccount()}</h2>
			<div class="settings-categories">
				<SettingsCategoryCard
					href="/settings/profile"
					icon="profile"
					title={m.settingsProfileTitle()}
					description={m.settingsProfileDescription()}
				/>
			</div>
		</section>

		<section class="settings-group" aria-labelledby="settings-experience-heading">
			<h2 id="settings-experience-heading">{m.settingsGroupExperience()}</h2>
			<div class="settings-categories">
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
					href="/settings/feed-tabs"
					icon="text"
					title={m.settingsFeedTabsTitle()}
					description={m.settingsFeedTabsDescription()}
				/>
				<SettingsCategoryCard
					href="/settings/home-list"
					icon="home"
					title={m.settingsHomeListTitle()}
					description={m.settingsHomeListDescription()}
				/>
				<SettingsCategoryCard
					href="/settings/mute"
					icon="hide"
					title={m.settingsMuteTitle()}
					description={m.settingsMuteDescription()}
				/>
			</div>
		</section>

		<section class="settings-group" aria-labelledby="settings-emoji-heading">
			<h2 id="settings-emoji-heading">{m.settingsGroupEmoji()}</h2>
			<div class="settings-categories">
				<SettingsCategoryCard
					href="/settings/emoji-favorites"
					icon="heart"
					title={m.emojiFavoritesSettingsTitle()}
					description={m.emojiFavoritesSettingsDescription()}
				/>
				<SettingsCategoryCard
					href="/settings/emoji"
					icon="emoji"
					title={m.emojiSettingsTitle()}
					description={m.emojiSettingsDescription()}
				/>
			</div>
		</section>

		<section class="settings-group" aria-labelledby="settings-publishing-heading">
			<h2 id="settings-publishing-heading">{m.settingsGroupPublishing()}</h2>
			<div class="settings-categories">
				<SettingsCategoryCard
					href="/settings/crosspost"
					icon="send"
					title={m.settingsExternalPublishingTitle()}
					description={m.settingsExternalPublishingDescription()}
				/>
			</div>
		</section>

		<section class="settings-group" aria-labelledby="settings-nagi-heading">
			<h2 id="settings-nagi-heading">{m.settingsGroupNagi()}</h2>
			<div class="settings-categories">
				<SettingsCategoryCard
					href="/about"
					icon="info"
					title={m.settingsAboutTitle()}
					description={m.settingsAboutDescription()}
				/>
			</div>
		</section>

		<section
			class="settings-group settings-account-actions"
			aria-labelledby="settings-actions-heading"
		>
			<h2 id="settings-actions-heading">{m.settingsGroupAccountActions()}</h2>
			<div class="settings-categories">
				<SettingsCategoryCard
					icon="logout"
					title={m.signOut()}
					description={m.signOutDescription()}
					variant="account"
					onclick={() => void handleSignOut()}
				/>
				<SettingsCategoryCard
					href="/settings/delete-data"
					icon="trash"
					title={m.settingsDeleteTitle()}
					description={m.settingsDeleteDescription()}
					variant="account"
					danger
				/>
			</div>
		</section>
	</div>
</section>
