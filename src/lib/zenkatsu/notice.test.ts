import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { get, writable } from 'svelte/store';
vi.mock('$lib/api/appview', () => ({ getZenkatsu: vi.fn() }));
vi.mock('$lib/oauth/session.svelte', () => ({ session: writable<{ did: string } | undefined>() }));
import { getZenkatsu } from '$lib/api/appview';
import { session } from '$lib/oauth/session.svelte';
import type { ZenkatsuFeed } from '$lib/api/types';
import { markZenkatsuPlayed, playDay, startZenkatsuNotice, unplayedToday } from './notice';

let stop: (() => void) | undefined;
let visible: () => void;
const feed = (submitted: boolean) =>
	({ theme: { themeDate: playDay() }, viewer: { submitted } }) as ZenkatsuFeed;
beforeEach(() => {
	vi.useFakeTimers();
	vi.setSystemTime(new Date('2026-09-18T18:59:59Z'));
	vi.mocked(getZenkatsu).mockReset();
	(session as ReturnType<typeof writable>).set({ did: 'alice' });
	vi.stubGlobal('document', {
		hidden: false,
		addEventListener: vi.fn((_: string, fn: () => void) => {
			visible = fn;
		}),
		removeEventListener: vi.fn(),
	});
});
afterEach(() => {
	stop?.();
	vi.useRealTimers();
	vi.unstubAllGlobals();
});

describe('playDay', () => {
	it('switches at 4 AM in Japan', () => {
		expect(playDay(Date.parse('2026-09-18T18:59:59Z'))).toBe('2026-09-18');
		expect(playDay(Date.parse('2026-09-18T19:00:00Z'))).toBe('2026-09-19');
	});
});

it('reflects another device’s submission on resume and resets the day only on refresh', async () => {
	vi.mocked(getZenkatsu).mockImplementation(async () => feed(false));
	stop = startZenkatsuNotice();
	await vi.advanceTimersByTimeAsync(0);
	expect(get(unplayedToday)).toBe(1);
	vi.mocked(getZenkatsu).mockImplementation(async () => feed(true));
	Object.assign(document, { hidden: true });
	visible();
	expect(getZenkatsu).toHaveBeenCalledTimes(1);
	Object.assign(document, { hidden: false });
	visible();
	await vi.advanceTimersByTimeAsync(0);
	expect(get(unplayedToday)).toBe(0);
	markZenkatsuPlayed(playDay());
	await vi.advanceTimersByTimeAsync(60 * 60_000);
	expect(getZenkatsu).toHaveBeenCalledTimes(2);
	vi.mocked(getZenkatsu).mockImplementation(async () => feed(false));
	visible();
	await vi.advanceTimersByTimeAsync(0);
	expect(get(unplayedToday)).toBe(1);
});
