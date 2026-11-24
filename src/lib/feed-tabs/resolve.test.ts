import { describe, expect, it, vi } from 'vitest';
import type { FeedItem } from '$lib/api/types';
import { resolveFeedTab } from './resolve';

vi.mock('$lib/api/appview', () => ({
	ApiRequestError: class extends Error {},
	getHomeTimeline: vi.fn(),
	getRecommended: vi.fn(),
	getTimeline: vi.fn(),
	searchPosts: vi.fn(),
	searchPostsByQuery: vi.fn(),
}));
vi.mock('$lib/feed/unread.svelte', () => ({
	feedRead: vi.fn(),
	globalFeedRead: {},
	homeFeedRead: {},
	recommendedFeedRead: {},
}));

describe('shared feed optimistic scope', () => {
	for (const kind of ['list', 'global'] as const) {
		for (const did of [undefined, 'did:plc:self']) {
			it(`${kind} (${did ?? 'guest'}) excludes kossori before indexing`, () => {
				const { optimisticFilter } = resolveFeedTab({ id: kind, kind }, { did });
				const item = { isAffirmation: true } as FeedItem;
				expect(optimisticFilter(item)).toBe(true);
				expect(optimisticFilter({ ...item, kossori: true })).toBe(false);
				expect(optimisticFilter({ ...item, threadKossori: true })).toBe(false);
			});
		}
	}
});

describe('recommended tab', () => {
	for (const did of [undefined, 'did:plc:self']) {
		it(`(${did ?? 'guest'}) fetches recommendations and never inserts optimistic posts`, async () => {
			const api = await import('$lib/api/appview');
			const spec = resolveFeedTab(
				{ id: 'recommended', kind: 'custom', source: 'recommended' },
				{ did },
			);
			expect(spec.fetcher).toBe(api.getRecommended);
			expect(spec.key).toBe(`${did ?? 'guest'}:recommended`);
			expect(spec.optimisticFilter({ isAffirmation: true } as FeedItem)).toBe(false);
			expect(spec.showGuestHero).toBe(true);
		});
	}
});
