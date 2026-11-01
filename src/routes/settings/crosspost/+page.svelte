<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import { oauthReady, session, signIn } from '$lib/oauth/session.svelte';
	import SignedOutNotice from '$lib/components/SignedOutNotice.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';
	import SettingRow from '$lib/components/SettingRow.svelte';
	import SettingsPage from '$lib/components/SettingsPage.svelte';
	import SettingsSection from '$lib/components/SettingsSection.svelte';
	import {
		getCrosspostEnabled,
		hasCrosspostScope,
		markCrosspostPending,
		setCrosspostEnabled,
	} from '$lib/crosspost/preferences';
	import { grantedOptIns, hasBlueskyViewScope } from '$lib/optin/scope-optin';
	import ToggleSwitch from '$lib/components/ToggleSwitch.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { onMount } from 'svelte';

	/**
	 * Bluesky 連携。クロスポストとフィードの閲覧は同じオプトイン（再認可1回）で権限が付く。
	 * スイッチは「Blueskyにも」ボタンの1つだけで、フィードはタブ設定から足す。
	 * 閲覧の権限は後から足したので、クロスポストだけ許可済みの人には再認可を案内する。
	 */
	let blueskyEnabled = $state(false);
	let blueskyGranted = $state(false);
	let viewGranted = $state(false);
	let checked = $state(false);
	let blueskyBusy = $state(false);

	onMount(async () => {
		blueskyEnabled = getCrosspostEnabled();
		[blueskyGranted, viewGranted] = await Promise.all([hasCrosspostScope(), hasBlueskyViewScope()]);
		checked = true;
	});

	function toggleBluesky(next: boolean) {
		blueskyEnabled = next;
		setCrosspostEnabled(next);
	}

	async function reauthorizeBluesky() {
		if (!$session || blueskyBusy) return;
		blueskyBusy = true;
		markCrosspostPending();
		try {
			await signIn($session.did, { ...(await grantedOptIns()), crosspost: true });
		} finally {
			blueskyBusy = false;
		}
	}
</script>

<SettingsPage title={m.settingsExternalPublishingTitle()} description={m.externalPublishingHelp()}>
	{#if !$session && $oauthReady}
		<SignedOutNotice message={m.crosspostSignInRequired()} />
	{:else if $session && !checked}
		<Spinner size="sm" />
	{:else if $session && !(blueskyGranted && viewGranted)}
		<SettingsSection>
			<SettingRow description={m.crosspostReauthNote()}>
				{#snippet control()}
					<Button
						variant="primary"
						type="button"
						disabled={blueskyBusy}
						onclick={reauthorizeBluesky}
					>
						{#if blueskyBusy}<Spinner inline size="sm" decorative />{/if}
						{blueskyBusy ? m.crosspostReauthPending() : m.crosspostReauthSubmit()}
					</Button>
				{/snippet}
			</SettingRow>
		</SettingsSection>
	{/if}

	<SettingsSection title={m.blueskyPublishingTitle()} description={m.crosspostHelp()}>
		{#if $session && blueskyGranted}
			<SettingRow label={m.crosspostEnableLabel()}>
				{#snippet control({ labelId })}
					<ToggleSwitch checked={blueskyEnabled} labelledby={labelId} onchange={toggleBluesky} />
				{/snippet}
			</SettingRow>
		{/if}
		<SettingRow>
			<details>
				<summary>{m.externalPublishingDetails()}</summary>
				<p>{m.crosspostSplitNote()}</p>
				<p>{m.crosspostBotNote()}</p>
				<p>{m.crosspostDeviceNote()}</p>
			</details>
		</SettingRow>
	</SettingsSection>

	<!-- 使える状態になるまでは説明だけ出し、中身の無い空の面を置かない。 -->
	<SettingsSection
		title={m.blueskyFeedReadingTitle()}
		description={m.blueskyFeedReadingHelp()}
		plain={!($session && viewGranted)}
	>
		{#if $session && viewGranted}
			<a class="settings-category" href="/settings/feed-tabs">
				<span class="settings-category-icon"><Icon name="text" size={20} /></span>
				<span class="settings-category-copy"><strong>{m.blueskyFeedReadingOpenTabs()}</strong></span
				>
				<Icon name="chevron" size={18} />
			</a>
		{/if}
	</SettingsSection>
</SettingsPage>

<style>
	details summary {
		width: fit-content;
		cursor: pointer;
		color: var(--text-muted);
		font-size: 0.85rem;
	}
	details p {
		margin: 8px 0 0;
		color: var(--text-muted);
		font-size: 0.85rem;
		line-height: 1.6;
	}
</style>
