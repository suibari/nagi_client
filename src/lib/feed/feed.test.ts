import { afterEach, describe, expect, it, vi } from 'vitest';
import type { FeedItem } from '$lib/api/types';
import { Feed, feedKey } from './feed.svelte';
import { optimisticPosts } from './optimistic-posts.svelte';

vi.mock('$lib/i18n/postTranslations.svelte', () => ({
	postTranslations: { prepare: vi.fn() },
}));

const did = 'did:plc:viewer';
function post(uri: string, age = 0): FeedItem {
	return {
		uri,
		cid: 'cid',
		author: { did, handle: 'viewer.test' },
		text: 'hello',
		createdAt: new Date(Date.now() - age).toISOString(),
		indexedAt: new Date().toISOString(),
		reactions: [],
		isBot: false,
		isAffirmation: false,
	};
}

function thread(rootUri: string, replies: FeedItem[] = []): FeedItem {
	const root = post(rootUri);
	const representative = replies.findLast((reply) => !reply.isBot) ?? root;
	return {
		...representative,
		conversation: {
			threadRootUri: rootUri,
			root,
			bubbles: replies.map((post) => ({ post, depth: 1 })),
			totalCount: replies.length + 1,
			hiddenCount: 0,
		},
	};
}

afterEach(() => vi.useRealTimers());

describe('feed reaction polling', () => {
	it('continues fast polling after bot replies and stops after three minutes', () => {
		vi.useFakeTimers();
		const feed = new Feed(async () => ({ items: [], hasMore: false }));
		feed.items = [post('root')];
		expect(feed.hasPendingFor(did)).toBe(false);
		expect(feed.hasRecentPostFor(did)).toBe(true);
		expect(feed.hasRecentPostFor()).toBe(false);
		expect(feed.hasRecentPostFor('did:plc:someone-else')).toBe(false);
		vi.advanceTimersByTime(180_000);
		expect(feed.hasRecentPostFor(did)).toBe(false);
	});

	it('also checks replies inside conversation groups', () => {
		const feed = new Feed(async () => ({ items: [], hasMore: false }));
		const root = post('root', 200_000);
		feed.items = [
			{
				...root,
				conversation: {
					threadRootUri: root.uri,
					root,
					bubbles: [{ post: post('reply'), depth: 1 }],
					totalCount: 2,
					hiddenCount: 0,
				},
			},
		];
		expect(feed.hasRecentPostFor(did)).toBe(true);
	});

	it('refreshes arriving emoji without moving existing posts', async () => {
		const first = post('first');
		const second = post('second');
		const reactions = [{ emoji: '🌸', reactors: [{ did: 'did:plc:bot', handle: 'bot.test' }] }];
		const feed = new Feed(async () => ({
			items: [{ ...second, reactions }, first],
			hasMore: false,
		}));
		feed.items = [first, second];
		await feed.refresh();
		expect(feed.items.map((item) => item.uri)).toEqual(['first', 'second']);
		expect(feed.items[1].reactions).toEqual(reactions);
	});
});

