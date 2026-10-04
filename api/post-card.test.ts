import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@vercel/og', () => ({ ImageResponse: vi.fn() }));
vi.mock('./_ogp.js', async (importOriginal) => ({
	...(await importOriginal<typeof import('./_ogp.js')>()),
	appViewJson: vi.fn(),
	getProfile: vi.fn(),
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
