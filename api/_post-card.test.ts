import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@vercel/og', () => ({ ImageResponse: vi.fn() }));
vi.mock('./_ogp.js', async (importOriginal) => ({
	...(await importOriginal<typeof import('./_ogp.js')>()),
	appViewJson: vi.fn(),
	getProfile: vi.fn(),
	loadFonts: vi.fn(),
	fallback: vi.fn(),
}));
import { ImageResponse } from '@vercel/og';
import { appViewJson, fallback, getProfile } from './_ogp.js';
import handler from './post-card.js';

beforeEach(() => vi.clearAllMocks());

describe('blog card validity', () => {
	it.each([{ article: true, deleted: true }, { article: false }, {}])(
		'rejects invalid document posts: %j',
		async (flags) => {
			vi.mocked(appViewJson).mockResolvedValue({ thread: { post: { ...flags, text: 'hidden' } } });
			const response = { status: vi.fn().mockReturnThis(), setHeader: vi.fn(), end: vi.fn() };
			await handler(
				{ method: 'GET', query: { did: 'did:plc:example', rkey: 'example', kind: 'blog' } },
				response,
			);
			expect(fallback).toHaveBeenCalledWith(response);
			expect(getProfile).not.toHaveBeenCalled();
			expect(ImageResponse).not.toHaveBeenCalled();
			expect(appViewJson).toHaveBeenCalledTimes(1);
		},
	);

	it('rejects an ordinary legacy post with the same rkey when the document is absent', async () => {
		vi.mocked(appViewJson)
			.mockRejectedValueOnce(new Error('not found'))
			.mockResolvedValueOnce({ thread: { post: { text: 'ordinary post', article: false } } });
		const response = { status: vi.fn().mockReturnThis(), setHeader: vi.fn(), end: vi.fn() };
		await handler(
			{ method: 'GET', query: { did: 'did:plc:example', rkey: 'example', kind: 'blog' } },
			response,
		);
		expect(appViewJson).toHaveBeenCalledTimes(2);
		expect(fallback).toHaveBeenCalledWith(response);
		expect(getProfile).not.toHaveBeenCalled();
		expect(ImageResponse).not.toHaveBeenCalled();
	});
});

const did = 'did:plc:example';
const image = (cid: string) => `/api/blob/did%3Aplc%3Aexample/${cid}`;
const thumbnail = `https://nagi-api.suibari.com/api/video/${did}/bafkreivideo/thumbnail.jpg`;
const legacyThumbnail = `https://video.bsky.app/watch/${did}/bafkreivideo/thumbnail.jpg`;
const cdnThumbnail = `https://video.cdn.bsky.app/hls/${did}/bafkreivideo/thumbnail.jpg`;
const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
const webp = new Uint8Array([82, 73, 70, 70, 0, 0, 0, 0, 87, 69, 66, 80]);

function imageResponse(bytes = jpeg, type = 'image/jpeg') {
	return new Response(bytes as Uint8Array<ArrayBuffer>, { headers: { 'Content-Type': type } });
}

function mockPost(fields: Record<string, unknown> = {}) {
	vi.mocked(appViewJson).mockResolvedValue({
		thread: { post: { author: { did, handle: 'example.test' }, text: 'Visible post', ...fields } },
	});
}

async function requestImage(query: Record<string, string> = {}, method = 'GET') {
	const response = { status: vi.fn().mockReturnThis(), setHeader: vi.fn(), end: vi.fn() };
	await handler(
		{ method, query: { did, rkey: 'example', kind: 'post', v: '2', ...query } },
		response,
	);
	return response;
}

