<script lang="ts">
	import { onMount } from 'svelte';
	import { DEFAULT_LABEL_SETTINGS, type AppBskyFeedDefs, type ModerationOpts } from '@atproto/api';
	import type { PostView } from '$lib/api/types';
	import { feedTabs } from '$lib/feed-tabs/feed-tabs.svelte';
	import FeedSurface from '$lib/components/FeedSurface.svelte';
	import ChatBubble from '$lib/components/ChatBubble.svelte';
	import BskyThreadUnit from '$lib/components/bsky/BskyThreadUnit.svelte';
	import { toFeedItem } from '$lib/bsky/mapView';
	import { bskyConversations } from '$lib/bsky/conversation';
	import { EntryMotion } from '$lib/feed/entry-motion.svelte';

	let source = $state('nagi');
	let refreshes = $state(0);
	const entry = new EntryMotion();
	const post: PostView = {
		uri: 'at://did:plc:other/com.suibari.nagi.post/one',
		cid: 'one',
		author: { did: 'did:plc:other', handle: 'other.example', displayName: 'ほかの人' },
		text: 'アバターから吹き出しが出ます。左右にスワイプできます。',
		createdAt: '2026-10-26T00:00:00Z',
		indexedAt: '2026-10-26T00:00:00Z',
		reactions: [],
		isBot: false,
		isAffirmation: false,
	};
	const uri = (key: string) => `at://did:plc:other/app.bsky.feed.post/${key}`;
	function bskyPost(
		key: string,
		parent?: string,
	): AppBskyFeedDefs.PostView & { $type: 'app.bsky.feed.defs#postView' } {
		return {
			$type: 'app.bsky.feed.defs#postView',
			uri: uri(key),
			cid: key,
			author: { did: 'did:plc:other', handle: 'other.example', displayName: 'Blueskyの人' },
			record: {
				text: `Bluesky ${key}`,
				createdAt: `2026-10-26T00:00:0${key === 'root' ? 0 : key}Z`,
				...(parent ? { reply: { root: { uri: uri('root') }, parent: { uri: uri(parent) } } } : {}),
			},
			indexedAt: '2026-10-26T00:00:00Z',
		};
	}
	const root = bskyPost('root');
	const [thread] = bskyConversations(
		['1', '2', '3', '4', '5'].map((key) =>
			toFeedItem({
				post: bskyPost(key, key === '1' ? 'root' : String(Number(key) - 1)),
				reply: { root, parent: bskyPost(key === '1' ? 'root' : String(Number(key) - 1)) },
			}),
		),
	);
	const moderation: ModerationOpts = {
		userDid: undefined,
		prefs: {
			adultContentEnabled: false,
			labels: DEFAULT_LABEL_SETTINGS,
			labelers: [],
			mutedWords: [],
			hiddenPosts: [],
		},
		labelDefs: {},
	};
	onMount(() => {
		feedTabs.tabs = [
			{ id: 'global', kind: 'global' },
			{ id: 'affirmation', kind: 'custom', source: 'affirmation' },
		];
	});
	async function refresh() {
		refreshes++;
		await new Promise((resolve) => setTimeout(resolve, 100));
		if (refreshes > 1) entry.mark(['thread'], [post.uri]);
	}
</script>

<p>開発用：APIへ送信しません</p>
<button onclick={() => (source = source === 'nagi' ? 'bsky' : 'nagi')}>表示切替</button>
<button onclick={() => void refresh()}>新着を再現</button>
<output data-testid="refresh-count">{refreshes}</output>
<FeedSurface activeKey={source} version={entry.version} onrefresh={refresh}>
	<div data-testid="gesture-area" class="gesture-area">
		<p>フィード操作のテスト領域</p>
	</div>
	<div class="timeline" data-testid="feed-content">
		{#if source === 'nagi'}
			<article class="thread-unit" class:feed-entering={entry.keys.has('thread')}>
				<ChatBubble {post} displayOnly />
			</article>
		{:else}
			<BskyThreadUnit {thread} {moderation} entering={entry.keys.has('thread')} />
		{/if}
		<div class="nested" data-feed-gesture-ignore><p>画像ギャラリー相当の操作領域</p></div>
	</div>
</FeedSurface>

<style>
	.gesture-area {
		min-height: 100px;
		padding: 20px;
		background: var(--surface-2);
	}
	.nested {
		height: 100px;
	}
</style>
