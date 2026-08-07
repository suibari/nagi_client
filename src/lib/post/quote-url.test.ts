import { describe, expect, it } from 'vitest';
import { parseNagiPostUrl, postUriFromTarget } from './quote-url';

const DID = 'did:plc:abcdefghijklmnopqrstuvwx';
const RKEY = '3k2abcdefgh';

describe('parseNagiPostUrl', () => {
	it('accepts absolute thread URLs on the public origin', () => {
		expect(parseNagiPostUrl(`https://nagi.suibari.com/thread/${DID}/${RKEY}`)).toEqual({
			did: DID,
			rkey: RKEY,
		});
	});

	it('accepts relative thread paths', () => {
		expect(parseNagiPostUrl(`/thread/${DID}/${RKEY}`)).toEqual({ did: DID, rkey: RKEY });
	});

	it('trims surrounding whitespace', () => {
		expect(parseNagiPostUrl(`  https://nagi.suibari.com/thread/${DID}/${RKEY}\n`)).toEqual({
			did: DID,
			rkey: RKEY,
		});
	});

	it('ignores query and hash', () => {
		expect(parseNagiPostUrl(`https://nagi.suibari.com/thread/${DID}/${RKEY}?a=1#top`)).toEqual({
			did: DID,
			rkey: RKEY,
		});
	});

	it('rejects non-thread Nagi pages', () => {
		expect(parseNagiPostUrl(`https://nagi.suibari.com/profile/${DID}`)).toBeUndefined();
		expect(parseNagiPostUrl(`https://nagi.suibari.com/channels/${DID}/${RKEY}`)).toBeUndefined();
		expect(parseNagiPostUrl(`https://nagi.suibari.com/thread/${DID}`)).toBeUndefined();
	});

	it('rejects other origins', () => {
		expect(parseNagiPostUrl(`https://example.com/thread/${DID}/${RKEY}`)).toBeUndefined();
		expect(parseNagiPostUrl(`//example.com/thread/${DID}/${RKEY}`)).toBeUndefined();
	});

	it('rejects paths whose actor segment is not a DID', () => {
		expect(parseNagiPostUrl(`https://nagi.suibari.com/thread/suibari.com/${RKEY}`)).toBeUndefined();
	});

	it('rejects text that merely contains a thread URL', () => {
		expect(
			parseNagiPostUrl(`見て https://nagi.suibari.com/thread/${DID}/${RKEY}`),
		).toBeUndefined();
		expect(
			parseNagiPostUrl(`https://nagi.suibari.com/thread/${DID}/${RKEY} これ`),
		).toBeUndefined();
	});

	it('rejects empty and non-URL input', () => {
		expect(parseNagiPostUrl('')).toBeUndefined();
		expect(parseNagiPostUrl(undefined)).toBeUndefined();
		expect(parseNagiPostUrl(null)).toBeUndefined();
		expect(parseNagiPostUrl('ただの文章')).toBeUndefined();
	});
});

describe('postUriFromTarget', () => {
	it('builds the post AT-URI', () => {
		expect(postUriFromTarget({ did: DID, rkey: RKEY })).toBe(
			`at://${DID}/com.suibari.nagi.post/${RKEY}`,
		);
	});
});
