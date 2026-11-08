import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	loadReactionUsage,
	frequentReactionChoices,
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
	it('keeps a newly used emoji when history is full of frequent emojis', () => {
		const usage: ReactionUsage[] = Array.from({ length: 64 }, (_, index) => ({
			kind: 'unicode',
			emoji: String.fromCodePoint(0x1f600 + index),
			count: 10,
			lastUsedAt: 100 - index,
		}));
		recordReactionUsage(usage, '🎉');
		const saved = loadReactionUsage();
		expect(saved).toHaveLength(64);
		expect(saved[0].emoji).toBe('🎉');
		expect(saved.some((item) => item.emoji === usage[63].emoji)).toBe(false);
		expect(recentReactionChoices(saved, 1)).toEqual([{ kind: 'unicode', emoji: '🎉' }]);
	});

	it('orders recents by last use rather than frequency and excludes favorites', () => {
		const usage: ReactionUsage[] = [
			{ kind: 'unicode', emoji: '😊', count: 100, lastUsedAt: 1 },
			{ kind: 'unicode', emoji: '🎉', count: 1, lastUsedAt: 3 },
			{ kind: 'unicode', emoji: '👍', count: 2, lastUsedAt: 2 },
		];
		expect(recentReactionChoices(usage, 6, [], new Set(['🎉']))).toEqual([
			{ kind: 'unicode', emoji: '👍' },
			{ kind: 'unicode', emoji: '😊' },
		]);
		expect(frequentReactionChoices(usage, 1)).toEqual([{ kind: 'unicode', emoji: '😊' }]);
	});

	it('moves a reused emoji to the front even for selections in the same millisecond', () => {
		const clock = vi.spyOn(Date, 'now').mockReturnValue(1000);
		try {
			let usage = recordReactionUsage([], '😊');
			usage = recordReactionUsage(usage, '🎉');
			usage = recordReactionUsage(usage, '😊');
			expect(recentReactionChoices(usage, 6).map((item) => item.emoji)).toEqual(['😊', '🎉']);
			expect(usage[0].count).toBe(2);
		} finally {
			clock.mockRestore();
		}
	});

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
