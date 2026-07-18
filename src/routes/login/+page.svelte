<script lang="ts">
	import { signIn, oauthError } from '$lib/oauth/session.svelte';
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
	<div class="mark large">凪</div>
	<h1>Nagiに参加する</h1>
	<p>
		BlueskyまたはAT Protocolのハンドルでログインします。パスワードをNagiが受け取ることはありません。
	</p>
	<label>ハンドル<input bind:value={handle} placeholder="yourname.bsky.social" /></label><button
		disabled={busy || !handle.trim()}
		onclick={submit}>{busy ? '移動しています…' : 'OAuthでログイン'}</button
	>{#if $oauthError}<p class="error">{$oauthError}</p>{/if}<a href="/">ログインせずに見る</a>
</section>
