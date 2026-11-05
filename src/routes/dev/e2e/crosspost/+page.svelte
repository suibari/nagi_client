<script lang="ts">
	import { onMount } from 'svelte';
	import type { PostView } from '$lib/api/types';
	import ChatBubble from '$lib/components/ChatBubble.svelte';
	import { session, type OAuthSession } from '$lib/oauth/session.svelte';

	/**
	 * Bluesky への続き（自分のクロスポストへの返信・引用）の確認用。
	 * 仮のセッションは Bluesky への書き込み権限を持つ。PDS への呼び出しはネットワーク越しなので e2e で差し替える。
	 */
	const did = 'did:plc:crosspost-viewer';
	let ready = $state(false);
	const ref = (rkey: string) => ({
		uri: `at://${did}/app.bsky.feed.post/${rkey}`,
		cid: `cid-${rkey}`,
	});
	const post = (rkey: string, text: string, extra: Partial<PostView> = {}): PostView => ({
		uri: `at://${did}/com.suibari.nagi.post/${rkey}`,
		cid: `bafy-${rkey}`,
		author: { did, handle: 'me.nagi.example', displayName: 'わたし' },
		text,
		createdAt: '2026-11-05T00:00:00.000Z',
		indexedAt: '2026-11-05T00:00:00.000Z',
		reactions: [],
		isBot: false,
		isAffirmation: false,
		...extra,
	});
	const crossposted = post('crossposted', 'Blueskyにも出したポスト', {
		crosspost: { root: ref('root'), tail: ref('tail'), threadRoot: ref('root') },
	});
	const other = post('other', 'ほかの人のクロスポスト', {
		author: { did: 'did:plc:someone-else', handle: 'other.example' },
		crosspost: crossposted.crosspost,
	});
	const local = post('local', 'Nagiだけのポスト');

	onMount(() => {
		session.set({
			did,
			fetchHandler: (url: string | URL, init?: RequestInit) => fetch(url, init),
			getTokenInfo: async () => ({ scope: 'atproto repo:app.bsky.feed.post?action=create' }),
		} as unknown as OAuthSession);
		ready = true;
		return () => session.set(null);
	});
</script>

{#if ready}
	<section data-testid="crossposted"><ChatBubble post={crossposted} /></section>
	<section data-testid="other"><ChatBubble post={other} /></section>
	<section data-testid="local"><ChatBubble post={local} /></section>
{/if}
