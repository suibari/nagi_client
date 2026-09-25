<script lang="ts">
	import { onMount } from 'svelte';
	import { oauthReady, session, type OAuthSession } from '$lib/oauth/session.svelte';

	let ready = $state(false);
	onMount(() =>
		oauthReady.subscribe((restored) => {
			if (!restored || ready) return;
			// Keep the mock session across navigation to the real diary route.
			session.set({
				did: 'did:plc:playwright-diary',
				fetchHandler: (url: string | URL, init?: RequestInit) => fetch(url, init),
				getTokenInfo: async () => ({ scope: '' }),
			} as unknown as OAuthSession);
			ready = true;
		}),
	);
</script>

{#if ready}
	<a href="/diary?date=2020-02-29&tab=chronicle">Open diary deep link</a>
{/if}
