import { describe, expect, it } from 'vitest';
import type { FeedItem } from '$lib/api/types';
import { mediaTiles } from './media-tiles';

const post = (media: Partial<FeedItem>) => ({ uri: 'at://did:plc:a/post/1', ...media }) as FeedItem;
const image = (url: string) => ({ url, alt: '' });
const video = { thumbnail: 'thumb.jpg', playlist: 'playlist.m3u8', alt: 'cat' };

describe('mediaTiles', () => {
	it('lays out images and then the video of a mixed post', () => {
		const tiles = mediaTiles([
			post({ images: [image('a'), image('b')], video } as Partial<FeedItem>),
		]);
		expect(tiles.map((tile) => [tile.index, tile.image.url, Boolean(tile.video)])).toEqual([
			[0, 'a', false],
			[1, 'b', false],
			[2, 'thumb.jpg', true],
		]);
	});

	it('keeps a video-only post as a single tile', () => {
		const tiles = mediaTiles([post({ video } as Partial<FeedItem>)]);
		expect(tiles).toHaveLength(1);
		expect(tiles[0]).toMatchObject({ index: 0, video: true });
	});
});
