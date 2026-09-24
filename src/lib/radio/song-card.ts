import type { LinkCardView, RadioTrack } from '$lib/api/types';

function httpsUrl(value?: string): string | undefined {
	try {
		const url = new URL(value ?? '');
		return url.protocol === 'https:' && !url.username && !url.password ? url.href : undefined;
	} catch {
		return undefined;
	}
}

/** 新しい曲リンクと、移行前のYouTube履歴の両方を表示する。 */
export function radioSongCard(track: RadioTrack): LinkCardView | null {
	const legacyId = /^[A-Za-z0-9_-]{11}$/.test(track.videoId ?? '') ? track.videoId : undefined;
	const uri =
		httpsUrl(track.songUrl) ||
		(legacyId ? `https://www.youtube.com/watch?v=${legacyId}` : undefined);
	if (!uri) return null;
	const thumb =
		httpsUrl(track.thumbnailUrl) ||
		(!track.songUrl && legacyId ? `https://i.ytimg.com/vi/${legacyId}/hqdefault.jpg` : undefined);
	return { uri, title: `${track.artist} - ${track.title}`, ...(thumb ? { thumb } : {}) };
}
