import { afterEach, expect, it, vi } from 'vitest';
import { EntryMotion } from './entry-motion.svelte';
afterEach(() => vi.useRealTimers());
it('keeps overlapping arrivals alive and clears them after the final animation', () => {
	vi.useFakeTimers();
	const entry = new EntryMotion();
	entry.mark(['one'], ['first']);
	vi.advanceTimersByTime(400);
	entry.mark([], ['reply']);
	vi.advanceTimersByTime(300);
	expect([...entry.keys]).toEqual(['one']);
	expect([...entry.uris]).toEqual(['first', 'reply']);
	expect(entry.version).toBe(1);
	vi.advanceTimersByTime(400);
	expect(entry.keys.size).toBe(0);
	expect(entry.uris.size).toBe(0);
});
