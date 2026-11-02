import { describe, expect, it, vi } from 'vitest';
import type { FeedItem } from '$lib/api/types';
import { resolveFeedTab } from './resolve';

vi.mock('$lib/api/appview', () => ({
	ApiRequestError: class extends Error {},
	getAffirmation: vi.fn(),
	getHomeTimeline: vi.fn(),
	getTimeline: vi.fn(),
	searchPosts: vi.fn(),
	searchPostsByQuery: vi.fn(),
}));
vi.mock('$lib/feed/unread.svelte', () => ({
	affirmationFeedRead: {},
	feedRead: vi.fn(),
	globalFeedRead: {},
	homeFeedRead: {},
}));

describe('shared feed optimistic scope', () => {
	for (const kind of ['list', 'global', 'custom'] as const) {
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
