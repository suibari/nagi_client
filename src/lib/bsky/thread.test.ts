import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AppBskyFeedDefs } from '@atproto/api';
import { BskyThreadLoader, toThreadSnapshot, type BskyThreadSnapshot } from './thread';
import { bskyConversations, expandBskyConversation } from './conversation';
import { toFeedItem } from './mapView';

const uri = (id: string) => `at://did:plc:thread/app.bsky.feed.post/${id}`;
function node(
	id: string,
	replies: AppBskyFeedDefs.ThreadViewPost[] = [],
	parent?: string,
): AppBskyFeedDefs.ThreadViewPost & { $type: 'app.bsky.feed.defs#threadViewPost' } {
	return {
		$type: 'app.bsky.feed.defs#threadViewPost',
		post: {
			uri: uri(id),
			cid: id,
			author: { did: 'did:plc:thread', handle: 'thread.test' },
			record: {
				text: id,
				createdAt: `2026-10-26T00:00:0${id === 'root' ? 0 : id}Z`,
				...(parent ? { reply: { root: { uri: uri('root') }, parent: { uri: uri(parent) } } } : {}),
			},
			indexedAt: '2026-10-26T00:00:00Z',
			replyCount: replies.length,
		},
		replies: replies.map((reply) => ({ ...reply, $type: 'app.bsky.feed.defs#threadViewPost' })),
	};
}
const snapshot: BskyThreadSnapshot = { posts: [], unavailableUris: [], incomplete: false };
afterEach(() => vi.useRealTimers());

describe('thread enrichment', () => {
	it('shows root plus the latest three replies even if the feed contains only the root', () => {
		const tree = node('root', [
			node('1', [node('2', [node('3', [node('4', [], '3')], '2')], '1')], 'root'),
		]);
		const [feedThread] = bskyConversations([toFeedItem({ post: tree.post })]);
		expect(feedThread.replies).toEqual([]);
		const expanded = expandBskyConversation(feedThread, toThreadSnapshot(tree));
		expect(expanded.root.uri).toBe(uri('root'));
		expect(expanded.replies.map((reply) => [reply.post.text, reply.depth])).toEqual([
			['2', 2],
			['3', 3],
			['4', 4],
		]);
		expect(expanded.hiddenCount).toBe(1);
		expect(expanded.incomplete).toBe(false);
	});
	it('includes branches and removes blocked replies supplied by old feed context', () => {
		const blocked = node('1', [], 'root');
		const root = node('root', [blocked, node('2', [], 'root')]);
		const [feedThread] = bskyConversations([
			toFeedItem({
				post: blocked.post,
				reply: {
					root: { ...root.post, $type: 'app.bsky.feed.defs#postView' },
					parent: { ...root.post, $type: 'app.bsky.feed.defs#postView' },
				},
			}),
		]);
		const data = toThreadSnapshot({
			...root,
			replies: [
				{ $type: 'app.bsky.feed.defs#blockedPost', uri: blocked.post.uri, blocked: true },
				node('2', [], 'root'),
			],
		});
		const expanded = expandBskyConversation(feedThread, data);
		expect(expanded.replies.map((reply) => reply.post.text)).toEqual(['2']);
		expect(expanded.incomplete).toBe(true);
	});
	it('marks truncated response branches without inventing a missing count', () => {
		const root = node('root');
		root.post.replyCount = 10;
		const data = toThreadSnapshot(root);
		expect(data.incomplete).toBe(true);
		expect(data.posts).toHaveLength(1);
	});
	it('rejects an inaccessible root', () => {
		expect(() =>
			toThreadSnapshot({
				$type: 'app.bsky.feed.defs#notFoundPost',
				uri: uri('root'),
				notFound: true,
			}),
		).toThrow('Thread unavailable');
	});
});

describe('thread request lifecycle', () => {
	it('shares in-flight requests and refreshes cached replies after the next polling interval', async () => {
		vi.useFakeTimers();
		const fetcher = vi.fn(async () => snapshot);
		const loader = new BskyThreadLoader(fetcher);
		const pending = loader.get('root');
		expect(loader.get('root')).toBe(pending);
		await pending;
		await loader.get('root');
		expect(fetcher).toHaveBeenCalledTimes(1);
		vi.advanceTimersByTime(30_000);
		await loader.get('root');
		expect(fetcher).toHaveBeenCalledTimes(2);
	});
	it('retries failures instead of caching the rejected request', async () => {
		const fetcher = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(snapshot);
		const loader = new BskyThreadLoader(fetcher);
		await expect(loader.get('root')).rejects.toThrow('offline');
		await expect(loader.get('root')).resolves.toEqual(snapshot);
		expect(fetcher).toHaveBeenCalledTimes(2);
	});
	it('allows at most three simultaneous thread requests', async () => {
		const resolvers: ((value: BskyThreadSnapshot) => void)[] = [];
		const fetcher = vi.fn(
			() => new Promise<BskyThreadSnapshot>((resolve) => resolvers.push(resolve)),
		);
		const loader = new BskyThreadLoader(fetcher);
		const pending = ['a', 'b', 'c', 'd'].map((uri) => loader.get(uri));
		expect(fetcher).toHaveBeenCalledTimes(3);
		resolvers[0](snapshot);
		await pending[0];
		await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(4));
		for (const resolve of resolvers) resolve(snapshot);
		await Promise.all(pending);
	});
});
