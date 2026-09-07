import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { markPostSeen, resetSeenPostsForTests } from '$lib/post/seen';
import { myNagiStorageKey, openMyNagiUnreadView, readPositions } from './unread.svelte';

const values = new Map<string, string>();

beforeEach(() => {
	values.clear();
	Object.defineProperty(globalThis, 'window', { configurable: true, value: globalThis });
	Object.defineProperty(globalThis, 'localStorage', {
		configurable: true,
		value: {
			getItem: (key: string) => values.get(key) ?? null,
			setItem: (key: string, value: string) => values.set(key, value),
		},
	});
	resetSeenPostsForTests();
});

afterEach(() => {
	resetSeenPostsForTests();
	delete (globalThis as { localStorage?: Storage }).localStorage;
	delete (globalThis as { window?: Window }).window;
});

describe('my Nagi unread view', () => {
	it('suppresses only posts already seen elsewhere and retains other unread posts', () => {
		const viewerDid = 'did:plc:unread-viewer';
		const seenUri = 'at://did:plc:author/com.suibari.nagi.post/seen';
		const unseenUri = 'at://did:plc:author/com.suibari.nagi.post/unseen';
		values.set(
			myNagiStorageKey('list', viewerDid),
			JSON.stringify({
				initialized: true,
				seen: { indexedAt: '2026-09-07T00:00:00.000Z', uri: 'at://old' },
			}),
		);
		markPostSeen(seenUri, viewerDid);
		const view = openMyNagiUnreadView('list', viewerDid);

		expect(view.isUnread({ indexedAt: '2026-09-07T01:00:00.000Z', uri: seenUri })).toBe(false);
		expect(
			readPositions(view, [
				{ indexedAt: '2026-09-07T01:00:00.000Z', uri: seenUri },
				{ indexedAt: '2026-09-07T00:30:00.000Z', uri: unseenUri },
			]),
		).toBe(true);
	});
});
