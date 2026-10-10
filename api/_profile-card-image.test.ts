import { describe, expect, it, vi } from 'vitest';
import { bskyCdnJpegUrl, prepareOgpAvatar } from './_profile-card-image.js';

const BLOB_URL = 'https://nagi-api.example/api/blob/did%3Aplc%3Aalice/bafkreiavatar';
const CDN_URL = 'https://cdn.bsky.app/img/avatar/plain/did:plc:alice/bafkreiavatar@jpeg';

const image = (bytes: number[], type: string) =>
	new Response(new Uint8Array(bytes), {
		status: 200,
		headers: { 'content-type': type, 'content-length': String(bytes.length) },
	});

describe('profile OGP avatar', () => {
	it('embeds JPEG/PNG avatars from the blob proxy as-is', async () => {
		const fetcher = vi.fn(async () => image([0xff, 0xd8, 0xff], 'image/jpeg'));

		const avatar = await prepareOgpAvatar(BLOB_URL, fetcher);

		expect(fetcher).toHaveBeenCalledOnce();
		expect(fetcher).toHaveBeenCalledWith(BLOB_URL, expect.anything());
		expect(avatar).toBe('data:image/jpeg;base64,/9j/');
	});

	it('falls back to the Bluesky CDN JPEG when the blob is WebP', async () => {
		const fetcher = vi.fn(async (url: string) =>
			url === BLOB_URL
				? image([0x52, 0x49, 0x46, 0x46], 'image/webp')
				: image([0xff, 0xd8, 0xff], 'image/jpeg'),
		);

		const avatar = await prepareOgpAvatar(BLOB_URL, fetcher);

		expect(fetcher).toHaveBeenCalledTimes(2);
		expect(fetcher).toHaveBeenLastCalledWith(CDN_URL, expect.anything());
		expect(avatar).toBe('data:image/jpeg;base64,/9j/');
	});

	it('falls back when the avatar response is not a supported image', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		const fetcher = vi.fn(
			async () =>
				new Response('not an image', { status: 200, headers: { 'content-type': 'text/plain' } }),
		);

		await expect(prepareOgpAvatar(BLOB_URL, fetcher)).resolves.toBeUndefined();
		expect(warn).toHaveBeenCalledOnce();
		warn.mockRestore();
	});

	it('only builds CDN URLs from well-formed blob proxy paths', () => {
		expect(bskyCdnJpegUrl(BLOB_URL)).toBe(CDN_URL);
		expect(
			bskyCdnJpegUrl('https://nagi-api.example/api/blob/not-a-did/bafkreiavatar'),
		).toBeUndefined();
		expect(
			bskyCdnJpegUrl('https://nagi-api.example/api/blob/did%3Aplc%3Aalice/..%2Fx'),
		).toBeUndefined();
		expect(
			bskyCdnJpegUrl('https://nagi-api.example/other/did%3Aplc%3Aalice/bafkrei'),
		).toBeUndefined();
	});
});
