<script lang="ts">
	import { session, oauthReady, signOut } from '$lib/oauth/session.svelte';
	import { getProfile } from '$lib/api/appview';
	import type { ProfileDetail } from '$lib/api/types';
	import { m } from '$lib/i18n/i18n.svelte';
	import Avatar from '../Avatar.svelte';
	let me = $state<ProfileDetail>();
	$effect(() => {
		const did = $session?.did;
		if (!did) {
			me = undefined;
			return;
		}
		getProfile(did, { limit: 1 })
			.then((r) => (me = r.profile))
			.catch(() => (me = undefined));
	});
</script>

{#if $session}
	<div class="account-card">
		<a href={`/profile/${$session.did}`} aria-label={m.myProfileAria()}
			><Avatar actor={me} size="small" /></a
		>
		<a class="who" href={`/profile/${$session.did}`}>
			<strong>{me?.displayName ?? me?.handle ?? m.meFallback()}</strong>
			<span>@{me?.handle ?? $session.did}</span>
		</a>
		<button class="ghost signout" onclick={() => void signOut()}>{m.signOut()}</button>
	</div>
{:else if $oauthReady}
	<div class="account-login">
		<a class="login" href="/login">{m.login()}</a><span>{m.loginHint()}</span>
	</div>
{/if}
