import { Buffer } from 'node:buffer';
import sharp from 'sharp';
import { describe, expect, it, vi } from 'vitest';
import { prepareOgpAvatar } from './profile-card-image.js';

describe('profile OGP avatar', () => {
	it('normalizes WebP avatars to a square PNG for ImageResponse', async () => {
		const webp = await sharp({
			create: { width: 32, height: 16, channels: 4, background: '#ef4444' },
		})
			.webp()
			.toBuffer();
		const fetcher = vi.fn(
			async () =>
				new Response(webp, {
					status: 200,
					headers: { 'content-type': 'image/webp', 'content-length': String(webp.byteLength) },
				}),
		);

		const avatar = await prepareOgpAvatar(
			'https://nagi-api.example/api/blob/did/cid',
			224,
			fetcher,
		);

		expect(fetcher).toHaveBeenCalledOnce();
		expect(avatar).toMatch(/^data:image\/png;base64,/);
		const png = Buffer.from(avatar!.split(',', 2)[1], 'base64');
		await expect(sharp(png).metadata()).resolves.toMatchObject({
			format: 'png',
			width: 224,
			height: 224,
		});
	});

	it('falls back when the avatar response is not a supported image', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		const fetcher = vi.fn(
			async () =>
				new Response('not an image', { status: 200, headers: { 'content-type': 'text/plain' } }),
		);

		await expect(
			prepareOgpAvatar('https://nagi-api.example/api/blob/did/cid', 224, fetcher),
		).resolves.toBeUndefined();
		expect(warn).toHaveBeenCalledOnce();
		warn.mockRestore();
	});
});
