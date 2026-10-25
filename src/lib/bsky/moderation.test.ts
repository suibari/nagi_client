import { describe, expect, it } from 'vitest';
import { DEFAULT_LABEL_SETTINGS, type AppBskyFeedDefs, type ModerationOpts } from '@atproto/api';
import { bskyPostDisplay } from './moderation';

const opts = (adultContentEnabled: boolean): ModerationOpts => ({
	userDid: 'did:plc:me',
	prefs: {
		adultContentEnabled,
		labels: { ...DEFAULT_LABEL_SETTINGS, porn: 'warn' },
		labelers: [],
		mutedWords: [],
		hiddenPosts: [],
	},
	labelDefs: {},
});

const labeled = (val: string): AppBskyFeedDefs.PostView => ({
	uri: 'at://did:plc:alice/app.bsky.feed.post/1',
	cid: 'cid',
	author: { did: 'did:plc:alice', handle: 'alice.test' },
	record: { $type: 'app.bsky.feed.post', text: 'x', createdAt: '2026-10-26T00:00:00.000Z' },
	indexedAt: '2026-10-26T00:00:00.000Z',
	labels: [
		{
			src: 'did:plc:alice',
			uri: 'at://did:plc:alice/app.bsky.feed.post/1',
			val,
			cts: '2026-10-26T00:00:00.000Z',
		},
	],
});

describe('bskyPostDisplay', () => {
	it('always hides adult content from people Nagi has not confirmed as adults', () => {
		expect(bskyPostDisplay(labeled('porn'), opts(true), { isAdult: false }).hidden).toBe(true);
	});

	it('follows the Bluesky settings for confirmed adults', () => {
		expect(bskyPostDisplay(labeled('porn'), opts(false), { isAdult: true }).hidden).toBe(true);
		const shown = bskyPostDisplay(labeled('porn'), opts(true), { isAdult: true });
		expect(shown.hidden).toBe(false);
		expect(shown.warnMedia || shown.warnContent).toBe(true);
	});

	it('shows unlabeled posts as they are', () => {
		const post = { ...labeled('x'), labels: [] };
		expect(bskyPostDisplay(post, opts(false), { isAdult: false })).toEqual({
			hidden: false,
			warnContent: false,
			warnMedia: false,
		});
	});
});
