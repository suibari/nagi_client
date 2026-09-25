import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { get, writable } from 'svelte/store';
import type { ChroniclePage } from '$lib/api/types';
vi.mock('$lib/api/appview', () => ({
	getChronicle: vi.fn(),
	getPreferences: vi.fn(),
	putPreferences: vi.fn(),
}));
vi.mock('$lib/oauth/session.svelte', () => ({ session: writable<{ did: string } | undefined>() }));
import { getChronicle, getPreferences, putPreferences } from '$lib/api/appview';
import { session } from '$lib/oauth/session.svelte';
import { chronicleUnread, markChronicleSeen, startChronicleNotice } from './notice';
const first: ChroniclePage = {
	year: 2025,
	revision: 'a'.repeat(64),
	items: [{ id: 'one', kind: 'highlight', date: '2025-01-01' }],
	hasMore: false,
};
const next: ChroniclePage = {
	year: 2026,
	revision: 'b'.repeat(64),
	items: [{ id: 'two', kind: 'highlight', date: '2026-01-01' }],
	hasMore: false,
};
let stop: (() => void) | undefined;
let visible: () => void;
let storageEvent: (event: { key: string }) => void;
let saved: Map<string, string>;
let account = 0;
let remote: Map<number, string>;
const view = () => ({
	readPositions: [],
	emojiFavorites: [],
	feedTabs: [],
	chronicleReadYears: [...remote].map(([year, revision]) => ({ year, revision })),
});
beforeEach(() => {
	vi.useFakeTimers();
	vi.resetAllMocks();
	remote = new Map();
	saved = new Map();
	vi.stubGlobal('localStorage', {
		getItem: vi.fn((key: string) => saved.get(key) ?? null),
		setItem: vi.fn((key: string, value: string) => saved.set(key, value)),
	});
	vi.stubGlobal('window', {
		addEventListener: vi.fn((_: string, fn: typeof storageEvent) => {
			storageEvent = fn;
		}),
		removeEventListener: vi.fn(),
	});
	vi.stubGlobal('document', {
		hidden: false,
		addEventListener: vi.fn((_: string, fn: () => void) => {
			visible = fn;
		}),
		removeEventListener: vi.fn(),
	});
	vi.mocked(getPreferences).mockImplementation(async () => view());
	vi.mocked(putPreferences).mockImplementation(async (input) => {
		for (const read of input.chronicleReadYears ?? []) remote.set(read.year, read.revision);
		return view();
	});
	(session as ReturnType<typeof writable>).set({ did: `did:test:${++account}` });
});
afterEach(() => {
	stop?.();
	vi.useRealTimers();
	vi.unstubAllGlobals();
});
const settle = () => vi.advanceTimersByTimeAsync(0);
describe('chronicle yearly notice', () => {
	it('reflects years read in another tab', async () => {
		vi.mocked(getChronicle).mockResolvedValue(first);
		stop = startChronicleNotice();
		await settle();
		expect(get(chronicleUnread)).toBe(1);
		const key = `nagi-chronicle-read-years:${get(session)!.did}`;
		saved.set(key, JSON.stringify({ years: [[first.year, first.revision]], pending: [] }));
		storageEvent({ key });
		expect(get(chronicleUnread)).toBe(0);
	});
	it('keeps unviewed years unread and notices edits and deletion to an empty year', async () => {
		vi.mocked(getChronicle).mockImplementation(async (_, opts) =>
			opts?.cursor ? next : { ...first, cursor: '2026', hasMore: true },
		);
		stop = startChronicleNotice();
		await settle();
		expect(get(chronicleUnread)).toBe(1);
		await markChronicleSeen(get(session)!.did, first);
		expect(get(chronicleUnread)).toBe(1);
		await markChronicleSeen(get(session)!.did, next);
		expect(get(chronicleUnread)).toBe(0);
		const edited = { ...first, revision: 'c'.repeat(64) };
		vi.mocked(getChronicle).mockResolvedValue(edited);
		visible();
		await settle();
		expect(get(chronicleUnread)).toBe(1);
		await markChronicleSeen(get(session)!.did, edited);
		expect(get(chronicleUnread)).toBe(0);
		const empty = { ...first, revision: 'd'.repeat(64), items: [] };
		vi.mocked(getChronicle).mockResolvedValue(empty);
		visible();
		await settle();
		expect(get(chronicleUnread)).toBe(1);
		await markChronicleSeen(get(session)!.did, empty);
		expect(get(chronicleUnread)).toBe(0);
	});
	it('does not notify for an empty year that was never read', async () => {
		vi.mocked(getChronicle).mockResolvedValue({ ...first, items: [] });
		stop = startChronicleNotice();
		await settle();
		expect(get(chronicleUnread)).toBe(0);
	});
	it('refreshes another device’s read on resume without polling', async () => {
		vi.mocked(getChronicle).mockResolvedValue(first);
		stop = startChronicleNotice();
		await settle();
		expect(get(chronicleUnread)).toBe(1);
		await vi.advanceTimersByTimeAsync(24 * 60 * 60_000);
		expect(getChronicle).toHaveBeenCalledTimes(1);
		Object.assign(document, { hidden: true });
		visible();
		expect(getChronicle).toHaveBeenCalledTimes(1);
		remote.set(first.year!, first.revision!);
		Object.assign(document, { hidden: false });
		visible();
		await settle();
		expect(getChronicle).toHaveBeenCalledTimes(2);
		expect(get(chronicleUnread)).toBe(0);
	});
	it('clears a newer page read even when the menu last observed an older revision', async () => {
		vi.mocked(getChronicle).mockResolvedValue(first);
		stop = startChronicleNotice();
		await settle();
		const edited = { ...first, revision: 'e'.repeat(64) };
		await markChronicleSeen(get(session)!.did, edited);
		expect(get(chronicleUnread)).toBe(0);
	});
	it('does not replace a newly read revision with an older in-flight page', async () => {
		vi.mocked(getChronicle).mockResolvedValue(first);
		stop = startChronicleNotice();
		await settle();
		let resolve!: (page: ChroniclePage) => void;
		vi.mocked(getChronicle).mockImplementationOnce(
			() =>
				new Promise((r) => {
					resolve = r;
				}),
		);
		visible();
		await settle();
		const edited = { ...first, revision: 'e'.repeat(64) };
		await markChronicleSeen(get(session)!.did, edited);
		vi.mocked(getChronicle).mockResolvedValue(edited);
		resolve(first);
		await settle();
		expect(get(chronicleUnread)).toBe(0);
	});
	it('does not restore unread from a response started before reading or logout', async () => {
		let resolve!: (page: ChroniclePage) => void;
		vi.mocked(getChronicle).mockImplementation(
			() =>
				new Promise((r) => {
					resolve = r;
				}),
		);
		stop = startChronicleNotice();
		await settle();
		await markChronicleSeen(get(session)!.did, first);
		vi.mocked(getChronicle).mockResolvedValue(first);
		resolve(first);
		await settle();
		expect(get(chronicleUnread)).toBe(0);
		vi.mocked(getChronicle).mockImplementation(
			() =>
				new Promise((r) => {
					resolve = r;
				}),
		);
		visible();
		await settle();
		(session as ReturnType<typeof writable>).set(undefined);
		resolve(next);
		await settle();
		expect(get(chronicleUnread)).toBe(0);
	});
});
