<script lang="ts">
	import { onMount } from 'svelte';
	import RichText from '$lib/components/RichText.svelte';
	import { parsePostText } from '$lib/atproto/facets';
	import { oauthReady, session, type OAuthSession } from '$lib/oauth/session.svelte';
	import { composerHost } from '$lib/post/composer-host.svelte';
	import { guestComposerHost } from '$lib/guest-posts/composer-host.svelte';

	const did = 'did:plc:playwright-tags';
	const post = parsePostText('今日の #Nagi 日記');
	let ready = $state(false);
	let guest = $state(false);

	onMount(() => {
		guest = new URLSearchParams(location.search).has('guest');
		if (guest) {
			oauthReady.set(true);
			ready = true;
			return () => guestComposerHost.hide();
		}
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
		{#if guest}
			<button type="button" onclick={() => guestComposerHost.show()}>Open guest composer</button>
		{:else}
			<button type="button" onclick={() => composerHost.show()}>Open composer</button>
		{/if}
	{/if}
</section>
