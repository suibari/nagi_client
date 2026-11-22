import { beforeEach, describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({
	getLinkMetadata: vi.fn(),
	getLinkThumbnail: vi.fn(),
}));
vi.mock('$lib/api/appview', () => api);

import { loadQuoteLinkCard, quoteLinkUrl } from './quote-link';

const ORIGIN = 'https://nagi.suibari.com';

describe('quoteLinkUrl', () => {
	it('links a Nagi post to its thread page', () => {
		expect(quoteLinkUrl({ post: { uri: 'at://did:plc:me/com.suibari.nagi.post/3kabc' } })).toBe(
			`${ORIGIN}/thread/did:plc:me/3kabc`,
		);
	});

	it('does not link kossori posts', () => {
		expect(
			quoteLinkUrl({ post: { uri: 'at://did:plc:me/com.suibari.nagi.post/3kabc', kossori: true } }),
		).toBeUndefined();
		expect(
			quoteLinkUrl({
				post: { uri: 'at://did:plc:me/com.suibari.nagi.post/3kabc', threadKossori: true },
			}),
		).toBeUndefined();
	});

	it('links news to the Nagi news page, not the original article', () => {
		expect(quoteLinkUrl({ news: { uri: 'at://did:plc:bot/com.suibari.nagi.news/3knews' } })).toBe(
			`${ORIGIN}/news/3knews`,
		);
	});

	it('links radio to the song page', () => {
		expect(
			quoteLinkUrl({
				radio: {
					slotKey: 'x',
					artist: 'A',
					title: 'T',
					comment: '',
					publishedAt: '2026-11-22T00:00:00.000Z',
					songUrl: 'https://music.example/song',
				},
			}),
		).toBe('https://music.example/song');
	});

	it('returns nothing without a target', () => {
		expect(quoteLinkUrl({})).toBeUndefined();
	});
});

describe('loadQuoteLinkCard', () => {
	const URL_ = `${ORIGIN}/thread/did:plc:me/3kabc`;
	beforeEach(() => {
		api.getLinkMetadata.mockReset();
		api.getLinkThumbnail.mockReset();
	});

	it('uses the metadata and uploads the thumbnail', async () => {
		api.getLinkMetadata.mockResolvedValue({
			uri: URL_,
			title: 'すいばり on Nagi',
			description: '本文',
			image: 'https://img',
		});
		const blob = new Blob(['x'], { type: 'image/png' });
		api.getLinkThumbnail.mockResolvedValue(blob);
		const upload = vi.fn().mockResolvedValue({ ref: 'thumb' });
		await expect(loadQuoteLinkCard(URL_, upload)).resolves.toEqual({
			uri: URL_,
			title: 'すいばり on Nagi',
			description: '本文',
			thumb: { ref: 'thumb' },
		});
		expect(upload).toHaveBeenCalledWith(blob);
	});

	it('falls back to the hostname when metadata fails', async () => {
		api.getLinkMetadata.mockRejectedValue(new Error('down'));
		await expect(loadQuoteLinkCard(URL_, vi.fn())).resolves.toEqual({
			uri: URL_,
			title: 'nagi.suibari.com',
		});
	});

	it('keeps the card when the thumbnail fails', async () => {
		api.getLinkMetadata.mockResolvedValue({ uri: URL_, title: 'T', image: 'https://img' });
		api.getLinkThumbnail.mockRejectedValue(new Error('404'));
		await expect(loadQuoteLinkCard(URL_, vi.fn())).resolves.toEqual({ uri: URL_, title: 'T' });
	});
});
