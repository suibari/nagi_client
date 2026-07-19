<script lang="ts">
	import { session, oauthReady } from '$lib/oauth/session.svelte';
</script>

<header class="mobile-top">
	<a class="brand" href="/" aria-label="Nagi home"
		><img class="mark" src="/nagi_icon.png" alt="" /><span>Nagi</span></a
	>
	{#if $session}
		<a class="ghost" href={`/profile/${$session.did}`}>プロフィール</a>
	{:else if $oauthReady}
		<a class="login" href="/login">ログイン</a>
	{/if}
</header>
