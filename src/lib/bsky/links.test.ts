import { describe, expect, it } from 'vitest';
import { bskyFeedUrl, bskyPostUrl, isFeedGeneratorUri, parseFeedInput } from './links';

const FEED = 'at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/whats-hot';

describe('isFeedGeneratorUri', () => {
	it('accepts only feed generator AT-URIs, matching the AppView rule', () => {
		expect(isFeedGeneratorUri(FEED)).toBe(true);
		expect(isFeedGeneratorUri('at://did:web:feeds.example.com/app.bsky.feed.generator/a')).toBe(
			true,
		);
		expect(isFeedGeneratorUri('at://did:plc:a/app.bsky.graph.list/1')).toBe(false);
		expect(isFeedGeneratorUri('at://alice.bsky.social/app.bsky.feed.generator/a')).toBe(false);
		expect(isFeedGeneratorUri(`at://did:plc:a/app.bsky.feed.generator/${'x'.repeat(512)}`)).toBe(
			false,
		);
	});
});

describe('parseFeedInput', () => {
	it('reads bsky.app feed URLs with a handle or a DID', () => {
		expect(parseFeedInput(' https://bsky.app/profile/bsky.app/feed/whats-hot ')).toEqual({
			actor: 'bsky.app',
			rkey: 'whats-hot',
		});
		expect(
			parseFeedInput('https://bsky.app/profile/did:plc:z72i7hdynmk6r22z27h6tvur/feed/whats-hot/'),
		).toEqual({ actor: 'did:plc:z72i7hdynmk6r22z27h6tvur', rkey: 'whats-hot' });
	});

	it('reads feed generator AT-URIs', () => {
		expect(parseFeedInput(FEED)).toEqual({
			actor: 'did:plc:z72i7hdynmk6r22z27h6tvur',
			rkey: 'whats-hot',
		});
	});

	it('rejects other hosts, lists and posts', () => {
		expect(parseFeedInput('https://example.com/profile/a/feed/b')).toBeUndefined();
		expect(parseFeedInput('http://bsky.app/profile/a/feed/b')).toBeUndefined();
		expect(parseFeedInput('https://bsky.app/profile/a/lists/b')).toBeUndefined();
		expect(parseFeedInput('at://did:plc:a/app.bsky.feed.post/b')).toBeUndefined();
		expect(parseFeedInput('whats-hot')).toBeUndefined();
	});
});

describe('bsky.app links', () => {
	it('builds post and feed URLs from the DID', () => {
		expect(bskyPostUrl('at://did:plc:a/app.bsky.feed.post/3abc')).toBe(
			'https://bsky.app/profile/did:plc:a/post/3abc',
		);
		expect(bskyFeedUrl(FEED)).toBe(
			'https://bsky.app/profile/did:plc:z72i7hdynmk6r22z27h6tvur/feed/whats-hot',
		);
		expect(bskyPostUrl('not a uri')).toBeUndefined();
	});
});
