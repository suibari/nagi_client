import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { get, writable } from 'svelte/store';
import type { ChronicleEventView } from '$lib/api/types';

vi.mock('$lib/api/appview', () => ({ getChronicle: vi.fn() }));
vi.mock('$lib/oauth/session.svelte', () => ({ session: writable<{ did: string } | undefined>() }));
import { getChronicle } from '$lib/api/appview';
import { session } from '$lib/oauth/session.svelte';
import { chronicleUnread, markChronicleSeen, startChronicleNotice } from './notice';

const event: ChronicleEventView = {
	id: 'highlight:1',
	kind: 'highlight',
	date: '2026-09-01',
	titleJa: '初めての出来事',
};
let stop: (() => void) | undefined;
let visible: () => void;
let account = 0;
beforeEach(() => {
	vi.useFakeTimers();
	vi.stubGlobal('localStorage', { getItem: vi.fn(() => null), setItem: vi.fn() });
	vi.stubGlobal('document', {
		hidden: false,
		addEventListener: vi.fn((_: string, fn: () => void) => {
			visible = fn;
		}),
		removeEventListener: vi.fn(),
	});
	vi.stubGlobal('window', { addEventListener: vi.fn(), removeEventListener: vi.fn() });
	vi.mocked(getChronicle).mockReset();
	(session as ReturnType<typeof writable<{ did: string } | undefined>>).set({
		did: `did:test:${++account}`,
	});
});
afterEach(() => {
	stop?.();
	vi.useRealTimers();
	vi.unstubAllGlobals();
});
const settle = async () => {
	await vi.advanceTimersByTimeAsync(0);
};

describe('chronicle notice', () => {
	it('keeps older pages unread until loaded and notices edits to existing events', async () => {
		const older = { ...event, id: 'older', date: '2025-01-01' };
		vi.mocked(getChronicle).mockImplementation(async (_, opts) =>
			opts?.cursor
				? { items: [older], hasMore: false }
				: { items: [event], cursor: '2025', hasMore: true },
		);
		stop = startChronicleNotice();
		await settle();
		expect(get(chronicleUnread)).toBe(1);
		markChronicleSeen(get(session)!.did, [event]);
		expect(get(chronicleUnread)).toBe(1);
		markChronicleSeen(get(session)!.did, [older]);
		expect(get(chronicleUnread)).toBe(0);
		vi.mocked(getChronicle).mockResolvedValue({
			items: [{ ...event, titleJa: '更新された内容' }, older],
			hasMore: false,
		});
		visible();
		await settle();
		expect(get(chronicleUnread)).toBe(1);
	});
	it('does not restore unread from a request started before the page was read', async () => {
		let resolve!: (page: { items: ChronicleEventView[]; hasMore: boolean }) => void;
		vi.mocked(getChronicle).mockReturnValue(
			new Promise((r) => {
				resolve = r;
			}),
		);
		stop = startChronicleNotice();
		markChronicleSeen(get(session)!.did, [event]);
		resolve({ items: [event], hasMore: false });
		await settle();
		expect(get(chronicleUnread)).toBe(0);
	});
	it('ignores late responses after logout', async () => {
		let resolve!: (page: { items: ChronicleEventView[]; hasMore: boolean }) => void;
		vi.mocked(getChronicle).mockReturnValue(
			new Promise((r) => {
				resolve = r;
			}),
		);
		stop = startChronicleNotice();
		(session as ReturnType<typeof writable<{ did: string } | undefined>>).set(undefined);
		resolve({ items: [event], hasMore: false });
		await settle();
		expect(get(chronicleUnread)).toBe(0);
	});
});
