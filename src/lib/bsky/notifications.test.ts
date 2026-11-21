import { describe, expect, it } from 'vitest';
import type { AppBskyFeedDefs, AppBskyNotificationListNotifications } from '@atproto/api';
import { toBskyNotifications } from './notifications';

const actor = (name: string) => ({ did: `did:plc:${name}`, handle: `${name}.test` });
const mine = 'at://did:plc:me/app.bsky.feed.post/mine';
const notification = (
	reason: string,
	name: string,
	extra: Partial<AppBskyNotificationListNotifications.Notification> = {},
): AppBskyNotificationListNotifications.Notification => ({
	uri: `at://did:plc:${name}/app.bsky.feed.${reason}/${name}`,
	cid: 'cid',
	author: actor(name),
	reason,
	record: {},
	isRead: false,
	indexedAt: '2026-11-21T00:00:00.000Z',
	...extra,
});
const post = (uri: string): AppBskyFeedDefs.PostView => ({
	uri,
	cid: 'cid',
	author: actor('me'),
	record: { $type: 'app.bsky.feed.post', text: 'わたしの投稿', createdAt: '2026-11-20T00:00:00Z' },
	indexedAt: '2026-11-20T00:00:00Z',
	likeCount: 3,
});

describe('toBskyNotifications', () => {
	it('lists every like on its own instead of grouping them with a count', () => {
		const items = toBskyNotifications(
			['alice', 'bob', 'carol'].map((name) => notification('like', name, { reasonSubject: mine })),
			new Map([[mine, post(mine)]]),
		);
		expect(items.map((item) => item.actor.handle)).toEqual([
			'alice.test',
			'bob.test',
			'carol.test',
		]);
		expect(items[0].post?.text).toBe('わたしの投稿');
		expect(items[0].post).not.toHaveProperty('likeCount');
	});

	it('drops reasons Nagi does not show', () => {
		const items = toBskyNotifications(
			[
				notification('like-via-repost', 'a'),
				notification('starterpack-joined', 'b'),
				notification('follow', 'c'),
			],
			new Map(),
		);
		expect(items.map((item) => item.reason)).toEqual(['follow']);
	});

	it('attaches the reply itself to reply notifications', () => {
		const reply = notification('reply', 'dave');
		const items = toBskyNotifications([reply], new Map([[reply.uri, post(reply.uri)]]));
		expect(items[0].post?.uri).toBe(reply.uri);
	});
});
