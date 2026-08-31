import sharp from 'sharp';

const MAX_AVATAR_BYTES = 1_000_000;
const MAX_AVATAR_PIXELS = 4096 * 4096;
const AVATAR_MEDIA_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

type Fetcher = (input: string, init?: RequestInit) => Promise<Response>;

/**
 * ImageResponse は WebP を読み込めても、最終的な SVG -> PNG 変換で画像を描画できない。
 * OGP に埋め込む前に小さな PNG data URI へ正規化する。
 */
export async function prepareOgpAvatar(
	url: string | undefined,
	size: number,
	fetcher: Fetcher = fetch,
): Promise<string | undefined> {
	if (!url) return undefined;

	try {
		const response = await fetcher(url, {
			headers: { Accept: 'image/jpeg,image/png,image/webp' },
			signal: AbortSignal.timeout(5_000),
		});
		if (!response.ok) throw new Error(`avatar returned ${response.status}`);

		const mediaType = response.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase();
		if (!mediaType || !AVATAR_MEDIA_TYPES.has(mediaType)) {
			throw new Error(`unsupported avatar type: ${mediaType || 'unknown'}`);
		}

		const contentLength = Number(response.headers.get('content-length'));
		if (Number.isFinite(contentLength) && contentLength > MAX_AVATAR_BYTES) {
			throw new Error('avatar exceeds size limit');
		}

		const source = new Uint8Array(await response.arrayBuffer());
		if (source.byteLength > MAX_AVATAR_BYTES) throw new Error('avatar exceeds size limit');

		const png = await sharp(source, { limitInputPixels: MAX_AVATAR_PIXELS })
			.rotate()
			.resize(size, size, { fit: 'cover' })
			.png()
			.toBuffer();
		return `data:image/png;base64,${png.toString('base64')}`;
	} catch (error) {
		console.warn('Failed to prepare profile avatar for OGP:', error);
		return undefined;
	}
}
