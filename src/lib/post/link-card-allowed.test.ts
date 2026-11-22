import { beforeEach, describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({ getThread: vi.fn() }));
vi.mock('$lib/api/appview', () => api);

import { linkCardAllowed } from './quote-url';

const ME = 'did:plc:me';
const OTHER = 'did:plc:other';
const BOT = 'did:plc:bot';
const url = (did: string, rkey: string) => `https://nagi.suibari.com/thread/${did}/${rkey}`;
const thread = (did: string, rkey: string, isBot = false) => ({
	thread: {
		post: { uri: `at://${did}/com.suibari.nagi.post/${rkey}`, author: { did }, isBot },
		replies: [],
	},
});

describe('linkCardAllowed', () => {
	beforeEach(() => {
		api.getThread.mockReset();
	});

	it('allows ordinary URLs and own posts without fetching', () => {
		expect(linkCardAllowed('https://example.com/article', ME)).toBe(true);
		expect(linkCardAllowed(url(ME, '3kmine'), ME)).toBe(true);
		expect(api.getThread).not.toHaveBeenCalled();
	});

	it('refuses cards for other people’s posts', async () => {
		api.getThread.mockResolvedValue(thread(OTHER, '3kother'));
		await expect(linkCardAllowed(url(OTHER, '3kother'), ME)).resolves.toBe(false);
	});

	it('allows cards for botたん posts', async () => {
		api.getThread.mockResolvedValue(thread(BOT, '3kbot', true));
		await expect(linkCardAllowed(url(BOT, '3kbot'), ME)).resolves.toBe(true);
	});

	it('remembers the answer', async () => {
		api.getThread.mockResolvedValue(thread(OTHER, '3kcache'));
		await linkCardAllowed(url(OTHER, '3kcache'), ME);
		await linkCardAllowed(url(OTHER, '3kcache'), ME);
		expect(api.getThread).toHaveBeenCalledTimes(1);
	});

	it('retries after a failed lookup and adds no card meanwhile', async () => {
		api.getThread.mockRejectedValueOnce(new Error('down'));
		await expect(linkCardAllowed(url(OTHER, '3kretry'), ME)).resolves.toBe(false);
		api.getThread.mockResolvedValue(thread(OTHER, '3kretry'));
		await linkCardAllowed(url(OTHER, '3kretry'), ME);
		expect(api.getThread).toHaveBeenCalledTimes(2);
	});
});
