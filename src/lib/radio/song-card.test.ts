import { describe, expect, it } from 'vitest';
import { radioSongCard } from './song-card';
import type { RadioTrack } from '$lib/api/types';

const track: RadioTrack = {
	slotKey: '2026-09-24-14',
	title: 'チェリー',
	artist: 'スピッツ',
	comment: '今日の一曲。',
	publishedAt: '2026-09-24T05:00:00Z',
};

describe('radioSongCard', () => {
	it('shows a Last.fm song link and its album cover without a video ID', () => {
		const songUrl = 'https://www.last.fm/music/Spitz/_/Cherry';
		const thumbnailUrl = 'https://lastfm-img.freetls.fastly.net/i/u/300x300/cover.png';
		expect(radioSongCard({ ...track, songUrl, thumbnailUrl })).toEqual({
			uri: songUrl,
			title: 'スピッツ - チェリー',
			thumb: thumbnailUrl,
		});
	});
	it('keeps old YouTube history visible', () => {
		expect(radioSongCard({ ...track, videoId: 'dQw4w9WgXcQ' })).toEqual({
			uri: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
			title: 'スピッツ - チェリー',
			thumb: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
		});
	});
	it('rejects unsafe links and does not invent an image for another provider', () => {
		expect(radioSongCard({ ...track, songUrl: 'javascript:alert(1)' })).toBeNull();
		expect(
			radioSongCard({
				...track,
				songUrl: 'https://www.last.fm/music/Spitz/_/Cherry',
				thumbnailUrl: 'javascript:alert(1)',
				videoId: 'dQw4w9WgXcQ',
			})?.thumb,
		).toBeUndefined();
	});
});
