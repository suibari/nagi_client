import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { get, writable } from 'svelte/store';
vi.mock('$lib/api/appview', () => ({ getRadioTrack: vi.fn(), markRadioSeen: vi.fn() }));
vi.mock('$lib/oauth/session.svelte', () => ({
	session: writable<{ did: string } | undefined>(),
	oauthReady: writable(false),
}));
import { getRadioTrack } from '$lib/api/appview';
import { session, oauthReady } from '$lib/oauth/session.svelte';
import { radioUnread, startRadioNotice } from './radio.svelte';

let stop: (() => void) | undefined;
let visible: () => void;
beforeEach(() => {
	vi.useFakeTimers();
	vi.mocked(getRadioTrack).mockReset();
	(session as ReturnType<typeof writable>).set({ did: 'alice' });
	(oauthReady as ReturnType<typeof writable>).set(false);
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

it('fetches at login and visible resume, without periodic polling', async () => {
	vi.mocked(getRadioTrack).mockResolvedValue({ hasUnread: true });
	stop = startRadioNotice();
	expect(getRadioTrack).not.toHaveBeenCalled();
	(oauthReady as ReturnType<typeof writable>).set(true);
	await vi.advanceTimersByTimeAsync(0);
	expect(get(radioUnread)).toBe(1);
	await vi.advanceTimersByTimeAsync(24 * 60 * 60_000);
	expect(getRadioTrack).toHaveBeenCalledTimes(1);
	Object.assign(document, { hidden: true });
	visible();
	expect(getRadioTrack).toHaveBeenCalledTimes(1);
	// 別端末で既読になった状態を復帰時に反映する。
	vi.mocked(getRadioTrack).mockResolvedValue({ hasUnread: false });
	Object.assign(document, { hidden: false });
	visible();
	await vi.advanceTimersByTimeAsync(0);
	expect(getRadioTrack).toHaveBeenCalledTimes(2);
	expect(get(radioUnread)).toBe(0);
	(session as ReturnType<typeof writable>).set(undefined);
	visible();
	expect(getRadioTrack).toHaveBeenCalledTimes(2);
});
