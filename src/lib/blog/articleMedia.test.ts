import { describe, expect, it } from 'vitest';
import { articleMedia } from './articleMedia';
import { inlineImageUrl } from './inlineImages';

const appView = 'https://nagi-api.suibari.com';
const image = (cid: string) => ({ url: `${appView}/api/blob/did%3Aplc%3Aalice/${cid}`, alt: cid });
const card = (uri: string) => ({ uri, title: uri });

describe('articleMedia', () => {
	it('uses the first image as the cover when it is not placed in the body', () => {
		const text = `# 題\n\n本文\n![](${inlineImageUrl('did:plc:alice', 'b')})`;
		const result = articleMedia(text, [image('a'), image('b'), image('c')], [], [appView]);
		expect(result.cover).toEqual(image('a'));
		expect(result.looseImages).toEqual([image('c')]);
	});

	it('keeps the first image in the body when it is placed there', () => {
		const text = `# 題\n\n![](${inlineImageUrl('did:plc:alice', 'a')})\n本文`;
		const result = articleMedia(text, [image('a'), image('b')], [], [appView]);
		expect(result.cover).toBeUndefined();
		expect(result.looseImages).toEqual([image('b')]);
	});

	it('leaves only cards that are not on their own line', () => {
		const text = '# 題\n\nhttps://example.com/a\n\n本文 https://example.com/b を参照';
		const result = articleMedia(
			text,
			[],
			[card('https://example.com/a'), card('https://example.com/b')],
		);
		expect(result.looseLinkCards).toEqual([card('https://example.com/b')]);
	});
});
