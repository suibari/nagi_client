import { beforeEach, expect, it, vi } from 'vitest';
import { getBskyFeed } from './agent';
import { BskyFeed } from './feed.svelte';
import type { BskyFeedItemView } from './mapView';

vi.mock('./agent', () => ({ getBskyFeed: vi.fn() }));
vi.mock('$lib/i18n/i18n.svelte', () => ({ m: { bskyFeedLoadFailed: () => 'failed' } }));
const fetchFeed = vi.mocked(getBskyFeed);
const item = (key: string) => ({ key }) as BskyFeedItemView;
beforeEach(() => vi.resetAllMocks());

it('merges new posts without reordering existing posts or losing pagination', async () => {
	const feed = new BskyFeed({ kind: 'timeline' });
	fetchFeed.mockResolvedValueOnce({ items: [item('a'), item('b')], cursor: 'page2' });
	await feed.load();
	fetchFeed.mockResolvedValueOnce({ items: [item('c')], cursor: 'page3' });
	await feed.loadMore();
	const updated = item('b');
	fetchFeed.mockResolvedValueOnce({
		items: [item('new'), updated, item('a'), item('new')],
		cursor: 'new-page2',
	});
	await feed.refresh();
	expect(feed.items.map((post) => post.key)).toEqual(['new', 'a', 'b', 'c']);
	expect(feed.items[2]).toEqual(updated);
	expect(feed.cursor).toBe('page3');
	expect(feed.hasMore).toBe(true);
});

it('ignores concurrent refreshes and responses superseded by a manual reload', async () => {
	const feed = new BskyFeed({ kind: 'timeline' });
	let resolve!: (page: Awaited<ReturnType<typeof getBskyFeed>>) => void;
	fetchFeed.mockReturnValueOnce(
		new Promise((done) => {
			resolve = done;
		}),
	);
	const pending = feed.refresh();
	await feed.refresh();
	expect(fetchFeed).toHaveBeenCalledTimes(1);
	fetchFeed.mockResolvedValueOnce({ items: [item('reload')], cursor: 'reload-cursor' });
	await feed.load();
	resolve({ items: [item('stale')], cursor: 'stale-cursor' });
	await pending;
	expect(feed.items.map((post) => post.key)).toEqual(['reload']);
	expect(feed.cursor).toBe('reload-cursor');
});

it('preserves posts on a failed refresh and retries successfully', async () => {
	const feed = new BskyFeed({ kind: 'timeline' });
	feed.items = [item('existing')];
	fetchFeed.mockRejectedValueOnce(new Error('offline'));
	await feed.refresh();
	expect(feed.items.map((post) => post.key)).toEqual(['existing']);
	expect(feed.error).toBe('');
	fetchFeed.mockResolvedValueOnce({ items: [item('new')], cursor: 'next' });
	await feed.refresh();
	expect(feed.items.map((post) => post.key)).toEqual(['new', 'existing']);
	expect(feed.cursor).toBe('next');
});

it('replaces generator results in server order and resets pagination with the snapshot', async () => {
	const feed = new BskyFeed({
		kind: 'generator',
		uri: 'at://did:plc:test/app.bsky.feed.generator/test',
	});
	fetchFeed.mockResolvedValueOnce({ items: [item('a'), item('b')], cursor: 'old-page2' });
	await feed.load();
	fetchFeed.mockResolvedValueOnce({ items: [item('c')], cursor: 'old-page3' });
	await feed.loadMore();
	fetchFeed.mockResolvedValueOnce({
		items: [item('b'), item('new'), item('b')],
		cursor: 'new-page2',
	});
	await feed.refresh();
	expect(feed.items.map((post) => post.key)).toEqual(['b', 'new']);
	expect(feed.cursor).toBe('new-page2');
	fetchFeed.mockResolvedValueOnce({ items: [], cursor: undefined });
	await feed.refresh();
	expect(feed.items).toEqual([]);
	expect(feed.hasMore).toBe(false);
	expect(feed.cursor).toBeUndefined();
});
