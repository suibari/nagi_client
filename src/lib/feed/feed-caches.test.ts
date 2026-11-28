import { writable } from 'svelte/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FeedTabSpec } from '$lib/feed-tabs/resolve';

vi.mock('$lib/api/appview', () => ({ getMutes: vi.fn(), setMute: vi.fn() }));
vi.mock('$lib/oauth/session.svelte', () => ({
	session: writable<{ did: string } | undefined>({ did: 'did:plc:viewer' }),
}));
vi.mock('./feed.svelte', () => ({
	Feed: class {
		load = vi.fn();
	},
}));

const { setMute } = await import('$lib/api/appview');
const { mutes } = await import('$lib/mute/mutes.svelte');
const { nagiFeedFor, nagiFeeds } = await import('./feed-caches');

const spec = (key: string) => ({ key, fetcher: vi.fn() }) as unknown as FeedTabSpec;

describe('nagiFeedFor', () => {
	beforeEach(() => {
		nagiFeeds.clear();
		vi.mocked(setMute).mockReset();
	});

	it('reuses the cached feed while mutes are unchanged', () => {
		expect(nagiFeedFor(spec('global'))).toBe(nagiFeedFor(spec('global')));
	});

	it('drops every cached feed after a mute is saved', async () => {
		const before = nagiFeedFor(spec('global'));
		nagiFeedFor(spec('home'));
		vi.mocked(setMute).mockResolvedValue({ muted: true } as never);
		await mutes.toggleTag('noise', true);

		const after = nagiFeedFor(spec('global'));
		expect(after).not.toBe(before);
		expect(after.load).toHaveBeenCalled();
		expect(nagiFeeds.peek('home')).toBeUndefined();
	});

	it('keeps cached feeds when saving a mute fails', async () => {
		const before = nagiFeedFor(spec('global'));
		vi.mocked(setMute).mockRejectedValue(new Error('down'));
		await expect(mutes.toggleTag('other', true)).rejects.toThrow('down');

		expect(nagiFeedFor(spec('global'))).toBe(before);
	});
});
