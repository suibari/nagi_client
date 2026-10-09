import { describe, expect, it } from 'vitest';
import { splitMediaSelection } from './media-selection';

const file = (type: string) => new File(['x'], 'f', { type });

describe('splitMediaSelection', () => {
	const image = file('image/png');
	const video = file('video/mp4');

	it('passes images through untouched', () => {
		expect(splitMediaSelection([image], { allowVideo: true, hasImages: false })).toEqual({
			kind: 'images',
			files: [image],
		});
	});

	it('accepts exactly one video when no images are attached', () => {
		expect(splitMediaSelection([video], { allowVideo: true, hasImages: false })).toEqual({
			kind: 'video',
			file: video,
		});
	});

	it('refuses two videos, or a video together with images', () => {
		expect(splitMediaSelection([video, video], { allowVideo: true, hasImages: false })).toEqual({
			kind: 'error',
			reason: 'video-count',
		});
		expect(splitMediaSelection([video, image], { allowVideo: true, hasImages: false })).toEqual({
			kind: 'error',
			reason: 'video-with-images',
		});
		expect(splitMediaSelection([video], { allowVideo: true, hasImages: true })).toEqual({
			kind: 'error',
			reason: 'video-with-images',
		});
	});

	it('treats videos as ordinary files where videos are not allowed', () => {
		expect(splitMediaSelection([video], { allowVideo: false, hasImages: false })).toEqual({
			kind: 'images',
			files: [video],
		});
	});
});
