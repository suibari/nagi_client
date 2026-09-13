<script lang="ts">
	import { onMount } from 'svelte';
	import type { FeedItem } from '$lib/api/types';
	import ChatBubble from '$lib/components/ChatBubble.svelte';
	import { parsePostText } from '$lib/atproto/facets';
	import { session, type OAuthSession } from '$lib/oauth/session.svelte';

	const did = 'did:plc:playwright-post-editor';
	const originalUrl = 'https://old.example/article';
	const parsed = parsePostText(`変更前 ${originalUrl}`);
	let ready = $state(false);
	let editablePost = $state<FeedItem>({
		uri: `at://${did}/com.suibari.nagi.post/playwright`,
		cid: 'bafy-original',
		author: {
			did,
			handle: 'playwright.nagi.example',
			displayName: 'Playwright確認用',
		},
		text: parsed.text,
		facets: parsed.facets,
		createdAt: '2026-09-13T00:00:00.000Z',
		indexedAt: '2026-09-13T00:00:00.000Z',
		linkCards: [{ uri: originalUrl, title: '変更前のリンクカード' }],
		reactions: [],
		isBot: false,
		isAffirmation: false,
	});

	onMount(() => {
		const mockSession = {
			did,
			fetchHandler: (url: string | URL, init?: RequestInit) => fetch(url, init),
			getTokenInfo: async () => ({ scope: '' }),
		} as unknown as OAuthSession;
		session.set(mockSession);
		ready = true;
		return () => session.set(null);
	});
</script>

<svelte:head><title>投稿編集 E2E</title></svelte:head>

<section class="e2e-fixture" data-testid="post-edit-fixture">
	<h1>投稿編集 E2E</h1>
	{#if ready}<ChatBubble bind:post={editablePost} />{/if}
</section>

<style>
	.e2e-fixture {
		padding-block: 24px;
	}
</style>
