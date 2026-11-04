import { describe, expect, it } from 'vitest';
import {
	blobKey,
	fillInlineImageAlts,
	imageMarkdown,
	inlineImageAlts,
	inlineImageKeys,
	inlineImageState,
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

	it('reads the alt of each image line', () => {
		const text = `${imageMarkdown('猫', url)}\n![](${inlineImageUrl('did:plc:alice', 'other')})`;
		expect([...inlineImageAlts(text)]).toEqual([
			['did:plc:alice/bafkreiabc', '猫'],
			['did:plc:alice/other', ''],
		]);
	});

	it('tells placed, detached and listed images apart', () => {
		const placed = new Set(['a']);
		const seen = new Set(['a', 'b']);
		expect(inlineImageState('a', placed, seen)).toBe('placed');
		expect(inlineImageState('b', placed, seen)).toBe('detached');
		expect(inlineImageState('c', placed, seen)).toBe('listed');
		expect(inlineImageState(undefined, placed, seen)).toBe('listed');
	});

	it('moves attachment alts into empty image lines', () => {
		const other = inlineImageUrl('did:plc:alice', 'other');
		const text = `![](${url})\n![既存](${other})`;
		const alts = new Map([
			['did:plc:alice/bafkreiabc', '猫'],
			['did:plc:alice/other', '上書きしない'],
		]);
		expect(fillInlineImageAlts(text, alts)).toBe(`![猫](${url})\n![既存](${other})`);
	});
});
