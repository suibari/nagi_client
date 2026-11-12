import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PostAssets, PostDraft } from '$lib/atproto/records';

const calls = vi.hoisted(() => ({
	created: [] as Array<Record<string, unknown>>,
	deleted: [] as string[],
	failAt: -1,
	missing: new Set<string>(),
}));

vi.mock('@atproto/api', () => ({
	Agent: class {
		com = {
			atproto: {
				repo: {
					createRecord: async ({ record }: { record: Record<string, unknown> }) => {
						if (calls.created.length === calls.failAt) throw new Error('PDS down');
						calls.created.push(record);
						const n = calls.created.length;
						return { data: { uri: `at://did:plc:me/app.bsky.feed.post/p${n}`, cid: `c${n}` } };
					},
					deleteRecord: async ({ rkey }: { rkey: string }) => {
						calls.deleted.push(rkey);
					},
					getRecord: async ({ rkey }: { rkey: string }) => {
						if (calls.missing.has(rkey))
							throw Object.assign(new Error('Could not locate record'), {
								error: 'RecordNotFound',
							});
						return { data: {} };
					},
				},
			},
		};
	},
}));
vi.mock('$lib/oauth/session.svelte', async () => {
	const { writable } = await import('svelte/store');
	return { session: writable({ did: 'did:plc:me' }) };
});

const { blueskyPostsExist, crosspostToBluesky, CrosspostPartialError } = await import('./bluesky');

const draft = (text: string): PostDraft => ({
	text,
	facets: [],
	langs: ['ja'],
	createdAt: '2026-11-05T00:00:00.000Z',
	attachments: [],
	linkCards: [],
});
const assets = (): PostAssets => ({ images: [], cards: [] });
const ref = (rkey: string) => ({ uri: `at://did:plc:me/app.bsky.feed.post/${rkey}`, cid: rkey });

beforeEach(() => {
	calls.created = [];
	calls.deleted = [];
	calls.failAt = -1;
	calls.missing = new Set();
});

describe('crosspostToBluesky with a target', () => {
	it('replies to the copy and keeps the Bluesky thread root for every chunk', async () => {
		const result = await crosspostToBluesky(draft('あ'.repeat(450)), assets(), {
			reply: { root: ref('root'), parent: ref('tail') },
		});
		expect(calls.created).toHaveLength(2);
		expect(calls.created[0].reply).toEqual({ root: ref('root'), parent: ref('tail') });
		expect(calls.created[1].reply).toEqual({
			root: ref('root'),
			parent: { uri: 'at://did:plc:me/app.bsky.feed.post/p1', cid: 'c1' },
		});
		expect(result?.ref.threadRoot).toEqual(ref('root'));
		expect(result?.ref.tail.uri).toBe('at://did:plc:me/app.bsky.feed.post/p2');
	});

	it('quotes the copy, wrapping media in recordWithMedia', async () => {
		await crosspostToBluesky(draft('引用'), assets(), { quote: ref('q') });
		expect(calls.created[0].embed).toEqual({ $type: 'app.bsky.embed.record', record: ref('q') });
		await crosspostToBluesky(
			draft('画像つき'),
			{
				images: [{ image: { ref: 'blob' }, alt: '', aspectRatio: { width: 1, height: 1 } }],
				cards: [],
			},
			{ quote: ref('q') },
		);
		expect(calls.created[1].embed).toMatchObject({
			$type: 'app.bsky.embed.recordWithMedia',
			record: { $type: 'app.bsky.embed.record', record: ref('q') },
			media: { $type: 'app.bsky.embed.images' },
		});
	});

	it('top-level posts start their own thread', async () => {
		const result = await crosspostToBluesky(draft('ひとこと'), assets());
		expect(calls.created[0].reply).toBeUndefined();
		expect(result?.ref.root).toEqual(result?.ref.threadRoot);
	});

	it('keeps what it created and reports a partial copy when a later chunk fails', async () => {
		calls.failAt = 1;
		const error = await crosspostToBluesky(draft('あ'.repeat(450)), assets()).catch((e) => e);
		expect(error).toBeInstanceOf(CrosspostPartialError);
		expect(error.posts).toEqual([{ uri: 'at://did:plc:me/app.bsky.feed.post/p1', cid: 'c1' }]);
		expect((error.cause as Error).message).toBe('PDS down');
		expect(calls.deleted).toEqual([]);
	});

	it('rethrows the original error when nothing was created', async () => {
		calls.failAt = 0;
		const error = await crosspostToBluesky(draft('ひとこと'), assets()).catch((e) => e);
		expect(error).not.toBeInstanceOf(CrosspostPartialError);
		expect((error as Error).message).toBe('PDS down');
		expect(calls.deleted).toEqual([]);
	});
});

describe('blueskyPostsExist', () => {
	it('reports a deleted copy instead of throwing', async () => {
		expect(await blueskyPostsExist([ref('a'), ref('b')])).toBe(true);
		calls.missing.add('b');
		expect(await blueskyPostsExist([ref('a'), ref('b')])).toBe(false);
	});
});
