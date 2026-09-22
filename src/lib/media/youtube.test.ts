import { describe, expect, it } from 'vitest';
import { youtubeEmbedUrl, youtubeVideoId } from './youtube';

describe('youtubeVideoId', () => {
	it.each([
		['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
		['https://youtu.be/dQw4w9WgXcQ?t=43', 'dQw4w9WgXcQ'],
		['https://m.youtube.com/shorts/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
		['https://youtube.com/live/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
		['https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
	])('extracts a video ID from %s', (url, expected) => {
		expect(youtubeVideoId(url)).toBe(expected);
	});

	it.each([
		'https://example.com/watch?v=dQw4w9WgXcQ',
		'https://youtube.com/@channel',
		'https://youtube.com/playlist?list=dQw4w9WgXcQ',
		'https://youtube.com/watch?v=not-valid',
		'javascript:alert(1)',
	])('rejects non-video URL %s', (url) => {
		expect(youtubeVideoId(url)).toBeUndefined();
	});

	it('uses the privacy-enhanced embed origin', () => {
		expect(youtubeEmbedUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(
			'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
		);
	});
});
