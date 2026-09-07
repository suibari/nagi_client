import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { hasSeenPost, markPostSeen, resetSeenPostsForTests } from './seen';

const values = new Map<string, string>();

beforeEach(() => {
	values.clear();
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
});

describe('seen posts', () => {
	it('keeps exact post URIs separate from unrelated posts', () => {
		markPostSeen('at://did:plc:alice/com.suibari.nagi.post/one', 'did:plc:viewer');

		expect(hasSeenPost('at://did:plc:alice/com.suibari.nagi.post/one', 'did:plc:viewer')).toBe(
			true,
		);
		expect(hasSeenPost('at://did:plc:alice/com.suibari.nagi.post/two', 'did:plc:viewer')).toBe(
			false,
		);
	});

	it('does not share viewing history between accounts', () => {
		const uri = 'at://did:plc:alice/com.suibari.nagi.post/one';
		markPostSeen(uri, 'did:plc:viewer-a');

		expect(hasSeenPost(uri, 'did:plc:viewer-a')).toBe(true);
		expect(hasSeenPost(uri, 'did:plc:viewer-b')).toBe(false);
	});

	it('restores viewing history from localStorage', () => {
		const uri = 'at://did:plc:alice/com.suibari.nagi.post/one';
		markPostSeen(uri, 'did:plc:viewer');
		resetSeenPostsForTests();

		expect(hasSeenPost(uri, 'did:plc:viewer')).toBe(true);
	});
});
