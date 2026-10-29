import { describe, expect, it } from 'vitest';
import type { NewsPage, NewsView } from '$lib/api/types';
import { pickSidebarNews, recommendedReason } from './selection';

const news = (id: string, hour: number, talkScore?: number) =>
	({
		uri: id,
		createdAt: `2026-09-25T${String(hour).padStart(2, '0')}:00:00Z`,
		indexedAt: `2026-09-25T${String(hour).padStart(2, '0')}:00:00Z`,
		...(talkScore === undefined ? {} : { talkScore }),
	}) as NewsView;
const page = (items: NewsView[], recommended?: NewsView[]): NewsPage => ({
	items,
	recommended,
	hasMore: false,
});
const view = { isUnread: (item: NewsView) => !item.uri.startsWith('read'), advance: () => {} };

describe('sidebar news pick', () => {
	it('picks the easiest story to talk about within the latest slot', () => {
		expect(
			pickSidebarNews(page([news('new', 20, 1), news('talk', 19, 4), news('mid', 18, 2)]), view)
				?.uri,
		).toBe('talk');
	});
	it('ignores high-scoring stories from earlier slots', () => {
		expect(pickSidebarNews(page([news('new', 20, 1), news('stale', 13, 4)]), view)?.uri).toBe(
			'new',
		);
	});
	it('breaks ties by unread, then recommendation, then newest', () => {
		expect(pickSidebarNews(page([news('read-new', 20, 3), news('unread', 19, 3)]), view)?.uri).toBe(
			'unread',
		);
		const recommended = { ...news('rec', 18, 3), reason: { genre: '動物' } };
		const selected = pickSidebarNews(page([news('plain', 19, 3)], [recommended]), view);
		expect(selected?.uri).toBe('rec');
		expect(recommendedReason(selected!)).toBe('動物');
		expect(pickSidebarNews(page([news('older', 18, 3), news('newer', 19, 3)]), view)?.uri).toBe(
			'newer',
		);
	});
	it('ranks stories approved before scoring last and still works for guests', () => {
		expect(pickSidebarNews(page([news('legacy', 20), news('scored', 19, 0)]), undefined)?.uri).toBe(
			'scored',
		);
		expect(pickSidebarNews(page([]), view)).toBeUndefined();
	});
	it('labels a recommended story that also appears among the newest news', () => {
		const labeled = { ...news('r', 19, 4), reason: { genre: '料理' } };
		const selected = pickSidebarNews(page([news('r', 19, 4)], [labeled]), view);
		expect(recommendedReason(selected!)).toBe('料理');
	});
	it('reads the legacy keyword reason', () => {
		expect(recommendedReason({ ...news('l', 1), reason: { keyword: '料理' } })).toBe('料理');
	});
});