describe('post attachment previews', () => {
	const fetchImage = vi.fn<typeof fetch>();

	beforeEach(() => {
		fetchImage.mockReset();
		vi.stubGlobal('fetch', fetchImage);
		vi.mocked(getProfile).mockResolvedValue({ did, handle: 'example.test' });
		vi.mocked(ImageResponse).mockImplementation(function () {
			return new Response('rendered card', { headers: { 'Content-Type': 'image/png' } });
		});
	});

	afterEach(() => vi.unstubAllGlobals());

	it('uses the first public, available image in order before a video', async () => {
		mockPost({
			images: [
				{ url: image('bafkreichidden'), contentWarning: true },
				{ url: image('bafkreiunavailable') },
				{ url: image('bafkreifirst') },
				{ url: image('bafkreisecond') },
			],
			video: { thumbnail },
		});
		fetchImage
			.mockResolvedValueOnce(new Response(null, { status: 404 }))
			.mockResolvedValueOnce(imageResponse(webp, 'image/webp'));

		const response = await requestImage();

		expect(fetchImage.mock.calls.map(([url]) => url)).toEqual([
			`https://nagi-api.suibari.com${image('bafkreiunavailable')}`,
			`https://nagi-api.suibari.com${image('bafkreifirst')}`,
		]);
		expect(response.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store');
		expect(response.setHeader).toHaveBeenCalledWith('Content-Type', 'image/webp');
		expect(response.end).toHaveBeenCalledWith(webp);
		expect(getProfile).not.toHaveBeenCalled();
	});

	it('uses a video thumbnail when no image is available and serves HEAD without bytes', async () => {
		mockPost({
			images: [{ url: image('bafkreichidden'), contentWarning: true }],
			video: { thumbnail },
		});
		fetchImage.mockResolvedValueOnce(imageResponse()).mockResolvedValueOnce(imageResponse());

		expect((await requestImage()).end).toHaveBeenCalledWith(jpeg);
		const head = await requestImage({}, 'HEAD');

		expect(fetchImage.mock.calls.map(([url]) => url)).toEqual([thumbnail, thumbnail]);
		expect(head.setHeader).toHaveBeenCalledWith('Content-Type', 'image/jpeg');
		expect(head.end).toHaveBeenCalledWith(undefined);
	});

	it('follows a verified redirect for a legacy video thumbnail', async () => {
		mockPost({ video: { thumbnail: legacyThumbnail } });
		fetchImage
			.mockResolvedValueOnce(
				new Response(null, { status: 302, headers: { Location: cdnThumbnail } }),
			)
			.mockResolvedValueOnce(imageResponse());

		expect((await requestImage()).end).toHaveBeenCalledWith(jpeg);
		expect(fetchImage.mock.calls.map(([url]) => url)).toEqual([legacyThumbnail, cdnThumbnail]);
		expect(fetchImage.mock.calls.every(([, options]) => options?.redirect === 'manual')).toBe(true);
	});

	it.each([
		{ kossori: true },
		{ threadKossori: true },
		{ cwRestricted: true },
		{ contentWarning: { byteStart: 1, byteEnd: 2 } },
		{ selfLabels: ['nudity'] },
		{ moderationLabels: ['unknown'] },
		{ deleted: true },
		{ unavailableReason: 'moderation-policy' },
	])('keeps the existing protected preview for %j', async (flags) => {
		mockPost({ images: [{ url: image('bafkreifirst') }], video: { thumbnail }, ...flags });

		const response = await requestImage();

		expect(fetchImage).not.toHaveBeenCalled();
		if ('kossori' in flags || 'threadKossori' in flags) {
			expect(fallback).toHaveBeenCalledWith(response);
			expect(getProfile).not.toHaveBeenCalled();
		} else {
			const rendered = JSON.stringify(vi.mocked(ImageResponse).mock.calls[0][0]);
			expect(rendered).toContain('Nagiのポスト');
			expect(rendered).not.toContain('Visible post');
		}
	});

	it.each([
		[{}, {}],
		[{ video: { thumbnail, contentWarning: true } }, {}],
		[{ images: [{ url: image('bafkreifirst') }] }, { v: '1' }],
		[{ images: [{ url: image('bafkreifirst') }], article: true }, { kind: 'blog' }],
	])('renders the existing card for %j and query %j', async (fields, query) => {
		mockPost(fields);

		const response = await requestImage(query);

		expect(fetchImage).not.toHaveBeenCalled();
		expect(response.end).toHaveBeenCalledWith(new TextEncoder().encode('rendered card'));
	});

	it('declines disallowed URLs and redirect destinations', async () => {
		mockPost({
			images: [
				{ url: 'https://example.test/api/blob/did:plc:example/bafkreifirst' },
				{ url: '/api/blob/did%3Aplc%3Aexample%2Fbad/bafkreifirst' },
				{ url: image('bafkreisecond') },
			],
			video: { thumbnail: `https://video.bsky.app/watch/${did}/bafkreivideo/playlist.m3u8` },
		});
		fetchImage.mockResolvedValueOnce(
			new Response(null, {
				status: 302,
				headers: { Location: 'https://example.test/image.png' },
			}),
		);

		await requestImage();

		expect(fetchImage.mock.calls.map(([url]) => url)).toEqual([
			`https://nagi-api.suibari.com${image('bafkreisecond')}`,
		]);
		expect(ImageResponse).toHaveBeenCalledOnce();
	});

	it.each([
		[
			'non-image',
			() => new Response('<html>placeholder</html>', { headers: { 'Content-Type': 'text/html' } }),
		],
		[
			'mismatched image type',
			() => new Response('<html>placeholder</html>', { headers: { 'Content-Type': 'image/png' } }),
		],
		[
			'oversized Content-Length',
			() =>
				new Response(null, {
					headers: { 'Content-Type': 'image/jpeg', 'Content-Length': '2000001' },
				}),
		],
		['oversized body without Content-Length', () => imageResponse(new Uint8Array(2_000_001))],
	])('renders the fallback when the upstream sends %s', async (_label, upstream) => {
		mockPost({ images: [{ url: image('bafkreifirst') }] });
		fetchImage.mockResolvedValueOnce(upstream());

		const response = await requestImage();

		expect(response.end).toHaveBeenCalledWith(new TextEncoder().encode('rendered card'));
	});

	it('renders the fallback when the media fetch times out', async () => {
		mockPost({ images: [{ url: image('bafkreifirst') }] });
		fetchImage.mockImplementationOnce(
			(_url, options) =>
				new Promise((_resolve, reject) => {
					options?.signal?.addEventListener('abort', () => reject(options.signal?.reason), {
						once: true,
					});
				}),
		);

		const response = await requestImage();

		expect(response.end).toHaveBeenCalledWith(new TextEncoder().encode('rendered card'));
	});

	it('re-evaluates the post when the same previously public image is requested again', async () => {
		mockPost({ video: { thumbnail } });
		fetchImage.mockResolvedValueOnce(imageResponse());
		expect((await requestImage()).end).toHaveBeenCalledWith(jpeg);

		mockPost({ video: { thumbnail }, threadKossori: true });
		const response = await requestImage();

		expect(fetchImage).toHaveBeenCalledOnce();
		expect(appViewJson).toHaveBeenCalledTimes(2);
		for (const [, cache] of vi.mocked(appViewJson).mock.calls) {
			expect(cache).toBe('no-store');
		}
		expect(fallback).toHaveBeenCalledWith(response);
		expect(response.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store');
	});
});
