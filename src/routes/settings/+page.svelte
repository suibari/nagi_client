<script lang="ts">
	import { putProfile } from '$lib/atproto/records';
	import { session } from '$lib/oauth/session.svelte';
	let name = $state('');
	let description = $state('');
	let status = $state('');
	async function save() {
		if (!$session) {
			location.href = '/login';
			return;
		}
		await putProfile(name, description);
		status = '保存しました';
	}
</script>

<section class="auth-card">
	<h1>プロフィール設定</h1>
	<label>表示名<input bind:value={name} maxlength="640" /></label><label
		>自己紹介<input bind:value={description} maxlength="2560" /></label
	><button onclick={save}>保存</button>{#if status}<p>{status}</p>{/if}
</section>
