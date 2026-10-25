import { describe, expect, it } from 'vitest';
import type { BskyFeedItemView } from './mapView';
import { filterTimeline, type TimelineViewPrefs } from './timelineFilter';

const ME = 'did:plc:me';
const NONE: TimelineViewPrefs = {
	hideReplies: false,
	hideRepliesByUnfollowed: false,
	hideReposts: false,
	hideQuotePosts: false,
};

function item(
	key: string,
	extra: {
		author?: string;
		repost?: boolean;
		quote?: boolean;
		reply?: BskyFeedItemView['reply'];
	} = {},
): BskyFeedItemView {
	const author = extra.author ?? 'did:plc:alice';
	return {
		key,
		post: {
			uri: `at://${author}/app.bsky.feed.post/${key}`,
			author: { did: author, handle: 'a.test', profileUrl: '' },
			text: key,
			createdAt: '2026-10-26T00:00:00.000Z',
			likedByMe: false,
			quote: extra.quote ? { kind: 'unavailable' } : undefined,
			raw: {} as BskyFeedItemView['post']['raw'],
		},
		repostedBy: extra.repost ? { did: 'did:plc:bob', handle: 'b.test', profileUrl: '' } : undefined,
		reply: extra.reply,
	};
}

const keys = (items: BskyFeedItemView[]) => items.map((entry) => entry.key);

describe('filterTimeline', () => {
	const timeline = [
		item('plain'),
		item('repost', { repost: true }),
		item('quote', { quote: true }),
		item('reply-followed', { reply: { parentDid: 'did:plc:carol', parentFollowed: true } }),
		item('reply-stranger', { reply: { parentDid: 'did:plc:dave', parentFollowed: false } }),
		item('reply-self-thread', { reply: { parentDid: 'did:plc:alice', parentFollowed: false } }),
		item('reply-to-me', { reply: { parentDid: ME, parentFollowed: false } }),
		item('reply-missing', { reply: { parentFollowed: false } }),
		item('my-reply', { author: ME, reply: { parentDid: 'did:plc:dave', parentFollowed: false } }),
	];

	it('keeps everything when nothing is hidden', () => {
		expect(filterTimeline(timeline, NONE, ME)).toHaveLength(timeline.length);
	});

	it('hides reposts and quotes when asked', () => {
		expect(keys(filterTimeline(timeline, { ...NONE, hideReposts: true }, ME))).not.toContain(
			'repost',
		);
		expect(keys(filterTimeline(timeline, { ...NONE, hideQuotePosts: true }, ME))).not.toContain(
			'quote',
		);
	});

	it('hides replies but keeps my own and the ones addressed to me', () => {
		expect(keys(filterTimeline(timeline, { ...NONE, hideReplies: true }, ME))).toEqual([
			'plain',
			'repost',
			'quote',
			'reply-to-me',
			'my-reply',
		]);
	});

	it('hides replies to people I do not follow, keeping self-threads', () => {
		expect(keys(filterTimeline(timeline, { ...NONE, hideRepliesByUnfollowed: true }, ME))).toEqual([
			'plain',
			'repost',
			'quote',
			'reply-followed',
			'reply-self-thread',
			'reply-to-me',
			'my-reply',
		]);
	});
});
