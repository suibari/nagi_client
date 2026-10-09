<script lang="ts">
	import { onMount } from 'svelte';
	import type { FeedItem } from '$lib/api/types';
	import ChatBubble from '$lib/components/ChatBubble.svelte';
	import { session, type OAuthSession } from '$lib/oauth/session.svelte';
	import { composerHost } from '$lib/post/composer-host.svelte';

	const did = 'did:plc:playwright-video';
	const cid = 'bafkreivideofixture';
	let ready = $state(false);
	let post = $state<FeedItem>({
		uri: `at://${did}/com.suibari.nagi.post/video`,
		cid: 'bafy-video-post',
		author: { did, handle: 'video.nagi.example', displayName: '動画確認用' },
		text: '動画つきの投稿',
		createdAt: '2026-10-09T00:00:00.000Z',
		indexedAt: '2026-10-09T00:00:00.000Z',
		video: {
			playlist: `https://video.bsky.app/watch/${encodeURIComponent(did)}/${cid}/playlist.m3u8`,
			thumbnail: `https://video.bsky.app/watch/${encodeURIComponent(did)}/${cid}/thumbnail.jpg`,
			alt: '走る猫',
			aspectRatio: { width: 16, height: 9 },
		},
		reactions: [],
		isBot: false,
		isAffirmation: false,
	});

	onMount(() => {
		session.set({
			did,
			fetchHandler: (url: string | URL, init?: RequestInit) => fetch(url, init),
			getTokenInfo: async () => ({ scope: '', aud: 'https://pds.example' }),
		} as unknown as OAuthSession);
		ready = true;
		return () => {
			composerHost.hide();
			session.set(null);
		};
	});
</script>

<svelte:head><title>動画 E2E</title></svelte:head>

<section class="e2e-fixture" data-testid="video-fixture">
	{#if ready}
		<button type="button" onclick={() => composerHost.show()}>Open composer</button>
		<ChatBubble {post} />
	{/if}
</section>
