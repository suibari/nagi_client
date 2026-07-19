<script lang="ts">
	import { goto } from '$app/navigation';
	import { m } from '$lib/i18n/i18n.svelte';
	import { oauthError, oauthReady, session } from '$lib/oauth/session.svelte';

	$effect(() => {
		if ($oauthReady && $session) void goto('/');
	});
</script>

<section class="auth-card">
	<img class="mark large" src="/nagi_icon.png" alt="" />
	{#if $oauthReady && !$session}
		<h1>{m.oauthErrorTitle()}</h1>
		{#if $oauthError}<p class="error">{$oauthError}</p>{/if}
	{:else}
		<h1>{m.oauthLoggingIn()}</h1>
		<p>{m.oauthBody()}</p>
	{/if}
	<a href="/">{m.backToTimeline()}</a>
</section>
