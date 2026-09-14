<script lang="ts">
	import { onMount } from 'svelte';
	import type { NewsView, PostView, ReactionView } from '$lib/api/types';
	import ChatBubble from '$lib/components/ChatBubble.svelte';
	import NewsCard from '$lib/components/NewsCard.svelte';
	import { session, type OAuthSession } from '$lib/oauth/session.svelte';

	const viewerDid = 'did:plc:playwright-reaction-owner';
	const reactor = {
		did: 'did:plc:playwright-reactor',
		handle: 'reactor.nagi.example',
		displayName: 'リアクションした人',
	};
	const reaction: ReactionView = { emoji: '👍', reactors: [reactor] };
	const post = (did: string, rkey: string, text: string): PostView => ({
		uri: `at://${did}/com.suibari.nagi.post/${rkey}`,
		cid: `bafy-${rkey}`,
		author: { did, handle: `${rkey}.nagi.example` },
		text,
		createdAt: '2026-09-14T00:00:00.000Z',
		indexedAt: '2026-09-14T00:00:00.000Z',
		reactions: [reaction],
		isBot: false,
		isAffirmation: false,
	});
	const ownPost = post(viewerDid, 'own', '自分の投稿');
	const otherPost = post('did:plc:playwright-other', 'other', '他人の投稿');
	const news: NewsView = {
		uri: 'at://did:web:nagi-api.suibari.com/com.suibari.nagi.news/playwright',
		cid: 'bafy-news',
		articleId: 'playwright-news',
		url: 'https://example.com/news',
		title: '検索結果のニュース',
		botComment: 'ニュースへのリアクション',
		lang: 'ja',
		createdAt: '2026-09-14T00:00:00.000Z',
		indexedAt: '2026-09-14T00:00:00.000Z',
		reactions: [reaction],
	};
	let ready = $state(false);

	onMount(() => {
		const mockSession = {
			did: viewerDid,
			fetchHandler: (url: string | URL, init?: RequestInit) => fetch(url, init),
			getTokenInfo: async () => ({ scope: '' }),
		} as unknown as OAuthSession;
		session.set(mockSession);
		ready = true;
		return () => session.set(null);
	});
</script>

<svelte:head><title>リアクション公開範囲 E2E</title></svelte:head>

{#if ready}
	<section data-testid="own-post"><ChatBubble post={ownPost} /></section>
	<section data-testid="other-post"><ChatBubble post={otherPost} /></section>
	<section data-testid="search-news"><NewsCard {news} /></section>
{/if}
