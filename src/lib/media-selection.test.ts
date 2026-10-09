import { describe, expect, it } from 'vitest';
import { splitMediaSelection } from './media-selection';

const file = (type: string) => new File(['x'], 'f', { type });

describe('splitMediaSelection', () => {
	const image = file('image/png');
	const video = file('video/mp4');

	it('passes images through untouched', () => {
		expect(splitMediaSelection([image], { allowVideo: true, hasVideo: false })).toEqual({
			kind: 'media',
			images: [image],
		});
	});

	it('accepts one video, alone or together with images', () => {
		expect(splitMediaSelection([video], { allowVideo: true, hasVideo: false })).toEqual({
			kind: 'media',
			images: [],
			video,
		});
		expect(splitMediaSelection([video, image], { allowVideo: true, hasVideo: false })).toEqual({
			kind: 'media',
			images: [image],
			video,
		});
	});

	it('still accepts images once a video is attached', () => {
		expect(splitMediaSelection([image], { allowVideo: true, hasVideo: true })).toEqual({
			kind: 'media',
			images: [image],
		});
	});

	it('refuses two videos, or a second video', () => {
		expect(splitMediaSelection([video, video], { allowVideo: true, hasVideo: false })).toEqual({
			kind: 'error',
			reason: 'video-count',
		});
		expect(splitMediaSelection([video], { allowVideo: true, hasVideo: true })).toEqual({
			kind: 'error',
			reason: 'video-count',
		});
	});

	it('treats videos as ordinary files where videos are not allowed', () => {
		expect(splitMediaSelection([video], { allowVideo: false, hasVideo: false })).toEqual({
			kind: 'media',
			images: [video],
		});
	});
});
