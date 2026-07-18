<script lang="ts">
	import { session, oauthReady, signOut } from '$lib/oauth/session.svelte';
</script>

<header>
	<a class="brand" href="/" aria-label="Nagi home"><span class="mark">凪</span><span>Nagi</span></a>
	<nav>
		<a href="/">タイムライン</a><a href="/trend">トレンド</a>{#if $session}<a href="/notifications"
				>通知</a
			><button class="ghost" onclick={() => void signOut()}>ログアウト</button
			>{:else if $oauthReady}<a class="login" href="/login">ログイン</a>{/if}
	</nav>
</header>
