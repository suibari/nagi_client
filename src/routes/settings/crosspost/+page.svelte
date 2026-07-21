<script lang="ts">
	import { m } from '$lib/i18n/i18n.svelte';
	import { session, signIn } from '$lib/oauth/session.svelte';
	import {
		getCrosspostEnabled,
		hasCrosspostScope,
		markCrosspostPending,
		setCrosspostEnabled,
	} from '$lib/crosspost/preferences';
	import ToggleSwitch from '$lib/components/ToggleSwitch.svelte';
	import { onMount } from 'svelte';

	let enabled = $state(false);
	let granted = $state(false);
	let busy = $state(false);
	onMount(async () => {
		enabled = getCrosspostEnabled();
		granted = await hasCrosspostScope();
	});

	function toggle(next: boolean) {
		enabled = next;
		setCrosspostEnabled(next);
	}

	async function reauthorize() {
		if (!$session) return;
		busy = true;
		// 復帰後に有効化を確定させるため、リダイレクト前に保留フラグを立てる。
		markCrosspostPending();
		try {
			await signIn($session.did, { crosspost: true });
		} finally {
			busy = false;
		}
	}
</script>

<section class="auth-card settings-detail">
	<a class="settings-back" href="/settings">← {m.backToSettings()}</a>
	<h1>{m.settingsCrosspostTitle()}</h1>
	<fieldset class="theme-settings">
		<legend>{m.crosspostLegend()}</legend>
		<p>{m.crosspostHelp()}</p>
		<p>{m.crosspostSplitNote()}</p>
		<p>{m.crosspostBotNote()}</p>
		<p>{m.crosspostDeviceNote()}</p>
		{#if !$session}
			<p>{m.crosspostSignInRequired()}</p>
		{:else if granted}
			<ToggleSwitch checked={enabled} label={m.crosspostEnableLabel()} onchange={toggle} />
		{:else}
			<p>{m.crosspostReauthNote()}</p>
			<button type="button" disabled={busy} onclick={reauthorize}
				>{busy ? m.crosspostReauthPending() : m.crosspostReauthSubmit()}</button
			>
		{/if}
	</fieldset>
</section>
