<script lang="ts">
	import BlogWriter from '$lib/components/BlogWriter.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { oauthReady, session } from '$lib/oauth/session.svelte';

	// OAuth の復元は非同期なので、確定してから未サインインをログインへ送る。
	$effect(() => {
		if ($oauthReady && !$session) location.href = '/login';
	});
</script>

{#if $session}<BlogWriter />{:else}<Spinner />{/if}
