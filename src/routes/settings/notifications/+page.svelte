<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { onMount } from 'svelte';
	import { getPreferences, putPreferences } from '$lib/api/appview';
	import type { NotificationPreferenceCategory, NotificationPreferences } from '$lib/api/types';
	import { m } from '$lib/i18n/i18n.svelte';
	import { oauthReady, session, setOAuthReturnTo, signIn } from '$lib/oauth/session.svelte';
	import { grantedOptIns } from '$lib/optin/scope-optin';
	import ToggleSwitch from '$lib/components/ToggleSwitch.svelte';
	import SignedOutNotice from '$lib/components/SignedOutNotice.svelte';
	import SettingRow from '$lib/components/SettingRow.svelte';
	import SettingsPage from '$lib/components/SettingsPage.svelte';
	import SettingsSection from '$lib/components/SettingsSection.svelte';
	import {
		pushState,
		refreshPushState,
		enablePush,
		disablePush,
		needsStandaloneForPush,
		type PushError,
	} from '$lib/notifications/push.svelte';
	import {
		NOTIFICATION_PREFERENCE_GROUPS,
		isNotificationCategoryEnabled,
		withNotificationCategory,
	} from '$lib/notifications/preferences';

	let needsStandalone = $state(false);
	let reauthBusy = $state(false);

	// 通知する内容（種別ごとのオン・オフ）。判定は AppView が通知欄・未読数・プッシュの
	// すべてで行うので、ここは読み書きだけ。端末ごとではなくアカウントの設定。
	let notificationPreferences = $state<NotificationPreferences>({});
	let preferencesLoading = $state(true);
	let preferencesLoadFailed = $state(false);
	let preferencesSaving = $state(false);
	let preferencesSaveFailed = $state(false);

	const groupTitle = {
		people: () => m.notifPrefGroupPeople(),
		bot: () => m.notifPrefGroupBot(),
		other: () => m.notifPrefGroupOther(),
	} as const;

	const categoryLabel: Record<NotificationPreferenceCategory, () => string> = {
		reply: () => m.notifPrefReply(),
		mention: () => m.notifPrefMention(),
		reaction: () => m.notifPrefReaction(),
		botInteraction: () => m.notifPrefBotInteraction(),
		diary: () => m.notifPrefDiary(),
		analysis: () => m.notifPrefAnalysis(),
		chronicle: () => m.notifPrefChronicle(),
		mood: () => m.notifPrefMood(),
		gift: () => m.notifPrefGift(),
		emoji: () => m.notifPrefEmoji(),
	};

	onMount(() => {
		needsStandalone = needsStandaloneForPush();
		void loadNotificationPreferences();
	});

	async function loadNotificationPreferences() {
		if (!$session) {
			preferencesLoading = false;
			return;
		}
		preferencesLoading = true;
		preferencesLoadFailed = false;
		try {
			const view = await getPreferences();
			notificationPreferences = view.notificationPreferences ?? {};
		} catch {
			preferencesLoadFailed = true;
		} finally {
			preferencesLoading = false;
		}
	}

	async function toggleCategory(category: NotificationPreferenceCategory, enabled: boolean) {
		if (preferencesSaving) return;
		const previous = notificationPreferences;
		const next = withNotificationCategory(previous, category, enabled);
		// 先に見た目を変え、失敗したら戻す。保存中は他のトグルを止めて送信を直列にする。
		notificationPreferences = next;
		preferencesSaving = true;
		preferencesSaveFailed = false;
		try {
			const view = await putPreferences({
				notificationPreferences: next,
				notificationPreferencesUpdatedAt: new Date().toISOString(),
			});
			notificationPreferences = view.notificationPreferences ?? next;
		} catch {
			notificationPreferences = previous;
			preferencesSaveFailed = true;
		} finally {
			preferencesSaving = false;
		}
	}

	// このページは pushState を表示・操作するだけ。購読状態の同期は +layout.svelte が
	// セッション確立時に済ませている（ページを開かないと直らない状態を作らないため）。
	// ここで表示されるエラーは、その起動時同期の結果であることが多い。

	async function toggle(next: boolean) {
		if (next) await enablePush();
		else await disablePush();
	}

	function errorMessage(error: PushError): string {
		switch (error) {
			case 'auth-required':
				return m.pushAuthRequired();
			case 'push-unavailable':
				return m.pushUnavailable();
			case 'network':
				return m.pushNetworkError();
			case 'unsubscribe-failed':
				return m.pushUnsubscribeFailed();
			case 'permission-denied':
				return m.pushBlocked();
			default:
				return m.pushRegistrationFailed();
		}
	}

	async function reauthorize() {
		if (!$session || reauthBusy) return;
		reauthBusy = true;
		setOAuthReturnTo('/settings/notifications');
		try {
			// 権限の取り直しでオプトイン済みの機能を落とさないよう、現状を含めて要求する。
			await signIn($session.did, { ...(await grantedOptIns()), refreshPermissions: true });
		} finally {
			reauthBusy = false;
		}
	}
