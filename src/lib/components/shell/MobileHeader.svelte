<script lang="ts">
	import { session, oauthReady } from '$lib/oauth/session.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import { getProfile } from '$lib/api/appview';
	import type { ProfileDetail } from '$lib/api/types';
	import Avatar from '../Avatar.svelte';
	let me = $state<ProfileDetail>();
	$effect(() => {
		const did = $session?.did;
		if (!did) {
			me = undefined;
			return;
		}
		getProfile(did, { limit: 1 })
			.then((result) => (me = result.profile))
			.catch(() => (me = undefined));
	});
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
		<a class="login" href="/login">{m.login()}</a>
	{/if}
</header>
