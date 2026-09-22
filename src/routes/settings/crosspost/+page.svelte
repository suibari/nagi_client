<script lang="ts">
	import { m } from '$lib/i18n/i18n.svelte';
	import { oauthReady, session, signIn } from '$lib/oauth/session.svelte';
	import SignedOutNotice from '$lib/components/SignedOutNotice.svelte';
	import {
		getCrosspostEnabled,
		hasCrosspostScope,
		markCrosspostPending,
		setCrosspostEnabled,
	} from '$lib/crosspost/preferences';
	import { grantedOptIns } from '$lib/optin/scope-optin';
	import { hasStandardSiteScope } from '$lib/standardsite/preferences';
	import ToggleSwitch from '$lib/components/ToggleSwitch.svelte';
	import { onMount } from 'svelte';

	let blueskyEnabled = $state(false);
	let blueskyGranted = $state(false);
	let blogGranted = $state(false);
	let blueskyBusy = $state(false);
	let blogBusy = $state(false);

	onMount(async () => {
		blueskyEnabled = getCrosspostEnabled();
		[blueskyGranted, blogGranted] = await Promise.all([
			hasCrosspostScope(),
			hasStandardSiteScope(),
		]);
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

	async function reauthorizeBlog() {
		if (!$session || blogBusy) return;
		blogBusy = true;
		try {
			await signIn($session.did, { ...(await grantedOptIns()), refreshPermissions: true });
		} finally {
			blogBusy = false;
		}
	}
</script>

<section class="auth-card settings-detail external-publishing-settings">
	<a class="settings-back" href="/settings">← {m.backToSettings()}</a>
	<h1>{m.settingsExternalPublishingTitle()}</h1>
	<p class="page-intro">{m.externalPublishingHelp()}</p>

	<!-- Bluesky クロスポストだけが任意。ブログ権限は通常のサインインに含まれる。 -->
	<fieldset class="theme-settings publishing-service">
		<legend>{m.blueskyPublishingTitle()}</legend>
		<p>{m.crosspostHelp()}</p>
		{#if !$session && $oauthReady}
			<SignedOutNotice message={m.crosspostSignInRequired()} />
		{:else if $session && blueskyGranted}
			<ToggleSwitch
				checked={blueskyEnabled}
				label={m.crosspostEnableLabel()}
				onchange={toggleBluesky}
			/>
		{:else if $session}
			<p>{m.crosspostReauthNote()}</p>
			<button type="button" disabled={blueskyBusy} onclick={reauthorizeBluesky}>
				{blueskyBusy ? m.crosspostReauthPending() : m.crosspostReauthSubmit()}
			</button>
		{/if}
		<details>
			<summary>{m.externalPublishingDetails()}</summary>
			<p>{m.crosspostSplitNote()}</p>
			<p>{m.crosspostBotNote()}</p>
			<p>{m.crosspostDeviceNote()}</p>
		</details>
	</fieldset>

	<fieldset class="theme-settings publishing-service">
		<legend>{m.blogPublishingTitle()}</legend>
		<p>{m.blogPublishingHelp()}</p>
		{#if !$session && $oauthReady}
			<SignedOutNotice message={m.standardSiteSignInRequired()} />
		{:else if $session && !blogGranted}
			<p>{m.standardSiteReauthNote()}</p>
			<button type="button" disabled={blogBusy} onclick={reauthorizeBlog}>
				{blogBusy ? m.standardSiteReauthPending() : m.standardSiteReauthSubmit()}
			</button>
		{/if}
		<details>
			<summary>{m.externalPublishingDetails()}</summary>
			<p>{m.standardSiteHelp()}</p>
			<p>{m.standardSiteOptInNote()}</p>
			<p>{m.standardSiteCrosspostNote()}</p>
		</details>
	</fieldset>
</section>

<style>
	.page-intro {
		margin: 0;
		color: var(--text-muted);
	}
	.publishing-service {
		display: grid;
		gap: 0.75rem;
		padding-top: 1rem;
		border-top: 1px solid var(--line);
	}
	.publishing-service > p,
	.publishing-service details p {
		margin: 0;
	}
	details summary {
		width: fit-content;
		cursor: pointer;
		color: var(--text-muted);
		font-size: 0.88rem;
	}
	details[open] summary {
		margin-bottom: 0.6rem;
	}
</style>
