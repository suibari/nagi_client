<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import { session, oauthReady } from '$lib/oauth/session.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import Avatar from '../Avatar.svelte';
	import { myProfile } from '$lib/profile/me.svelte';
	let me = $derived(myProfile.current);
</script>

<header class="mobile-top">
	<a class="brand" href="/" aria-label="Nagi home"
		><img class="mark" src="/nagi_icon.png" alt="" /><span>Nagi</span></a
	>
	{#if $session}
		<a class="mobile-profile" href={`/profile/${$session.did}`} aria-label={m.myProfileAria()}
			><Avatar actor={me} size="small" /></a
		>
	{:else if $oauthReady}
		<Button variant="primary" size="sm" href="/login">{m.login()}</Button>
	{/if}
</header>
