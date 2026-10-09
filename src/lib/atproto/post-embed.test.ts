import { describe, expect, it } from 'vitest';
import { buildPostEmbed, postEmbedMedia, type PostEmbedMedia } from './post-embed';

const POST = 'com.suibari.nagi.post';
const image = { image: { ref: { $link: 'bafyimage' } }, alt: 'cat' };
const video = { video: { ref: { $link: 'bafyvideo' } }, alt: 'running cat' };
const quote = { uri: `at://did:plc:other/${POST}/quoted`, cid: 'bafyquote' };

describe('post embed', () => {
	const cases: [string, PostEmbedMedia, string | undefined][] = [
		['nothing', { images: [] }, undefined],
		['images only', { images: [image] }, `${POST}#images`],
		['a video only', { images: [], video }, `${POST}#video`],
		['images and a video', { images: [image, image], video }, `${POST}#gallery`],
		['a bare quote', { images: [], quote }, `${POST}#quote`],
		['a quote with images and a video', { images: [image], video, quote }, `${POST}#quote`],
	];

	it.each(cases)('writes %s with the right embed type and reads it back', (_, media, type) => {
		const embed = buildPostEmbed(media);
		expect(embed?.$type).toBe(type);
		expect(postEmbedMedia(embed)).toEqual(media);
	});

	it('orders #gallery items images first, then the video', () => {
		const embed = buildPostEmbed({ images: [image], video });
		expect((embed?.items as { $type: string }[]).map((item) => item.$type)).toEqual([
			`${POST}#image`,
			`${POST}#video`,
		]);
	});

	it('reads only the first video from a malformed #gallery', () => {
		const media = postEmbedMedia({
			$type: `${POST}#gallery`,
			items: [
				{ $type: `${POST}#video`, ...video },
				{ $type: `${POST}#video`, video: {} },
			],
		});
		expect(media).toEqual({ images: [], video });
	});

	it('does not claim to understand unknown embed types', () => {
		expect(postEmbedMedia({ $type: 'com.example.unknown' })).toBeUndefined();
	});
});
