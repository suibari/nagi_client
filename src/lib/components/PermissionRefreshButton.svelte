<script lang="ts">
	import { m } from '$lib/i18n/i18n.svelte';
	import { session, setOAuthReturnTo, signIn } from '$lib/oauth/session.svelte';
	import { grantedOptIns } from '$lib/optin/scope-optin';

	let busy = $state(false);
	let error = $state('');

	async function reauthorize() {
		if (!$session || busy) return;
		busy = true;
		error = '';
		try {
			setOAuthReturnTo(location.pathname + location.search + location.hash);
			await signIn($session.did, { ...(await grantedOptIns()), refreshPermissions: true });
		} catch (cause) {
			error = cause instanceof Error ? cause.message : m.loginStartFailed();
		} finally {
			busy = false;
		}
	}
</script>

{#if $session}
	<button type="button" disabled={busy} onclick={reauthorize}>
		{busy ? m.standardSiteReauthPending() : m.bookmarkRefreshPermissions()}
	</button>
	{#if error}<p class="error" role="alert">{error}</p>{/if}
{/if}
