import { describe, expect, it } from 'vitest';
import { postgateRecord, replyAudienceOf, threadgateRecord } from './gates';

const uri = 'at://did:plc:me/app.bsky.feed.post/1';
const at = '2026-11-21T00:00:00.000Z';

describe('Bluesky gates', () => {
	it('adds nothing for the Bluesky defaults', () => {
		expect(threadgateRecord(uri, 'everyone', at)).toBeUndefined();
		expect(postgateRecord(uri, true, at)).toBeUndefined();
	});

	it('builds the reply rules', () => {
		expect(threadgateRecord(uri, 'following', at)?.allow).toEqual([
			{ $type: 'app.bsky.feed.threadgate#followingRule' },
		]);
		expect(threadgateRecord(uri, 'nobody', at)?.allow).toEqual([]);
	});

	it('disables quoting with a postgate', () => {
		expect(postgateRecord(uri, false, at)).toMatchObject({
			post: uri,
			embeddingRules: [{ $type: 'app.bsky.feed.postgate#disableRule' }],
		});
	});

	it('reads back settings, and does not guess combinations Nagi cannot express', () => {
		expect(replyAudienceOf(undefined)).toBe('everyone');
		expect(replyAudienceOf(threadgateRecord(uri, 'mentioned', at))).toBe('mentioned');
		expect(replyAudienceOf(threadgateRecord(uri, 'nobody', at))).toBe('nobody');
		expect(
			replyAudienceOf({
				allow: [
					{ $type: 'app.bsky.feed.threadgate#followingRule' },
					{ $type: 'app.bsky.feed.threadgate#mentionRule' },
				],
			}),
		).toBeUndefined();
	});
});
