<script lang="ts">
	import { putProfile } from '$lib/atproto/records';
	import { getProfile } from '$lib/api/appview';
	import { session, oauthReady } from '$lib/oauth/session.svelte';
	let name = $state('');
	let description = $state('');
	let status = $state('');
	let error = $state('');
	let busy = $state(false);
	let loaded = $state(false);
	// prefill with current values so saving doesn't wipe the existing profile
	$effect(() => {
		const did = $session?.did;
		if (!did || loaded) return;
		getProfile(did, { limit: 1 })
			.then((r) => {
				if (loaded) return;
				name = r.profile.displayName ?? '';
				description = r.profile.description ?? '';
				loaded = true;
			})
			.catch(() => (loaded = true));
	});
	async function save() {
		if (!$session) {
			location.href = '/login';
			return;
		}
		busy = true;
		status = '';
		error = '';
		try {
			await putProfile(name, description);
			status = '保存しました';
		} catch (e) {
			error = e instanceof Error ? e.message : '保存できませんでした';
		} finally {
			busy = false;
		}
	}
</script>

<section class="auth-card">
	<h1>プロフィール設定</h1>
	{#if !$session && $oauthReady}
		<p>設定を変更するにはログインしてください。</p>
		<a class="login" href="/login">ログイン</a>
	{:else}
		<label>表示名<input bind:value={name} maxlength="640" /></label>
		<label>自己紹介<textarea bind:value={description} maxlength="2560" rows="4"></textarea></label>
		<button disabled={busy} onclick={save}>{busy ? '保存中…' : '保存'}</button>
		{#if status}<p>{status}</p>{/if}
		{#if error}<p class="error">{error}</p>{/if}
	{/if}
	<div class="legal-links">
		<a href="/terms">利用規約</a><a href="/privacy">プライバシーポリシー</a>
	</div>
</section>
