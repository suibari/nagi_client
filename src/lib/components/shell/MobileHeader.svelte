<script lang="ts">
	import { session, oauthReady } from '$lib/oauth/session.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
</script>

<header class="mobile-top">
	<a class="brand" href="/" aria-label="Nagi home"
		><img class="mark" src="/nagi_icon.png" alt="" /><span>Nagi</span></a
	>
	{#if $session}
		<a class="ghost" href={`/profile/${$session.did}`}>{m.profileLink()}</a>
	{:else if $oauthReady}
		<a class="login" href="/login">{m.login()}</a>
	{/if}
</header>
