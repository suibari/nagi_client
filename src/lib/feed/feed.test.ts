import { afterEach, describe, expect, it, vi } from 'vitest';
import type { FeedItem } from '$lib/api/types';
import { Feed } from './feed.svelte';

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
