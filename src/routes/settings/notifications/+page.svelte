<script lang="ts">
	import { onMount } from 'svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import ToggleSwitch from '$lib/components/ToggleSwitch.svelte';
	import {
		pushState,
		refreshPushState,
		enablePush,
		disablePush,
		needsStandaloneForPush
	} from '$lib/notifications/push.svelte';

	let needsStandalone = $state(false);

	onMount(async () => {
		needsStandalone = needsStandaloneForPush();
		await refreshPushState();
	});

	async function toggle(next: boolean) {
		if (next) await enablePush();
		else await disablePush();
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
				disabled={pushState.busy}
				onchange={toggle}
			/>
			<p class="push-device-note">{m.pushDeviceNote()}</p>
		{/if}
	</fieldset>
</section>

<style>
	.push-device-note {
		font-size: 0.85em;
		opacity: 0.75;
	}
</style>
