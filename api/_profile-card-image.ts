import { isSafeDid } from '../src/lib/og/html.js';

const MAX_AVATAR_BYTES = 1_000_000;
const RENDERABLE_MEDIA_TYPES = new Set(['image/jpeg', 'image/png']);
const BLOB_PATH_PATTERN = /^\/api\/blob\/([^/]+)\/([^/]+)$/;
const CID_PATTERN = /^[a-z0-9]{8,128}$/;

type Fetcher = (input: string, init?: RequestInit) => Promise<Response>;

/**
 * Bluesky の画像 CDN は `@jpeg` 指定で元画像の形式によらず JPEG を返す。
 * blob proxy の URL から did / cid を取り出して組み立てる。
 */
export function bskyCdnJpegUrl(url: string): string | undefined {
	const match = BLOB_PATH_PATTERN.exec(new URL(url).pathname);
	if (!match) return undefined;
	const did = decodeURIComponent(match[1]);
	const cid = decodeURIComponent(match[2]);
	if (!isSafeDid(did) || !CID_PATTERN.test(cid)) return undefined;
	return `https://cdn.bsky.app/img/avatar/plain/${did}/${cid}@jpeg`;
}

async function fetchRenderableAvatar(url: string, fetcher: Fetcher) {
	const response = await fetcher(url, {
		headers: { Accept: 'image/jpeg,image/png' },
		signal: AbortSignal.timeout(5_000),
	});
	if (!response.ok) throw new Error(`avatar returned ${response.status}`);

	const mediaType = response.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase();
	if (!mediaType || !RENDERABLE_MEDIA_TYPES.has(mediaType)) {
		await response.body?.cancel();
		return undefined;
	}

	const contentLength = Number(response.headers.get('content-length'));
	if (Number.isFinite(contentLength) && contentLength > MAX_AVATAR_BYTES) {
		throw new Error('avatar exceeds size limit');
	}

	const source = new Uint8Array(await response.arrayBuffer());
	if (source.byteLength > MAX_AVATAR_BYTES) throw new Error('avatar exceeds size limit');
	let binary = '';
	for (let i = 0; i < source.length; i += 0x8000) {
		binary += String.fromCharCode(...source.subarray(i, i + 0x8000));
	}
	return `data:${mediaType};base64,${btoa(binary)}`;
}

/**
 * ImageResponse は WebP を読み込めても、最終的な SVG -> PNG 変換で画像を描画できない。
 * JPEG / PNG はそのまま data URI にし、それ以外（WebP など）は Bluesky CDN の JPEG で代替する。
 * 画像変換ライブラリ（sharp）を関数バンドルに含めないための構成。
 */
export async function prepareOgpAvatar(
	url: string | undefined,
	fetcher: Fetcher = fetch,
): Promise<string | undefined> {
	if (!url) return undefined;

	try {
		const direct = await fetchRenderableAvatar(url, fetcher);
		if (direct) return direct;

		const cdnUrl = bskyCdnJpegUrl(url);
		if (!cdnUrl) throw new Error('unsupported avatar type and no CDN fallback');
		const converted = await fetchRenderableAvatar(cdnUrl, fetcher);
		if (!converted) throw new Error('CDN fallback returned an unsupported avatar type');
		return converted;
	} catch (error) {
		console.warn('Failed to prepare profile avatar for OGP:', error);
		return undefined;
	}
}
