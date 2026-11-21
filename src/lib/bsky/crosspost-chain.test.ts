import { describe, expect, it, vi } from 'vitest';

vi.mock('$lib/oauth/session.svelte', async () => {
	const { writable } = await import('svelte/store');
	return { session: writable(undefined) };
});

const { crosspostChainUris } = await import('./agent');

const me = 'did:plc:me';
const node = (id: string, did = me, replies: unknown[] = []) => ({
	post: { uri: `at://${did}/app.bsky.feed.post/${id}`, author: { did } },
	replies,
});
const uri = (id: string) => `at://${me}/app.bsky.feed.post/${id}`;

describe('crosspostChainUris', () => {
	it('follows my own replies from the first copy to the last', () => {
		const thread = node('1', me, [
			node('x', 'did:plc:other', [node('y')]),
			node('2', me, [node('3')]),
		]);
		expect(
			crosspostChainUris(thread, me, { root: { uri: uri('1') }, tail: { uri: uri('3') } }),
		).toEqual([uri('1'), uri('2'), uri('3')]);
	});

	it('falls back to the first and last copy when the chain cannot be traced', () => {
		expect(
			crosspostChainUris(node('1'), me, { root: { uri: uri('1') }, tail: { uri: uri('3') } }),
		).toEqual([uri('1'), uri('3')]);
	});
});