describe('feed thread ordering', () => {
	afterEach(() => {
		for (const entry of optimisticPosts.entries) optimisticPosts.remove(entry.id);
	});

	it('moves a thread with a new reply to the top without duplicating it', async () => {
		const updated = thread('second', [post('reply')]);
		const feed = new Feed(async () => ({ items: [updated, thread('first')], hasMore: false }));
		feed.items = [thread('first'), thread('second')];
		await feed.refresh();
		expect(feed.items.map(feedKey)).toEqual(['second', 'first']);
		expect(feed.items[0].uri).toBe('reply');
		expect(feed.isPostEntering('reply')).toBe(true);
		await feed.refresh();
		expect(feed.items.map(feedKey)).toEqual(['second', 'first']);
	});

	it('uses server order for new threads and multiple updated threads, keeping older pages', async () => {
		const feed = new Feed(async () => ({
			items: [
				thread('third', [post('third-reply')]),
				thread('new'),
				thread('second', [post('second-reply')]),
				thread('first'),
			],
			cursor: 'new-cursor',
			hasMore: true,
		}));
		feed.items = [thread('first'), thread('second'), thread('third'), thread('older-page')];
		feed.cursor = 'existing-cursor';
		await feed.refresh();
		expect(feed.items.map(feedKey)).toEqual(['third', 'new', 'second', 'first', 'older-page']);
		expect(feed.cursor).toBe('existing-cursor');
	});

	it('keeps threads in place when only bot replies arrive', async () => {
		const updated = thread('second', [{ ...post('bot-reply'), isBot: true }]);
		const feed = new Feed(async () => ({ items: [updated, thread('first')], hasMore: false }));
		feed.items = [thread('first'), thread('second')];
		await feed.refresh();
		expect(feed.items.map(feedKey)).toEqual(['first', 'second']);
		expect(feed.items[1].conversation?.bubbles[0].post.uri).toBe('bot-reply');
	});

	it('moves an optimistic reply thread to the top and keeps it there after reconciliation', async () => {
		const root = post('second');
		const reply = {
			root: { uri: root.uri, cid: root.cid },
			parent: { uri: root.uri, cid: root.cid },
		};
		const feed = new Feed(async () => ({
			items: [thread('second', [{ ...post('reply'), reply }]), thread('first')],
			hasMore: false,
		}));
		feed.items = [thread('first'), thread('second')];
		const id = optimisticPosts.add(
			{
				text: '返信',
				facets: [],
				langs: ['ja'],
				createdAt: new Date().toISOString(),
				attachments: [],
				linkCards: [],
				reply,
			},
			did,
			{ replyParent: root },
		);
		expect(feed.visibleItems.map(feedKey)).toEqual(['second', 'first']);
		expect(feed.visibleItems[0].conversation?.bubbles[0].post.optimisticState).toBe('sending');
		optimisticPosts.markCreated(id, { uri: 'reply', cid: 'cid' });
		await feed.refresh();
		expect(optimisticPosts.items).toHaveLength(0);
		expect(feed.visibleItems.map(feedKey)).toEqual(['second', 'first']);
		expect(feed.visibleItems[0].conversation?.bubbles).toHaveLength(1);
		expect(feed.isPostEntering('reply')).toBe(false);
	});
});

describe('profile kossori optimistic display', () => {
	afterEach(() => {
		for (const entry of optimisticPosts.entries) optimisticPosts.remove(entry.id);
	});

	it('shows a new kossori post immediately in the author posts feed', () => {
		const feed = new Feed(
			async () => ({ items: [], hasMore: false }),
			(item) => item.author.did === did && !item.reply,
		);
		optimisticPosts.add(
			{
				text: 'こっそり',
				facets: [],
				langs: ['ja'],
				kossori: true,
				createdAt: new Date().toISOString(),
				attachments: [],
				linkCards: [],
			},
			did,
		);
		expect(feed.visibleItems).toHaveLength(1);
		expect(feed.visibleItems[0]).toMatchObject({ kossori: true, optimisticState: 'sending' });
	});

	it('adds a kossori reply to the visible profile conversation immediately', () => {
		const root = { ...post('root'), kossori: true, threadKossori: true };
		const feed = new Feed(
			async () => ({ items: [], hasMore: false }),
			(item) => item.author.did === did && !item.reply,
		);
		feed.items = [
			{
				...root,
				conversation: {
					threadRootUri: root.uri,
					root,
					bubbles: [],
					totalCount: 1,
					hiddenCount: 0,
				},
			},
		];
		optimisticPosts.add(
			{
				text: '返信',
				facets: [],
				langs: ['ja'],
				kossori: true,
				createdAt: new Date().toISOString(),
				attachments: [],
				linkCards: [],
				reply: { root: { uri: root.uri, cid: root.cid }, parent: { uri: root.uri, cid: root.cid } },
			},
			did,
			{ replyParent: root, threadKossori: true },
		);
		expect(feed.visibleItems).toHaveLength(1);
		expect(feed.visibleItems[0].conversation?.bubbles).toHaveLength(1);
		expect(feed.visibleItems[0].conversation?.bubbles[0].post.optimisticState).toBe('sending');
	});
});
