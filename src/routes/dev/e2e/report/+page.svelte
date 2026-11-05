<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import type { PostView, ReactionView } from '$lib/api/types';
	import ChatBubble from '$lib/components/ChatBubble.svelte';
	import { oauthReady, session, type OAuthSession } from '$lib/oauth/session.svelte';

	/**
	 * 「運営に伝える」の確認用。他人の投稿・botたんの投稿・リアクションが付いた自分の投稿を並べる。
	 * 送信は com.suibari.nagi.createReport へ飛ぶので、e2e ではそこを差し替える。
	 * サインイン済みなら本物のセッションを使う（OAuth の復元を待ってから描く）。
	 */
	let viewerDid = $state('did:plc:report-viewer');
	let ready = $state(false);
	const reactors = [
		{ did: 'did:plc:report-reactor-a', handle: 'a.nagi.example', displayName: 'あおい' },
		{ did: 'did:plc:report-reactor-b', handle: 'b.nagi.example', displayName: 'みどり' },
	];
	const post = (
		did: string,
		rkey: string,
		text: string,
		extra: Partial<PostView> = {},
	): PostView => ({
		uri: `at://${did}/com.suibari.nagi.post/${rkey}`,
		cid: `bafy-${rkey}`,
		author: {
			did,
			handle: `${rkey}.nagi.example`,
			displayName: extra.isBot ? 'botたん' : undefined,
		},
		text,
		createdAt: '2026-11-05T00:00:00.000Z',
		indexedAt: '2026-11-05T00:00:00.000Z',
		reactions: [],
		isBot: false,
		isAffirmation: false,
		...extra,
	});
	const reactions: ReactionView[] = [
		{ emoji: '💢', reactors: [reactors[0]] },
		{ emoji: '👍', reactors: [reactors[0], reactors[1]] },
	];

	onMount(() => {
		let fake = false;
		const unsubscribe = oauthReady.subscribe((isReady) => {
			if (!isReady || ready) return;
			const current = get(session);
			if (current) viewerDid = current.did;
			else {
				fake = true;
				session.set({
					did: viewerDid,
					fetchHandler: (url: string | URL, init?: RequestInit) => fetch(url, init),
					getTokenInfo: async () => ({ scope: '' }),
				} as unknown as OAuthSession);
			}
			ready = true;
		});
		return () => {
			unsubscribe();
			if (fake) session.set(null);
		};
	});
</script>

<svelte:head><title>通報 E2E</title></svelte:head>

{#if ready}
	<section data-testid="other-post">
		<ChatBubble post={post('did:plc:report-other', 'other', 'ちょっと気になる投稿')} />
	</section>
	<section data-testid="bot-post">
		<ChatBubble
			post={post('did:plc:report-bot', 'bot', 'そうなんだね、今日もおつかれさま', { isBot: true })}
		/>
	</section>
	<section data-testid="own-post">
		<ChatBubble post={post(viewerDid, 'own', '自分の投稿', { reactions })} />
	</section>
{/if}
