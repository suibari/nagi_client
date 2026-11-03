import { describe, expect, it } from 'vitest';
import {
	blobKey,
	imageMarkdown,
	inlineImageKeys,
	inlineImageUrl,
	pruneInlineImages,
} from './inlineImages';

describe('inline article images', () => {
	const url = inlineImageUrl('did:plc:alice', 'bafkreiabc');

	it('matches body URLs and AppView image URLs by DID and CID', () => {
		expect(url).toBe('https://nagi.suibari.com/api/blob/did:plc:alice/bafkreiabc');
		expect(blobKey(url)).toBe('did:plc:alice/bafkreiabc');
		expect(blobKey('/api/blob/did%3Aplc%3Aalice/bafkreiabc')).toBe('did:plc:alice/bafkreiabc');
		expect(
			blobKey('https://nagi-api.suibari.com/api/blob/did%3Aplc%3Aalice/bafkreiabc', [
				'https://nagi-api.suibari.com',
			]),
		).toBe('did:plc:alice/bafkreiabc');
		expect(blobKey('https://example.com/api/blob/did:plc:alice/bafkreiabc')).toBeUndefined();
	});

	it('finds and prunes image lines', () => {
		const text = `intro\n${imageMarkdown('a]b', url)}\n![x](${inlineImageUrl('did:plc:alice', 'gone')})\n![ext](https://example.com/a.png)`;
		expect(text).toContain('![a b](');
		expect([...inlineImageKeys(text)]).toEqual(['did:plc:alice/bafkreiabc', 'did:plc:alice/gone']);
		expect(pruneInlineImages(text, new Set(['did:plc:alice/bafkreiabc']))).toBe(
			`intro\n![a b](${url})\n![ext](https://example.com/a.png)`,
		);
	});
});
