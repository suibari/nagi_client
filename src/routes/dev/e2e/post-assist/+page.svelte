<script lang="ts">
	import { onMount } from 'svelte';
	import { session, type OAuthSession } from '$lib/oauth/session.svelte';
	import { composerHost } from '$lib/post/composer-host.svelte';

	const did = 'did:plc:playwright-post-assist';
	let ready = $state(false);

	onMount(() => {
		const mockSession = {
			did,
			fetchHandler: (url: string | URL, init?: RequestInit) => fetch(url, init),
			getTokenInfo: async () => ({ scope: '' }),
		} as unknown as OAuthSession;
		session.set(mockSession);
		ready = true;
		return () => {
			composerHost.hide();
			session.set(null);
		};
	});
</script>

<svelte:head><title>ポストおたすけ E2E</title></svelte:head>

<section class="e2e-fixture" data-testid="post-assist-fixture">
	<h1>ポストおたすけ E2E</h1>
	{#if ready}
		<button type="button" onclick={() => composerHost.show()}>ポストモーダルを開く</button>
	{/if}
</section>

<style>
	.e2e-fixture {
		padding-block: 24px;
	}
</style>
