import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PreferencesView } from '$lib/api/types';

vi.mock('$lib/oauth/session.svelte', async () => {
	const { writable } = await import('svelte/store');
	return { session: writable<{ did: string } | null>(null) };
});
vi.mock('$lib/api/appview', () => ({
	getPreferences: vi.fn(),
	putPreferences: vi.fn(),
	ApiRequestError: class extends Error {
		constructor(
			public status: number,
			public code: string | undefined,
			message: string,
		) {
			super(message);
		}
	},
}));
vi.mock('$lib/chronicle/notice', () => ({ clearChronicleReadState: vi.fn() }));
vi.mock('$lib/chronicle/read-state', () => ({
	chronicleStorageKey: vi.fn(),
	chronicleRevisionsKey: vi.fn(),
	chronicleYearsKey: vi.fn(),
}));
vi.mock('$lib/moderation/age.svelte', () => ({
	applyAgeAssurance: vi.fn(),
	clearAgeAssurance: vi.fn(),
}));
vi.mock('$lib/moderation/preferences.svelte', () => ({
	adoptModerationPreferences: vi.fn(),
	loadStoredModerationPreferences: vi.fn(),
	moderationPreferencesStorageKey: vi.fn(),
	setModerationPreferencesScope: vi.fn(),
	subscribeModerationPreferencesChanged: vi.fn(),
}));
vi.mock('$lib/feed-tabs/feed-tabs.svelte', () => ({
	adoptFeedTabs: vi.fn(),
	feedTabs: { adopt: vi.fn() },
	feedTabsStorageKey: vi.fn(),
	loadStoredFeedTabs: vi.fn(),
	setFeedTabsScope: vi.fn(),
}));
vi.mock('$lib/my-nagi/unread.svelte', () => ({ myNagiStorageKey: vi.fn() }));
vi.mock('$lib/news/unread.svelte', () => ({ newsStorageKey: vi.fn() }));
vi.mock('$lib/i18n/languagePreferences.svelte', () => ({
	adoptLanguagePreferences: vi.fn(),
	hasLegacyLanguagePreferences: () => false,
	languagePreferencesSnapshot: vi.fn(),
	languagePreferencesStorageKey: vi.fn(),
	loadStoredLanguagePreferences: vi.fn(),
	setLanguagePreferencesScope: vi.fn(),
	subscribeLanguagePreferencesChanged: vi.fn(),
}));
vi.mock('$lib/unread/sections.svelte', () => ({
	clearSections: vi.fn(),
	reconcileSections: vi.fn(),
	sectionWatermark: vi.fn(),
}));
vi.mock('$lib/emoji/reactionUsage', () => ({
	reactionChoiceKey: (choice: { emoji: string }) => choice.emoji,
	validChoice: () => true,
	refreshReactionChoices: vi.fn(),
}));

import { session } from '$lib/oauth/session.svelte';
import { ApiRequestError, getPreferences } from '$lib/api/appview';
import { favoritesStorageKey, loadFavorites } from '$lib/emoji/favorites';
import { preferences } from './preferences.svelte';
import { retryPreferences, syncPreferences } from './sync.svelte';

const did = 'did:plc:alice';
const choices = [{ kind: 'unicode' as const, emoji: '😂' }];
const view = (): PreferencesView => ({
	readPositions: [],
	emojiFavorites: choices,
	emojiFavoritesUpdatedAt: '2026-10-20T00:00:00.000Z',
	feedTabs: [],
	chronicleReadYears: [],
});
let storage: Map<string, string>;
beforeEach(async () => {
	vi.useFakeTimers();
	session.set(null);
	await syncPreferences(undefined);
	vi.clearAllMocks();
	storage = new Map();
	vi.stubGlobal('localStorage', {
		getItem: (key: string) => storage.get(key) ?? null,
		setItem: (key: string, value: string) => storage.set(key, value),
	});
	session.set({ did } as never);
});
afterEach(async () => {
	session.set(null);
	await syncPreferences(undefined);
	vi.useRealTimers();
	vi.unstubAllGlobals();
});

describe('favorite preference recovery', () => {
	it('reads the account cache before the request finishes, and retains it after 429', async () => {
		storage.set(
			favoritesStorageKey(did),
			JSON.stringify({ choices, updatedAt: '2026-10-19T00:00:00.000Z' }),
		);
		let reject!: (reason: Error) => void;
		vi.mocked(getPreferences).mockImplementationOnce(
			() =>
				new Promise((_, fail) => {
					reject = fail;
				}),
		);
		const pending = syncPreferences(did);
		expect(loadFavorites()).toEqual(choices);
		expect(preferences.loading).toBe(true);
		reject(new ApiRequestError(429, undefined, 'Too many requests'));
		await pending;
		expect(loadFavorites()).toEqual(choices);
		expect(preferences.synced).toBe(false);
		expect(preferences.loadFailed).toBe(true);
		expect(preferences.retryable).toBe(true);
	});
	it('backs off after transient failures and adopts favorites when the server recovers', async () => {
		vi.mocked(getPreferences)
			.mockRejectedValueOnce(new ApiRequestError(429, undefined, 'limit'))
			.mockRejectedValueOnce(new TypeError('Failed to fetch'))
			.mockRejectedValueOnce(new ApiRequestError(503, undefined, 'unavailable'))
			.mockResolvedValue(view());
		await syncPreferences(did);
		await vi.advanceTimersByTimeAsync(4_999);
		expect(getPreferences).toHaveBeenCalledTimes(1);
		await vi.advanceTimersByTimeAsync(1);
		expect(getPreferences).toHaveBeenCalledTimes(2);
		await vi.advanceTimersByTimeAsync(15_000);
		expect(getPreferences).toHaveBeenCalledTimes(3);
		await vi.advanceTimersByTimeAsync(60_000);
		expect(getPreferences).toHaveBeenCalledTimes(4);
		expect(preferences.synced).toBe(true);
		expect(preferences.loadFailed).toBe(false);
		expect(loadFavorites()).toEqual(choices);
	});
	it('does not automatically retry denied permissions; allows a manual retry', async () => {
		vi.mocked(getPreferences)
			.mockRejectedValueOnce(new ApiRequestError(403, undefined, 'denied'))
			.mockResolvedValue(view());
		await syncPreferences(did);
		expect(preferences.unauthorized).toBe(true);
		await vi.advanceTimersByTimeAsync(120_000);
		expect(getPreferences).toHaveBeenCalledTimes(1);
		await retryPreferences();
		expect(preferences.synced).toBe(true);
		expect(preferences.unauthorized).toBe(false);
	});
	it('cancels scheduled retries on logout', async () => {
		vi.mocked(getPreferences).mockRejectedValue(new TypeError('offline'));
		await syncPreferences(did);
		session.set(null);
		await syncPreferences(undefined);
		await vi.advanceTimersByTimeAsync(120_000);
		expect(getPreferences).toHaveBeenCalledTimes(1);
		expect(preferences.loadFailed).toBe(false);
	});
	it('does not apply an old account response after switching accounts', async () => {
		let resolve!: (value: PreferencesView) => void;
		vi.mocked(getPreferences)
			.mockImplementationOnce(
				() =>
					new Promise((done) => {
						resolve = done;
					}),
			)
			.mockResolvedValue({ ...view(), emojiFavorites: [] });
		const old = syncPreferences(did);
		session.set({ did: 'did:plc:bob' } as never);
		await syncPreferences('did:plc:bob');
		resolve(view());
		await old;
		expect(storage.has(favoritesStorageKey(did))).toBe(false);
		expect(loadFavorites()).toEqual([]);
	});
});
