<script lang="ts">
	import { session, oauthReady, signOut } from '$lib/oauth/session.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import Avatar from '../Avatar.svelte';
	import Icon from './Icon.svelte';
	import { myProfile } from '$lib/profile/me.svelte';
	let me = $derived(myProfile.current);
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
		<button
			class="ghost signout"
			type="button"
			aria-label={m.signOut()}
			title={m.signOut()}
			onclick={() => void signOut()}><Icon name="logout" size={19} /></button
		>
	</div>
{:else if $oauthReady}
	<div class="account-login">
		<a class="login" href="/login">{m.login()}</a><span>{m.loginHint()}</span>
	</div>
{/if}
