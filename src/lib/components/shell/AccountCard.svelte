<script lang="ts">
	import { session, oauthReady, signOut } from '$lib/oauth/session.svelte';
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
			.then((r) => (me = r.profile))
			.catch(() => (me = undefined));
	});
</script>

{#if $session}
	<div class="account-card">
		<a href={`/profile/${$session.did}`} aria-label="自分のプロフィール"
			><Avatar actor={me} size="small" /></a
		>
		<a class="who" href={`/profile/${$session.did}`}>
			<strong>{me?.displayName ?? me?.handle ?? 'わたし'}</strong>
			<span>@{me?.handle ?? $session.did}</span>
		</a>
		<button class="ghost signout" onclick={() => void signOut()}>ログアウト</button>
	</div>
{:else if $oauthReady}
	<div class="account-login">
		<a class="login" href="/login">ログイン</a><span>Blueskyアカウントで参加できます</span>
	</div>
{/if}
