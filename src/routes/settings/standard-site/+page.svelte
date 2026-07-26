<script lang="ts">
	import { m } from '$lib/i18n/i18n.svelte';
	import { oauthReady, session, signIn } from '$lib/oauth/session.svelte';
	import { grantedOptIns } from '$lib/optin/scope-optin';
	import {
		getStandardSiteEnabled,
		hasStandardSiteScope,
		markStandardSitePending,
		setStandardSiteEnabled,
	} from '$lib/standardsite/preferences';
	import { findNagiPublication, updatePublication } from '$lib/standardsite/publication';
	import type { StandardSitePublication } from '$lib/standardsite/types';
	import { myProfile } from '$lib/profile/me.svelte';
	import ToggleSwitch from '$lib/components/ToggleSwitch.svelte';
	import { onMount } from 'svelte';

	let enabled = $state(false);
	let granted = $state(false);
	let busy = $state(false);
	let syncing = $state(false);
	let error = $state('');
	let publication = $state<StandardSitePublication | undefined>();

	onMount(async () => {
		enabled = getStandardSiteEnabled();
		granted = await hasStandardSiteScope();
		if (granted) {
			publication = (await findNagiPublication().catch(() => null))?.value;
		}
	});

	function toggle(next: boolean) {
		enabled = next;
		setStandardSiteEnabled(next);
	}

	async function toggleDiscover(next: boolean) {
		if (syncing) return;
		syncing = true;
		error = '';
		// 楽観反映しておき、失敗したら書き戻す。
		const previous = publication?.preferences?.showInDiscover;
		if (publication) {
			publication.preferences = { ...(publication.preferences ?? {}), showInDiscover: next };
		}
		try {
			await updatePublication(
				{ showInDiscover: next },
				{ fallbackName: myProfile.current?.handle },
			);
			publication = (await findNagiPublication())?.value;
		} catch (e) {
			if (publication) {
				publication.preferences = { ...(publication.preferences ?? {}), showInDiscover: previous };
			}
			error = e instanceof Error ? e.message : m.standardSiteFailed();
		} finally {
			syncing = false;
		}
	}

	async function syncProfile() {
		if (syncing) return;
		syncing = true;
		error = '';
		try {
			await updatePublication(undefined, { fallbackName: myProfile.current?.handle });
			publication = (await findNagiPublication())?.value;
		} catch (e) {
			error = e instanceof Error ? e.message : m.standardSiteFailed();
		} finally {
			syncing = false;
		}
	}

	async function reauthorize() {
		if (!$session) return;
		busy = true;
		// 復帰後に有効化を確定させるため、リダイレクト前に保留フラグを立てる。
		markStandardSitePending();
		try {
			// クロスポストなど、すでに付与されている権限を落とさないよう現状を含めて要求する。
			await signIn($session.did, { ...(await grantedOptIns()), standardSite: true });
		} finally {
			busy = false;
		}
	}
</script>

<section class="auth-card settings-detail">
	<a class="settings-back" href="/settings">← {m.backToSettings()}</a>
	<h1>{m.settingsStandardSiteTitle()}</h1>
	<fieldset class="theme-settings">
		<legend>{m.standardSiteLegend()}</legend>
		<p>{m.standardSiteHelp()}</p>
		<p>{m.standardSiteOptInNote()}</p>
		<p>{m.standardSiteCrosspostNote()}</p>
		<p>{m.standardSiteDeviceNote()}</p>
		{#if !$session && $oauthReady}
			<p>{m.standardSiteSignInRequired()}</p>
		{:else if $session && granted}
			<ToggleSwitch checked={enabled} label={m.standardSiteEnableLabel()} onchange={toggle} />
			{#if enabled}
				<ToggleSwitch
					checked={publication?.preferences?.showInDiscover !== false}
					label={m.standardSiteDiscoverLabel()}
					disabled={syncing}
					onchange={toggleDiscover}
				/>
				<p>{m.standardSiteDiscoverNote()}</p>
				{#if publication}
					<p>{m.standardSitePublicationName({ name: publication.name })}</p>
				{/if}
				<div>
					<button type="button" class="ghost" disabled={syncing} onclick={syncProfile}
						>{m.standardSiteSyncProfile()}</button
					>
				</div>
			{/if}
		{:else if $session}
			<p>{m.standardSiteReauthNote()}</p>
			<button type="button" disabled={busy} onclick={reauthorize}
				>{busy ? m.standardSiteReauthPending() : m.standardSiteReauthSubmit()}</button
			>
		{/if}
		{#if error}<p class="error">{error}</p>{/if}
	</fieldset>
</section>
