import { getLinkThumbnail } from '$lib/api/appview';
import { processImage } from '$lib/images';
import { POST_ATTACHMENT_CARD_VERSION } from '$lib/og/html';
import { NAGI_PUBLIC_ORIGIN } from '$lib/standardsite/types';
import { parseNagiPostUrl } from './quote-url';

const LINK_CARD_THUMBNAIL_BYTES = 1_000_000;
const LINK_CARD_THUMBNAIL_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function loadLinkCardThumbnail(uri: string, image: string) {
	try {
		const thumbnail = await getLinkThumbnail(image);
		return { thumbnail, previewUrl: URL.createObjectURL(thumbnail) };
	} catch (error) {
		const target = parseNagiPostUrl(uri);
		const url = URL.canParse(image) ? new URL(image) : undefined;
		// ブラウザからの直接取得は、カードの対象と一致する自サイトの公開画像に限る。
		if (
			!target ||
			!url ||
			url.origin !== NAGI_PUBLIC_ORIGIN ||
			url.pathname !== '/api/post-card' ||
			url.searchParams.get('v') !== POST_ATTACHMENT_CARD_VERSION ||
			url.searchParams.get('kind') !== 'post' ||
			url.searchParams.get('did') !== target.did ||
			url.searchParams.get('rkey') !== target.rkey
		)
			throw error;

		const response = await fetch(url.pathname + url.search, {
			credentials: 'omit',
			redirect: 'error',
			signal: AbortSignal.timeout(8_000),
		});
		if (!response.ok) throw error;
		const blob = await response.blob();
		if (!blob.size || !LINK_CARD_THUMBNAIL_TYPES.has(blob.type)) throw error;
		const thumbnail = await processImage(
			new File([blob], 'post-card', { type: blob.type }),
			undefined,
			LINK_CARD_THUMBNAIL_BYTES,
		);
		return { thumbnail: thumbnail.blob, previewUrl: thumbnail.previewUrl };
	}
}
