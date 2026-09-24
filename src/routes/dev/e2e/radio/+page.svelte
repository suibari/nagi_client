<script lang="ts">
	import RadioContent from '$lib/radio/RadioContent.svelte';
	import type { RadioTrack } from '$lib/api/types';

	const track: RadioTrack = {
		slotKey: '2026-09-24-14',
		title: 'チェリー',
		artist: 'スピッツ',
		comment: '今日はこの一曲を。',
		commentJa: '今日はこの一曲を。',
		commentEn: 'Here is a song for your day.',
		songUrl: 'https://www.last.fm/music/Spitz/_/Cherry',
		thumbnailUrl:
			'https://lastfm-img.freetls.fastly.net/i/u/300x300/85ed13b0384245b1970ec959c1fa39df.png',
		publishedAt: '2026-09-24T05:00:00Z',
	};
</script>

<div class="preview" data-testid="lastfm-radio"><RadioContent {track} /></div>
<div class="preview" data-testid="legacy-radio">
	<RadioContent
		track={{ ...track, songUrl: undefined, thumbnailUrl: undefined, videoId: 'dQw4w9WgXcQ' }}
	/>
</div>

<style>
	.preview {
		max-width: 340px;
		margin: 20px auto;
		padding: 8px;
	}
</style>
