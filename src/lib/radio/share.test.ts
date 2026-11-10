import { beforeEach, expect, it, vi } from 'vitest';
import { writable } from 'svelte/store';
vi.mock('$lib/oauth/session.svelte', () => ({
	session: writable<{ did: string } | undefined>({ did: 'did:plc:alice' }),
}));
vi.mock('$lib/optin/scope-optin', () => ({ sessionCovers: vi.fn() }));
vi.mock('$lib/post/composer-host.svelte', () => ({
	composerHost: { openQuoteRadio: vi.fn() },
}));
import type { RadioTrack } from '$lib/api/types';
import { RADIO_COLLECTION_SCOPE } from '$lib/oauth/client';
import { sessionCovers } from '$lib/optin/scope-optin';
import { composerHost } from '$lib/post/composer-host.svelte';
import { hasRadioScope, quoteRadio, shareRadioTrack } from './share';

const track: RadioTrack = {
	slotKey: '2026-09-24-14',
	title: 'チェリー',
	artist: 'スピッツ',
	comment: '今日はこの一曲を。',
	commentJa: '今日はこの一曲を。',
	songUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
	thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
	publishedAt: '2026-09-24T05:00:00Z',
};

beforeEach(() => {
	vi.mocked(composerHost.openQuoteRadio).mockReset();
	vi.unstubAllGlobals();
});

it('opens the composer as a quote of the radio episode, like news comments', () => {
	quoteRadio(track);
	expect(composerHost.openQuoteRadio).toHaveBeenCalledWith(track);
});

it('checks the radio collection permission before posting', async () => {
	vi.mocked(sessionCovers).mockResolvedValue(false);
	await expect(hasRadioScope()).resolves.toBe(false);
	expect(sessionCovers).toHaveBeenCalledWith([RADIO_COLLECTION_SCOPE]);
});

it('copies the song page when the share sheet is unavailable', async () => {
	const writeText = vi.fn().mockResolvedValue(undefined);
	vi.stubGlobal('navigator', { clipboard: { writeText } });
	await expect(shareRadioTrack(track)).resolves.toBe(true);
	expect(writeText).toHaveBeenCalledWith(track.songUrl);
});

it('treats closing the share sheet as a no-op', async () => {
	const share = vi
		.fn()
		.mockRejectedValue(Object.assign(new Error('cancel'), { name: 'AbortError' }));
	vi.stubGlobal('navigator', { share });
	await expect(shareRadioTrack(track)).resolves.toBe(false);
	expect(share).toHaveBeenCalledWith({ title: 'スピッツ - チェリー', url: track.songUrl });
});
