<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import type { FeedItem, PostView } from '$lib/api/types';
	import ThreadUnit from '$lib/components/ThreadUnit.svelte';
	import { oauthReady, session, type OAuthSession } from '$lib/oauth/session.svelte';

	/**
	 * 「あなたへ」の目印の確認用。自分への返信・他の人への返信・自分の自己返信・botたんの返信を
	 * 通常カードと会話カードの両方で並べる。サインイン済みなら本物のセッションの DID を使う。
	 */
	let viewerDid = $state('did:plc:reply-viewer');
	let ready = $state(false);
	const OTHER = 'did:plc:reply-other';
	const THIRD = 'did:plc:reply-third';
	const BOT = 'did:plc:reply-bot';
	const names: Record<string, string> = { [OTHER]: 'あおい', [THIRD]: 'みどり', [BOT]: 'botたん' };

	const post = (did: string, rkey: string, text: string, parent?: PostView): PostView => ({
		uri: `at://${did}/com.suibari.nagi.post/${rkey}`,
		cid: `bafy-${rkey}`,
		author: { did, handle: `${rkey}.nagi.example`, displayName: names[did] },
		text,
		createdAt: '2026-11-07T00:00:00.000Z',
		indexedAt: '2026-11-07T00:00:00.000Z',
		reactions: [],
		isBot: did === BOT,
		isAffirmation: false,
		...(parent
			? {
					reply: {
						parent: { uri: parent.uri, cid: parent.cid },
						root: parent.reply?.root ?? { uri: parent.uri, cid: parent.cid },
					},
				}
			: {}),
	});

	let items = $derived.by(() => {
		const mine = post(viewerDid, 'mine', '今日は散歩してきた。銀杏がきれいだった');
		const toMe = post(OTHER, 'to-me', 'いいな〜、こっちはまだ緑だよ', mine);
		const toOther = post(THIRD, 'to-other', 'うちの近所も黄色くなってきた', toMe);
		const selfReply = post(viewerDid, 'self', '明日も行こうかな', mine);
		const botReply = post(BOT, 'bot', '秋の散歩、気持ちよさそう！', mine);
		const plain: FeedItem = { ...toMe, replyParent: mine };
		const conversation: FeedItem = {
			...toOther,
			conversation: {
				threadRootUri: mine.uri,
				root: mine,
				bubbles: [
					{ post: botReply, depth: 1 },
					{ post: toMe, depth: 1 },
					{ post: toOther, depth: 2 },
					{ post: selfReply, depth: 1 },
				],
				hiddenCount: 0,
				totalCount: 5,
			},
		};
		return { plain, conversation };
	});

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

<svelte:head><title>あなたへの返信 E2E</title></svelte:head>

{#if ready}
	<section class="timeline">
		<section data-testid="plain">
			<ThreadUnit item={items.plain} collapseBotReplies={false} />
		</section>
		<section data-testid="conversation">
			<ThreadUnit item={items.conversation} collapseBotReplies={false} />
		</section>
	</section>
{/if}
