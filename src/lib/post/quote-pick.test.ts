import { beforeEach, describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({ getThread: vi.fn() }));
vi.mock('$lib/api/appview', () => api);

import { QuotePick } from './quote-pick.svelte';

const ME = 'did:plc:me';
const OTHER = 'did:plc:other';
const url = (did: string, rkey: string) => `https://nagi.suibari.com/thread/${did}/${rkey}`;
const thread = (did: string, rkey: string) => ({
	thread: {
		post: { uri: `at://${did}/com.suibari.nagi.post/${rkey}`, cid: 'cid', author: { did } },
		replies: [],
	},
});
const paste = (text: string) => {
	const event = {
		clipboardData: { getData: () => text },
		preventDefault: vi.fn(),
	} as unknown as ClipboardEvent;
	return event;
};
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('QuotePick.handlePaste', () => {
	beforeEach(() => {
		api.getThread.mockReset();
	});

	it('quotes own posts', async () => {
		api.getThread.mockResolvedValue(thread(ME, '3kmine'));
		const pick = new QuotePick();
		const insert = vi.fn();
		pick.handlePaste(paste(url(ME, '3kmine')), ME, insert);
		await settle();
		expect(pick.post?.uri).toBe(`at://${ME}/com.suibari.nagi.post/3kmine`);
		expect(insert).not.toHaveBeenCalled();
	});

	it('puts other people’s URLs back into the text without an error', async () => {
		api.getThread.mockResolvedValue(thread(OTHER, '3kother'));
		const pick = new QuotePick();
		const insert = vi.fn();
		pick.handlePaste(paste(`  ${url(OTHER, '3kother')}\n`), ME, insert);
		await settle();
		expect(insert).toHaveBeenCalledWith(url(OTHER, '3kother'));
		expect(pick.post).toBeUndefined();
		expect(pick.error).toBe('');
		expect(pick.pending).toBe(false);
	});

	it('keeps the URL out of the text when the post is missing', async () => {
		api.getThread.mockImplementation(() => Promise.reject(new Error('404')));
		const pick = new QuotePick();
		const insert = vi.fn();
		pick.handlePaste(paste(url(OTHER, '3kgone')), ME, insert);
		await settle();
		expect(insert).not.toHaveBeenCalled();
		expect(pick.error).not.toBe('');
	});
});
