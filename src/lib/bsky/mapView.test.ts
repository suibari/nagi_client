import { describe, expect, it } from 'vitest';
import type { AppBskyFeedDefs } from '@atproto/api';
import { toFeedItem } from './mapView';

const author = { did: 'did:plc:alice', handle: 'alice.test', displayName: 'Alice' };

function post(extra: Partial<AppBskyFeedDefs.PostView> = {}): AppBskyFeedDefs.PostView {
	return {
		uri: 'at://did:plc:alice/app.bsky.feed.post/1',
		cid: 'cid',
		author,
		record: { $type: 'app.bsky.feed.post', text: 'hello', createdAt: '2026-10-26T00:00:00.000Z' },
		indexedAt: '2026-10-26T00:00:01.000Z',
		likeCount: 42,
		viewer: { like: 'at://did:plc:me/app.bsky.feed.like/1' },
		...extra,
	};
}

describe('toFeedItem', () => {
	it('keeps the text and links to bsky.app, and drops the counts', () => {
		const item = toFeedItem({ post: post() });
		expect(item.key).toBe('at://did:plc:alice/app.bsky.feed.post/1');
		expect(item.post.text).toBe('hello');
		expect(item.post.url).toBe('https://bsky.app/profile/did:plc:alice/post/1');
		expect(item.post.author.profileUrl).toBe('https://bsky.app/profile/did:plc:alice');
		expect(item.post.likedByMe).toBe(true);
		expect(item.post).not.toHaveProperty('likeCount');
	});

	it('records who a reply is addressed to and whether I follow them', () => {
		const reply = toFeedItem({
			post: post({
				record: {
					$type: 'app.bsky.feed.post',
					text: 're',
					createdAt: '2026-10-26T00:00:00.000Z',
					reply: { root: { uri: 'r', cid: 'c' }, parent: { uri: 'p', cid: 'c' } },
				},
			}),
			reply: {
				root: { $type: 'app.bsky.feed.defs#notFoundPost', uri: 'r', notFound: true },
				parent: {
					...post(),
					$type: 'app.bsky.feed.defs#postView',
					author: { did: 'did:plc:carol', handle: 'carol.test', viewer: { following: 'f' } },
				},
			},
		});
		expect(reply.reply).toEqual({ parentDid: 'did:plc:carol', parentFollowed: true });
		expect(toFeedItem({ post: post() }).reply).toBeUndefined();
	});

	it('gives reposts their own key so the same post can appear twice', () => {
		const item = toFeedItem({
			post: post(),
			reason: {
				$type: 'app.bsky.feed.defs#reasonRepost',
				by: { did: 'did:plc:bob', handle: 'bob.test' },
				uri: 'at://did:plc:bob/app.bsky.feed.repost/9',
				indexedAt: '2026-10-26T00:00:02.000Z',
			},
		});
		expect(item.key).toBe(
			'at://did:plc:alice/app.bsky.feed.post/1#repost:at://did:plc:bob/app.bsky.feed.repost/9',
		);
		expect(item.repostedBy?.handle).toBe('bob.test');
	});

	it('maps images, quotes with media, and unavailable quotes', () => {
		const withMedia = toFeedItem({
			post: post({
				embed: {
					$type: 'app.bsky.embed.recordWithMedia#view',
					media: {
						$type: 'app.bsky.embed.images#view',
						images: [{ thumb: 't', fullsize: 'https://cdn.example/f.jpg', alt: 'cat' }],
					},
					record: {
						$type: 'app.bsky.embed.record#view',
						record: {
							$type: 'app.bsky.embed.record#viewRecord',
							uri: 'at://did:plc:carol/app.bsky.feed.post/2',
							cid: 'cid2',
							author: { did: 'did:plc:carol', handle: 'carol.test' },
							value: { text: 'quoted', createdAt: '2026-10-25T00:00:00.000Z' },
							indexedAt: '2026-10-25T00:00:00.000Z',
						},
					},
				},
			}),
		});
		expect(withMedia.post.images).toEqual([
			{ url: 'https://cdn.example/f.jpg', alt: 'cat', aspectRatio: undefined },
		]);
		expect(withMedia.post.quote).toMatchObject({ kind: 'post', text: 'quoted' });

		const missing = toFeedItem({
			post: post({
				embed: {
					$type: 'app.bsky.embed.record#view',
					record: {
						$type: 'app.bsky.embed.record#viewNotFound',
						uri: 'at://did:plc:carol/app.bsky.feed.post/3',
						notFound: true,
					},
				},
			}),
		});
		expect(missing.post.quote).toEqual({ kind: 'unavailable' });
	});
});