</script>

<SettingsPage title={m.settingsNotificationsTitle()}>
	{#if !$session && $oauthReady}
		<SignedOutNotice message={m.pushSignInRequired()} />
	{:else if $session}
		<SettingsSection title={m.pushLegend()} description={m.pushHelp()}>
			{#if needsStandalone}
				<SettingRow description={m.pushIosInstallNote()} />
			{:else if !pushState.supported}
				<SettingRow description={m.pushUnsupported()} />
			{:else if pushState.permission === 'denied'}
				<SettingRow description={m.pushBlocked()} />
			{:else}
				<SettingRow label={m.pushEnableLabel()} description={m.pushDeviceNote()}>
					{#snippet control({ labelId, descriptionId })}
						<ToggleSwitch
							checked={pushState.browserSubscribed}
							labelledby={labelId}
							describedby={descriptionId}
							disabled={pushState.busy || reauthBusy}
							onchange={toggle}
						/>
					{/snippet}
				</SettingRow>
				{#if pushState.error}
					<SettingRow>
						<div class="push-error" role="alert">
							<p>{errorMessage(pushState.error)}</p>
							{#if pushState.error === 'auth-required'}
								<Button
									variant="primary"
									size="sm"
									type="button"
									disabled={reauthBusy}
									onclick={reauthorize}
								>
									{reauthBusy ? m.pushReauthPending() : m.pushRefreshPermissions()}
								</Button>
							{:else if pushState.error !== 'permission-denied'}
								<Button
									variant="secondary"
									size="sm"
									type="button"
									disabled={pushState.busy}
									onclick={() => void refreshPushState({ force: true })}>{m.pushRetry()}</Button
								>
							{/if}
						</div>
					</SettingRow>
				{/if}
			{/if}
		</SettingsSection>

		<!-- 種別の行は群ごとの小分け（level 3）に並べ、この section は見出しと説明だけを持つ。 -->
		<SettingsSection title={m.notifPrefTitle()} description={m.notifPrefHelp()} plain>
			{#if preferencesLoading}
				<Spinner />
			{:else if preferencesLoadFailed}
				<div class="push-error" role="alert">
					<p>{m.notifPrefLoadFailed()}</p>
					<Button
						variant="secondary"
						size="sm"
						type="button"
						onclick={() => void loadNotificationPreferences()}>{m.pushRetry()}</Button
					>
				</div>
			{:else}
				{#each NOTIFICATION_PREFERENCE_GROUPS as group (group.id)}
					<SettingsSection title={groupTitle[group.id]()} level={3}>
						{#each group.categories as category (category)}
							<SettingRow
								label={categoryLabel[category]()}
								description={category === 'botInteraction'
									? m.notifPrefBotInteractionNote()
									: undefined}
							>
								{#snippet control({ labelId, descriptionId })}
									<ToggleSwitch
										checked={isNotificationCategoryEnabled(notificationPreferences, category)}
										labelledby={labelId}
										describedby={descriptionId}
										disabled={preferencesSaving}
										onchange={(enabled) => void toggleCategory(category, enabled)}
									/>
								{/snippet}
							</SettingRow>
						{/each}
					</SettingsSection>
				{/each}
				{#if preferencesSaveFailed}
					<p class="settings-error" role="alert">{m.notifPrefSaveFailed()}</p>
				{/if}
			{/if}
		</SettingsSection>
	{/if}
</SettingsPage>

<style>
	.push-error {
		display: grid;
		justify-items: start;
		gap: 8px;
	}
	.push-error p {
		margin: 0;
		color: var(--danger);
		font-size: 0.875rem;
	}
</style>
