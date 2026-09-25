import { describe, expect, it } from 'vitest';
import type { NewsPage, NewsView } from '$lib/api/types';
import { recommendedReason, selectMyNagiNews } from './selection';

const news = (id: string, day: number) =>
	({
		uri: id,
		createdAt: `2026-09-${String(day).padStart(2, '0')}T00:00:00Z`,
		indexedAt: `2026-09-${String(day).padStart(2, '0')}T00:00:00Z`,
	}) as NewsView;
const page = (items: NewsView[], recommended?: NewsView[]): NewsPage => ({
	items,
	recommended,
	hasMore: false,
});
const view = { isUnread: (item: NewsView) => item.uri !== 'read', advance: () => {} };
const ids = (items: NewsView[]) => items.map((item) => item.uri);

describe('my Nagi news', () => {
	it('prioritizes unread recommendations, then fills with newest news without duplicates', () => {
		const recent = news('recent', 24);
		expect(
			ids(
				selectMyNagiNews(
					page(
						[news('new', 25), recent, news('filler', 22)],
						[news('old', 1), news('read', 26), recent],
					),
					view,
					4,
				),
			),
		).toEqual(['recent', 'old', 'new', 'filler']);
	});
	it('fills all five slots with recommendations when enough are unread', () => {
		const recommendations = Array.from({ length: 7 }, (_, i) => news(`r${i}`, i + 1));
		expect(ids(selectMyNagiNews(page([news('new', 24)], recommendations), view, 5))).toEqual([
			'r6',
			'r5',
			'r4',
			'r3',
			'r2',
		]);
	});
	it('falls back to new items for guests, absent recommendations, and all-read recommendations', () => {
		const items = [news('older', 20), news('newer', 24)];
		for (const [recommendations, unread] of [
			[undefined, view],
			[[news('read', 25)], view],
			[[news('r', 26)], undefined],
		] as const) {
			expect(
				ids(
					selectMyNagiNews(
						page(items, recommendations ? [...recommendations] : undefined),
						unread,
						5,
					),
				),
			).toEqual(['newer', 'older']);
		}
	});
	it('labels only unread recommendations', () => {
		const labeled = { ...news('r', 20), reason: { genre: '動物' } };
		const readLabeled = { ...news('read', 21), reason: { genre: '料理' } };
		const selected = selectMyNagiNews(
			page([news('read', 21), news('new', 24)], [labeled, readLabeled]),
			view,
			5,
		);
		expect(ids(selected)).toEqual(['r', 'new', 'read']);
		expect(selected.map(recommendedReason)).toEqual(['動物', undefined, undefined]);
	});
	it('reads the legacy keyword reason', () => {
		expect(recommendedReason({ ...news('l', 1), reason: { keyword: '料理' } })).toBe('料理');
	});
});
