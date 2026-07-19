<script lang="ts">
	import { signIn, oauthError } from '$lib/oauth/session.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	let handle = $state('');
	let busy = $state(false);
	async function submit() {
		busy = true;
		try {
			await signIn(handle);
		} finally {
			busy = false;
		}
	}
</script>

<section class="auth-card">
	<div class="mark large">{m.brandMark()}</div>
	<h1>{m.loginTitle()}</h1>
	<p>
		{m.loginBody()}
	</p>
	<label
		>{m.loginHandleLabel()}<input bind:value={handle} placeholder="yourname.bsky.social" /></label
	><button disabled={busy || !handle.trim()} onclick={submit}
		>{busy ? m.loginRedirecting() : m.loginSubmit()}</button
	>{#if $oauthError}<p class="error">{$oauthError}</p>{/if}<a href="/">{m.loginBrowse()}</a>
</section>
