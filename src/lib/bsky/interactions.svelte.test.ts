import { describe, expect, it, vi } from 'vitest';
import type { AppBskyFeedDefs } from '@atproto/api';
import { BskyInteractions, type BskyInteractionWriter } from './interactions.svelte';
import { toPostCard } from './mapView';

function card(viewer: AppBskyFeedDefs.PostView['viewer'] = {}) {
	return toPostCard({
		uri: 'at://did:plc:alice/app.bsky.feed.post/1',
		cid: 'cid1',
		author: { did: 'did:plc:alice', handle: 'alice.test' },
		record: { $type: 'app.bsky.feed.post', text: 'hi', createdAt: '2026-11-21T00:00:00.000Z' },
		indexedAt: '2026-11-21T00:00:00.000Z',
		viewer,
	});
}

function deferred<T>() {
	let resolve!: (value: T) => void;
	let reject!: (error: unknown) => void;
	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
}

function setup(writer: Partial<BskyInteractionWriter> = {}) {
	const full: BskyInteractionWriter = {
		create: vi.fn(async (kind) => `at://did:plc:me/app.bsky.feed.${kind}/new`),
		remove: vi.fn(async () => {}),
		...writer,
	};
	const store = new BskyInteractions(full);
	store.setOwner('did:plc:me');
	return { store, writer: full };
}

describe('BskyInteractions', () => {
	it('shows the like immediately and keeps the created record for undoing', async () => {
		const pending = deferred<string>();
		const { store, writer } = setup({ create: vi.fn(() => pending.promise) });
		const post = card();
		const done = store.toggle('like', post);
		expect(store.active('like', post)).toBe(true);
		expect(store.busy('like', post)).toBe(true);
		pending.resolve('at://did:plc:me/app.bsky.feed.like/abc');
		await done;
		expect(writer.create).toHaveBeenCalledWith('like', { uri: post.uri, cid: 'cid1' });
		await store.toggle('like', post);
		expect(writer.remove).toHaveBeenCalledWith('like', 'at://did:plc:me/app.bsky.feed.like/abc');
		expect(store.active('like', post)).toBe(false);
	});

	it('ignores a second press while the first is in flight', async () => {
		const pending = deferred<string>();
		const { store, writer } = setup({ create: vi.fn(() => pending.promise) });
		const post = card();
		const first = store.toggle('repost', post);
		await store.toggle('repost', post);
		pending.resolve('at://did:plc:me/app.bsky.feed.repost/1');
		await first;
		expect(writer.create).toHaveBeenCalledTimes(1);
		expect(store.active('repost', post)).toBe(true);
	});

	it('restores the previous state when undoing fails', async () => {
		const { store } = setup({ remove: vi.fn(async () => Promise.reject(new Error('offline'))) });
		const post = card({ like: 'at://did:plc:me/app.bsky.feed.like/old' });
		expect(store.active('like', post)).toBe(true);
		await expect(store.toggle('like', post)).rejects.toThrow('offline');
		expect(store.active('like', post)).toBe(true);
		expect(store.busy('like', post)).toBe(false);
	});

	it('shares the state between cards of the same post', async () => {
		const { store } = setup();
		const first = card();
		const second = card();
		await store.toggle('like', first);
		expect(store.active('like', second)).toBe(true);
	});

	it('keeps what I pressed even if a stale view comes back', async () => {
		const { store } = setup();
		await store.toggle('like', card({ like: 'at://did:plc:me/app.bsky.feed.like/old' }));
		expect(store.active('like', card({ like: 'at://did:plc:me/app.bsky.feed.like/old' }))).toBe(
			false,
		);
	});

	it('forgets the previous account', async () => {
		const { store } = setup();
		const post = card();
		await store.toggle('like', post);
		store.setOwner('did:plc:other');
		expect(store.active('like', post)).toBe(false);
	});
});
