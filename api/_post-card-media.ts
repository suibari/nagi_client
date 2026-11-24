import { isSafeDid } from '../src/lib/og/html.js';
import { APPVIEW_ORIGIN, NAGI_ORIGIN } from './_ogp.js';

const VIDEO_ORIGIN = 'https://video.bsky.app';
const VIDEO_CDN_ORIGIN = 'https://video.cdn.bsky.app';
const MAX_IMAGE_BYTES = 2_000_000;
const MAX_REDIRECTS = 2;
const BLOB_PATH = /^\/api\/blob\/([^/]+)\/([a-z0-9]{8,128})$/;
const VIDEO_PATH = /^\/(api\/video|watch|hls)\/([^/]+)\/([a-z0-9]{8,128})\/thumbnail\.jpg$/;

type MediaKind = 'image' | 'video';

function mediaUrl(value: string, kind: MediaKind, base = APPVIEW_ORIGIN): URL | undefined {
	const url = new URL(value, base);
	if (url.username || url.password || url.search || url.hash) return;
	if (kind === 'image') {
		if (url.origin !== APPVIEW_ORIGIN && url.origin !== NAGI_ORIGIN) return;
		const path = BLOB_PATH.exec(url.pathname);
		if (path && isSafeDid(decodeURIComponent(path[1]))) {
			return new URL(url.pathname, APPVIEW_ORIGIN);
		}
		return;
	}

	const path = VIDEO_PATH.exec(url.pathname);
	if (!path || !isSafeDid(decodeURIComponent(path[2]))) return;
	if (
		(url.origin === APPVIEW_ORIGIN && path[1] === 'api/video') ||
		(url.origin === VIDEO_ORIGIN && path[1] === 'watch') ||
		(url.origin === VIDEO_CDN_ORIGIN && path[1] === 'hls')
	)
		return url;
}

const SIGNATURES: Readonly<Record<string, readonly number[]>> = {
	'image/jpeg': [0xff, 0xd8, 0xff],
	'image/png': [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
	'image/gif': [0x47, 0x49, 0x46, 0x38],
	'image/webp': [0x52, 0x49, 0x46, 0x46],
};

async function readImage(response: Response) {
	const contentType = response.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase();
	const signature =
		contentType && Object.hasOwn(SIGNATURES, contentType) && SIGNATURES[contentType];
	if (
		!response.ok ||
		!signature ||
		Number(response.headers.get('content-length')) > MAX_IMAGE_BYTES
	) {
		await response.body?.cancel();
		return;
	}

	const reader = response.body?.getReader();
	if (!reader) return;
	const chunks: Uint8Array[] = [];
	let size = 0;
	try {
		for (;;) {
			const { done, value } = await reader.read();
			if (done) break;
			size += value.byteLength;
			if (size > MAX_IMAGE_BYTES) return;
			chunks.push(value);
		}
	} finally {
		await reader.cancel();
	}

	const bytes = new Uint8Array(size);
	let offset = 0;
	for (const chunk of chunks) {
		bytes.set(chunk, offset);
		offset += chunk.byteLength;
	}
	if (!signature.every((byte, index) => bytes[index] === byte)) return;
	if (contentType === 'image/webp' && String.fromCharCode(...bytes.subarray(8, 12)) !== 'WEBP')
		return;
	return { bytes, contentType };
}

export async function fetchPostCardMedia(value: string, kind: MediaKind, budget: AbortSignal) {
	try {
		const signal = AbortSignal.any([budget, AbortSignal.timeout(2_000)]);
		let url = mediaUrl(value, kind);
		for (let redirects = 0; url && redirects <= MAX_REDIRECTS && !signal.aborted; redirects++) {
			const response = await fetch(url.href, { redirect: 'manual', signal });
			if (![301, 302, 303, 307, 308].includes(response.status)) return await readImage(response);
			const location = response.headers.get('location');
			await response.body?.cancel();
			url = location ? mediaUrl(location, kind, url.href) : undefined;
		}
	} catch {
		return undefined;
	}
}
