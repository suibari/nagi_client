import { writable } from 'svelte/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IndexableBlog } from '$lib/api/types';

const session = writable<{ did: string } | undefined>(undefined);
vi.mock('$lib/oauth/session.svelte', () => ({ session }));
vi.mock('$lib/api/appview', () => ({
	getMutes: vi.fn(),
	setMute: vi.fn(),
	listIndexableBlogs: vi.fn(),
}));
vi.mock('$lib/atproto/pds', () => ({ getRecord: vi.fn().mockResolvedValue(null) }));

const { listIndexableBlogs, setMute } = await import('$lib/api/appview');
const { mutes } = await import('$lib/mute/mutes.svelte');
const { fetchBlogDirectory, visibleBlogItems } = await import('./directory');

const blog = (did: string, rkey: string): IndexableBlog => ({
	uri: `at://${did}/com.suibari.nagi.post/${rkey}`,
	text: `# ${rkey}`,
	indexedAt: '2026-11-28T00:00:00.000Z',
	createdAt: '2026-11-28T00:00:00.000Z',
	author: { did, handle: `${rkey}.test` },
	reactions: [],
});
const page = (items: IndexableBlog[]) => ({ items, hasMore: false });

describe('fetchBlogDirectory', () => {
	beforeEach(() => {
		vi.mocked(listIndexableBlogs).mockReset();
		vi.mocked(setMute)
			.mockReset()
			.mockResolvedValue({ muted: true } as never);
		mutes.clear();
		session.set(undefined);
	});

	it('uses the viewer list while signed in and shows it as is', async () => {
		session.set({ did: 'did:plc:viewer' });
		vi.mocked(listIndexableBlogs).mockResolvedValue(page([blog('did:plc:ok', 'a')]));
		const directory = await fetchBlogDirectory({ refresh: true });
		expect(listIndexableBlogs).toHaveBeenCalledWith(undefined, 'required');
		expect(directory.mutesVersion).toBe(mutes.version);
		expect(visibleBlogItems(directory).map((item) => item.uri)).toHaveLength(1);
	});

	it('falls back to the public list and hides muted authors provisionally', async () => {
		session.set({ did: 'did:plc:viewer' });
		mutes.actors = [{ did: 'did:plc:muted', handle: 'muted.test' }];
		vi.mocked(listIndexableBlogs).mockImplementation(async (_cursor, auth) => {
			if (auth === 'required') throw new Error('forbidden');
			return page([blog('did:plc:muted', 'a'), blog('did:plc:ok', 'b')]);
		});
		const directory = await fetchBlogDirectory({ refresh: true });
		expect(directory.mutesVersion).toBeUndefined();
		expect(visibleBlogItems(directory).map((item) => item.author.did)).toEqual(['did:plc:ok']);
	});

	it('refetches after a mute is saved and hides in the meantime', async () => {
		session.set({ did: 'did:plc:viewer' });
		vi.mocked(listIndexableBlogs).mockResolvedValue(
			page([blog('did:plc:muted', 'a'), blog('did:plc:ok', 'b')]),
		);
		const before = await fetchBlogDirectory({ refresh: true });
		await mutes.toggleActor({ did: 'did:plc:muted', handle: 'muted.test' }, true);

		expect(visibleBlogItems(before).map((item) => item.author.did)).toEqual(['did:plc:ok']);
		const after = await fetchBlogDirectory();
		expect(after).not.toBe(before);
		expect(after.mutesVersion).toBe(mutes.version);
	});
});
