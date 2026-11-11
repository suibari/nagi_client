<script lang="ts">
	import { onMount } from 'svelte';
	import RichText from '$lib/components/RichText.svelte';
	import { parsePostText } from '$lib/atproto/facets';
	import { session, type OAuthSession } from '$lib/oauth/session.svelte';
	import { composerHost } from '$lib/post/composer-host.svelte';

	const did = 'did:plc:playwright-tags';
	const post = parsePostText('今日の #Nagi 日記');
	let ready = $state(false);

	onMount(() => {
		session.set({
			did,
			fetchHandler: (url: string | URL, init?: RequestInit) => fetch(url, init),
			getTokenInfo: async () => ({ scope: '' }),
		} as unknown as OAuthSession);
		ready = true;
		return () => {
			composerHost.hide();
			session.set(null);
		};
	});
</script>

<svelte:head><title>Tags E2E</title></svelte:head>

<section>
	<h1>Tags E2E</h1>
	{#if ready}
		<div class="post-text"><RichText text={post.text} facets={post.facets} /></div>
		<button type="button" onclick={() => composerHost.show()}>Open composer</button>
	{/if}
</section>
