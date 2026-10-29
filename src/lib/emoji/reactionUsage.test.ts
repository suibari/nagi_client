import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	loadReactionUsage,
	recentReactionChoices,
	recordReactionUsage,
	refreshReactionUsage,
	type ReactionUsage,
} from './reactionUsage';

beforeEach(() => {
	const storage = new Map<string, string>();
	vi.stubGlobal('localStorage', {
		getItem: (key: string) => storage.get(key) ?? null,
		setItem: (key: string, value: string) => storage.set(key, value),
		removeItem: (key: string) => storage.delete(key),
	});
});

describe('reaction history', () => {
	it('fills recents after excluding twenty favorites', () => {
		const usage: ReactionUsage[] = Array.from({ length: 28 }, (_, index) => ({
			kind: 'unicode',
			emoji: String.fromCodePoint(0x1f600 + index),
			count: 1,
			lastUsedAt: 100 - index,
		}));
		const favorites = new Set(usage.slice(0, 20).map((item) => item.emoji as string));
		expect(recentReactionChoices(usage, 6, [], favorites).map((item) => item.emoji)).toEqual(
			usage.slice(20, 26).map((item) => item.emoji),
		);
	});

	it('preserves selections made while history validation is pending', async () => {
		const usage = recordReactionUsage([], '😊');
		const pending = refreshReactionUsage(usage);
		recordReactionUsage(loadReactionUsage(), '🎉');
		recordReactionUsage(loadReactionUsage(), '😊');
		await pending;
		const saved = loadReactionUsage();
		expect(saved.find((item) => item.emoji === '🎉')?.count).toBe(1);
		expect(saved.find((item) => item.emoji === '😊')?.count).toBe(2);
	});
});
