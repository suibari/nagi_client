import { describe, expect, it } from 'vitest';
import type { AppBskyFeedDefs } from '@atproto/api';
import { toFeedItem } from './mapView';
import { bskyConversations } from './conversation';

const uri = (id: string) => `at://did:plc:test/app.bsky.feed.post/${id}`;
function post(
	id: string,
	parent?: string,
): AppBskyFeedDefs.PostView & { $type: 'app.bsky.feed.defs#postView' } {
	return {
		$type: 'app.bsky.feed.defs#postView',
		uri: uri(id),
		cid: id,
		author: { did: 'did:plc:test', handle: 'test.example' },
		record: {
			text: id,
			createdAt: `2026-10-26T00:00:0${id === 'root' ? 0 : id}Z`,
			...(parent ? { reply: { root: { uri: uri('root') }, parent: { uri: uri(parent) } } } : {}),
		},
		indexedAt: '2026-10-26T00:00:00Z',
	};
}
describe('Bluesky conversations', () => {
	it('groups feed replies and their API context into a root and the last three replies', () => {
		const root = post('root');
		const items = ['4', '3', '2', '1'].map((id) =>
			toFeedItem({
				post: post(id, id === '1' ? 'root' : String(Number(id) - 1)),
				reply: { root, parent: post(id === '1' ? 'root' : String(Number(id) - 1)) },
			}),
		);
		const [thread] = bskyConversations(items);
		expect(bskyConversations(items)).toHaveLength(1);
		expect(thread.root.uri).toBe(root.uri);
		expect(thread.replies.map((reply) => reply.post.text)).toEqual(['2', '3', '4']);
		expect(thread.hiddenCount).toBe(1);
	});
	it('preserves repost attribution and separates reposts from the normal conversation', () => {
		const normal = toFeedItem({ post: post('root') });
		const repost = {
			...normal,
			key: `${normal.key}#repost:abc`,
			repostedBy: {
				did: 'did:plc:other',
				handle: 'other.example',
				profileUrl: 'https://bsky.app/profile/other.example',
			},
		};
		const threads = bskyConversations([repost, normal]);
		expect(threads).toHaveLength(2);
		expect(threads[0].item.repostedBy).toBe(repost.repostedBy);
	});
	it('marks missing or blocked context as incomplete without fabricating a hidden reply count', () => {
		const [thread] = bskyConversations([toFeedItem({ post: post('4', '3') })]);
		expect(thread.incomplete).toBe(true);
		expect(thread.hiddenCount).toBe(0);
		expect(thread.root.text).toBe('4');
	});
});
