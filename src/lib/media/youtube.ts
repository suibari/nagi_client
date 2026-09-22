const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

/** YouTube の動画 URL から、安全に embed へ渡せる動画 ID だけを取り出す。 */
export function youtubeVideoId(value: string): string | undefined {
	let url: URL;
	try {
		url = new URL(value);
	} catch {
		return undefined;
	}
	if (url.protocol !== 'https:' && url.protocol !== 'http:') return undefined;

	const host = url.hostname.toLowerCase().replace(/^(?:www\.|m\.)/, '');
	let candidate: string | null | undefined;
	if (host === 'youtu.be') {
		candidate = url.pathname.split('/')[1];
	} else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
		const [kind, id] = url.pathname.split('/').filter(Boolean);
		if (kind === 'watch' || !kind) candidate = url.searchParams.get('v');
		else if (['shorts', 'live', 'embed'].includes(kind)) candidate = id;
	}

	return candidate && VIDEO_ID.test(candidate) ? candidate : undefined;
}

export function youtubeEmbedUrl(value: string): string | undefined {
	const id = youtubeVideoId(value);
	return id ? `https://www.youtube-nocookie.com/embed/${id}` : undefined;
}
