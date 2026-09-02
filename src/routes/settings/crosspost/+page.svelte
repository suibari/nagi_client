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
	import {
		getStandardSiteEnabled,
		hasStandardSiteScope,
		markStandardSitePending,
		setStandardSiteEnabled,
	} from '$lib/standardsite/preferences';
	import { getExternalTarget, setExternalTarget, type ExternalTarget } from '$lib/post/scope';
	import ToggleSwitch from '$lib/components/ToggleSwitch.svelte';
	import { onMount } from 'svelte';

	let blueskyEnabled = $state(false);
	let blueskyGranted = $state(false);
	let blogEnabled = $state(false);
	let blogGranted = $state(false);
	let blueskyBusy = $state(false);
	let blogBusy = $state(false);
	let target = $state<ExternalTarget>('bluesky');

	onMount(async () => {
		blueskyEnabled = getCrosspostEnabled();
		blogEnabled = getStandardSiteEnabled();
		[blueskyGranted, blogGranted] = await Promise.all([
			hasCrosspostScope(),
			hasStandardSiteScope(),
		]);
		target = getExternalTarget();
	});

	function chooseTarget(next: ExternalTarget) {
		target = next;
		setExternalTarget(next);
	}

	function toggleBluesky(next: boolean) {
		blueskyEnabled = next;
		setCrosspostEnabled(next);
	}

	function toggleBlog(next: boolean) {
		blogEnabled = next;
		setStandardSiteEnabled(next);
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
		markStandardSitePending();
		try {
			await signIn($session.did, { ...(await grantedOptIns()), standardSite: true });
		} finally {
			blogBusy = false;
		}
	}
</script>

<section class="auth-card settings-detail external-publishing-settings">
	<a class="settings-back" href="/settings">← {m.backToSettings()}</a>
	<h1>{m.settingsExternalPublishingTitle()}</h1>
	<p class="page-intro">{m.externalPublishingHelp()}</p>

	<fieldset class="theme-settings publishing-service">
		<legend>{m.externalTargetLegend()}</legend>
		<p>{m.externalTargetHelp()}</p>
		<div class="target-choice" role="radiogroup" aria-label={m.externalTargetLegend()}>
			<button
				type="button"
				role="radio"
				aria-checked={target === 'bluesky'}
				class:active={target === 'bluesky'}
				onclick={() => chooseTarget('bluesky')}>{m.externalTargetBluesky()}</button
			>
			<button
				type="button"
				role="radio"
				aria-checked={target === 'standardSite'}
				class:active={target === 'standardSite'}
				onclick={() => chooseTarget('standardSite')}>{m.externalTargetStandardSite()}</button
			>
		</div>
	</fieldset>

	{#if target === 'bluesky'}
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
	{:else}
		<fieldset class="theme-settings publishing-service">
			<legend>{m.blogPublishingTitle()}</legend>
			<p>{m.blogPublishingHelp()}</p>
			{#if !$session && $oauthReady}
				<SignedOutNotice message={m.standardSiteSignInRequired()} />
			{:else if $session && blogGranted}
				<ToggleSwitch
					checked={blogEnabled}
					label={m.standardSiteEnableLabel()}
					onchange={toggleBlog}
				/>
			{:else if $session}
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
				<p>{m.standardSiteDeviceNote()}</p>
			</details>
		</fieldset>
	{/if}
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
	.target-choice {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}
	.target-choice button {
		padding: 8px 16px;
		border: 1px solid var(--line-strong);
		border-radius: var(--r-sm);
		background: var(--surface-1);
		color: var(--text-muted);
		font-size: 0.85rem;
		font-weight: 700;
		cursor: pointer;
	}
	.target-choice button.active {
		border-color: var(--accent);
		background: var(--accent-soft);
		color: var(--accent-strong);
	}
</style>
