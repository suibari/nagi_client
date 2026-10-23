import { describe, expect, it } from 'vitest';
import type { NewsPage, NewsView } from '$lib/api/types';
import { pickMyNagiNews, recommendedReason } from './selection';

const news = (id: string, day: number, talkScore?: number) =>
	({
		uri: id,
		createdAt: `2026-09-${String(day).padStart(2, '0')}T00:00:00Z`,
		indexedAt: `2026-09-${String(day).padStart(2, '0')}T00:00:00Z`,
		...(talkScore === undefined ? {} : { talkScore }),
	}) as NewsView;
const page = (items: NewsView[], recommended?: NewsView[]): NewsPage => ({
	items,
	recommended,
	hasMore: false,
});
const view = { isUnread: (item: NewsView) => !item.uri.startsWith('read'), advance: () => {} };

describe('my Nagi news pick', () => {
	it('picks the easiest story to talk about within the recent window', () => {
		expect(
			pickMyNagiNews(page([news('new', 25, 1), news('talk', 24, 4), news('mid', 23, 2)]), view)
				?.uri,
		).toBe('talk');
	});
	it('ignores high-scoring stories older than three days', () => {
		expect(pickMyNagiNews(page([news('new', 25, 1), news('stale', 20, 4)]), view)?.uri).toBe('new');
	});
	it('breaks ties by unread, then recommendation, then newest', () => {
		expect(pickMyNagiNews(page([news('read-new', 25, 3), news('unread', 24, 3)]), view)?.uri).toBe(
			'unread',
		);
		const recommended = { ...news('rec', 23, 3), reason: { genre: '動物' } };
		const selected = pickMyNagiNews(page([news('plain', 24, 3)], [recommended]), view);
		expect(selected?.uri).toBe('rec');
		expect(recommendedReason(selected!)).toBe('動物');
		expect(pickMyNagiNews(page([news('older', 23, 3), news('newer', 24, 3)]), view)?.uri).toBe(
			'newer',
		);
	});
	it('ranks stories approved before scoring last and still works for guests', () => {
		expect(pickMyNagiNews(page([news('legacy', 25), news('scored', 24, 0)]), undefined)?.uri).toBe(
			'scored',
		);
		expect(pickMyNagiNews(page([]), view)).toBeUndefined();
	});
	it('labels a recommended story that also appears among the newest news', () => {
		const labeled = { ...news('r', 24, 4), reason: { genre: '料理' } };
		const selected = pickMyNagiNews(page([news('r', 24, 4)], [labeled]), view);
		expect(recommendedReason(selected!)).toBe('料理');
	});
	it('reads the legacy keyword reason', () => {
		expect(recommendedReason({ ...news('l', 1), reason: { keyword: '料理' } })).toBe('料理');
	});
});
