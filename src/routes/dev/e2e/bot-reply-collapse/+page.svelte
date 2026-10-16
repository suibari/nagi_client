<script lang="ts">
	import { onMount } from 'svelte';
	import type { FeedItem, PostView } from '$lib/api/types';
	import ThreadUnit from '$lib/components/ThreadUnit.svelte';
	import { session, type OAuthSession } from '$lib/oauth/session.svelte';
	const viewer = 'did:plc:collapse-viewer';
	const post = (key: string, isBot = false, parent?: PostView, root = parent): PostView => ({
		uri: `at://did:plc:collapse/com.suibari.nagi.post/${key}`,
		cid: key,
		author: {
			did: isBot ? 'did:plc:collapse-bot' : key === 'own' ? viewer : 'did:plc:collapse-other',
			handle: `${key}.example`,
		},
		text: key,
		createdAt: '2026-10-01T00:00:00Z',
		indexedAt: '2026-10-01T00:00:00Z',
		reactions: [],
		isBot,
		isAffirmation: false,
		...(parent && root
			? {
					reply: {
						root: { uri: root.uri, cid: root.cid },
						parent: { uri: parent.uri, cid: parent.cid },
					},
				}
			: {}),
	});
	const root = post('other-root');
	const bot = post('direct-bot', true, root);
	const human = post('human-reply', false, bot, root);
	const own = post('own');
	const ownBot = post('own-bot', true, own);
	const botRoot = post('bot-root', true);
	const botRootHuman = post('bot-root-human', false, botRoot);
	const grouped = (origin: PostView, replies: PostView[]): FeedItem => ({
		...origin,
		conversation: {
			threadRootUri: origin.uri,
			root: origin,
			bubbles: replies.map((post) => ({
				post,
				depth: post.reply?.parent.uri === origin.uri ? 1 : 2,
			})),
			hiddenCount: 0,
			totalCount: replies.length + 1,
		},
	});
	let item = $state(grouped(root, [bot]));
	let ready = $state(false);
	let refresh = $state(0);
	const legacy = $derived({ ...root, botReply: bot, cid: `${root.cid}-${refresh}` });
	onMount(() => {
		session.set({
			did: viewer,
			fetchHandler: (url: string | URL, init?: RequestInit) => fetch(url, init),
			getTokenInfo: async () => ({ scope: '' }),
		} as unknown as OAuthSession);
		ready = true;
		return () => session.set(null);
	});
</script>

{#if ready}
	<button
		onclick={() => {
			item = grouped(root, [bot, { ...human, optimisticState: 'sending' }]);
		}}>ユーザー返信を追加</button
	>
	<button
		onclick={() => {
			item = grouped(root, [bot]);
			refresh += 1;
		}}>一覧を更新</button
	>
	<button onclick={() => session.set(null)}>テスト用ログアウト</button>
	<section data-testid="group"><ThreadUnit {item} /></section>
	<section data-testid="legacy"><ThreadUnit item={legacy} /></section>
	<section data-testid="legacy-duplicate"><ThreadUnit item={legacy} /></section>
	<section data-testid="own"><ThreadUnit item={grouped(own, [ownBot])} /></section>
	<section data-testid="bot-root"><ThreadUnit item={grouped(botRoot, [botRootHuman])} /></section>
	<section data-testid="human"><ThreadUnit item={{ ...human, replyParent: bot }} /></section>
{/if}
