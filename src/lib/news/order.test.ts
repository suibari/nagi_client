import { describe, expect, it } from 'vitest';
import { byNewestFirst } from './order';

const news = (id: string, createdAt: string, indexedAt = createdAt) => ({
	id,
	createdAt,
	indexedAt,
});

describe('byNewestFirst', () => {
	it('sorts relevance-ordered search results newest first', () => {
		const sorted = byNewestFirst([
			news('a', '2026-08-08T09:02:03.187Z'),
			news('b', '2026-09-14T03:15:56.513Z'),
			news('c', '2026-07-22T17:52:21.778Z'),
		]);
		expect(sorted.map((item) => item.id)).toEqual(['b', 'a', 'c']);
	});

	it('keeps the server order inside one botたん batch', () => {
		const batch = '2026-09-15T21:18:43.747Z';
		const sorted = byNewestFirst([
			news('first', batch, '2026-09-15T21:21:52.634Z'),
			news('second', batch, '2026-09-15T21:21:31.415Z'),
			news('third', batch, '2026-09-15T21:21:07.992Z'),
		]);
		expect(sorted.map((item) => item.id)).toEqual(['first', 'second', 'third']);
	});

	it('falls back to indexedAt when createdAt is missing', () => {
		const sorted = byNewestFirst([
			{ id: 'old', createdAt: '', indexedAt: '2026-01-01T00:00:00.000Z' },
			{ id: 'new', createdAt: '', indexedAt: '2026-02-01T00:00:00.000Z' },
		]);
		expect(sorted.map((item) => item.id)).toEqual(['new', 'old']);
	});

	it('does not mutate the input array', () => {
		const input = [news('a', '2026-01-01T00:00:00.000Z'), news('b', '2026-02-01T00:00:00.000Z')];
		byNewestFirst(input);
		expect(input.map((item) => item.id)).toEqual(['a', 'b']);
	});
});
