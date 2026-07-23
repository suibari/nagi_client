<script lang="ts">
	import { onMount } from 'svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import { oauthReady, session, setOAuthReturnTo, signIn } from '$lib/oauth/session.svelte';
	import ToggleSwitch from '$lib/components/ToggleSwitch.svelte';
	import {
		pushState,
		refreshPushState,
		enablePush,
		disablePush,
		needsStandaloneForPush,
		type PushError,
	} from '$lib/notifications/push.svelte';

	let needsStandalone = $state(false);
	let refreshedDid = $state<string | null>(null);
	let reauthBusy = $state(false);

	onMount(() => {
		needsStandalone = needsStandaloneForPush();
	});

	// OAuth復元後に一度だけ確認する。端末内購読が残っていればAppViewへ再登録して修復する。
	$effect(() => {
		const did = $oauthReady ? $session?.did : undefined;
		if (!did || refreshedDid === did) return;
		refreshedDid = did;
		void refreshPushState();
	});

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
			await signIn($session.did, { refreshPermissions: true });
		} finally {
			reauthBusy = false;
		}
	}
</script>

<section class="auth-card settings-detail">
	<a class="settings-back" href="/settings">← {m.backToSettings()}</a>
	<h1>{m.settingsNotificationsTitle()}</h1>
	<fieldset class="theme-settings">
		<legend>{m.pushLegend()}</legend>
		<p>{m.pushHelp()}</p>
		{#if !$session}
			<p>{m.pushSignInRequired()}</p>
		{:else if needsStandalone}
			<p>{m.pushIosInstallNote()}</p>
		{:else if !pushState.supported}
			<p>{m.pushUnsupported()}</p>
		{:else if pushState.permission === 'denied'}
			<p>{m.pushBlocked()}</p>
		{:else}
			<ToggleSwitch
				checked={pushState.subscribed}
				label={m.pushEnableLabel()}
				disabled={pushState.busy || reauthBusy}
				onchange={toggle}
			/>
			{#if pushState.error}
				<div class="push-error" role="alert">
					<p>{errorMessage(pushState.error)}</p>
					{#if pushState.error === 'auth-required'}
						<button type="button" disabled={reauthBusy} onclick={reauthorize}>
							{reauthBusy ? m.pushReauthPending() : m.pushRefreshPermissions()}
						</button>
					{:else if pushState.error !== 'permission-denied'}
						<button type="button" disabled={pushState.busy} onclick={() => void refreshPushState()}
							>{m.pushRetry()}</button
						>
					{/if}
				</div>
			{/if}
			<p class="push-device-note">{m.pushDeviceNote()}</p>
		{/if}
	</fieldset>
</section>

<style>
	.push-device-note {
		font-size: 0.85em;
		opacity: 0.75;
	}

	.push-error {
		margin-top: 0.75rem;
		padding: 0.75rem;
		border: 1px solid var(--danger);
		border-radius: var(--radius-s);
	}

	.push-error p {
		margin-top: 0;
	}
</style>
