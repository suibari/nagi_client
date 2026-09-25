import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChroniclePage, ChronicleReadYear, PreferencesView } from '$lib/api/types';
vi.mock('$lib/api/appview', () => ({ getPreferences: vi.fn(), putPreferences: vi.fn() }));
import { getPreferences, putPreferences } from '$lib/api/appview';
import {
	chronicleStorageKey,
	chronicleYearsKey,
	createChronicleReadState,
	legacyChronicleRevision,
} from './read-state';

const first = { year: 2025, revision: 'a'.repeat(64) };
const changed = { year: 2025, revision: 'b'.repeat(64) };
const another = { year: 2026, revision: 'c'.repeat(64) };
const view = (): PreferencesView => ({
	readPositions: [],
	emojiFavorites: [],
	feedTabs: [],
	chronicleReadYears: [...remote].map(([year, revision]) => ({ year, revision })),
});
let remote: Map<number, string>;
let current: Map<number, string>;
let storage: Map<string, string>;
beforeEach(() => {
	vi.resetAllMocks();
	remote = new Map();
	current = new Map([
		[first.year, first.revision],
		[another.year, another.revision],
	]);
	storage = new Map();
	vi.stubGlobal('localStorage', {
		getItem: (key: string) => storage.get(key) ?? null,
		setItem: (key: string, value: string) => storage.set(key, value),
	});
	vi.mocked(getPreferences).mockImplementation(async () => view());
	vi.mocked(putPreferences).mockImplementation(async (input) => {
		for (const read of input.chronicleReadYears ?? [])
			if (current.get(read.year) === read.revision) remote.set(read.year, read.revision);
		return view();
	});
});
afterEach(() => vi.unstubAllGlobals());
const state = () =>
	createChronicleReadState(
		'alice',
		() => true,
		() => {},
	);

describe('chronicle yearly account read state', () => {
	it('syncs fresh devices and updates a year without accumulating old revisions', async () => {
		const a = state();
		await a.mark(first);
		storage.clear();
		const b = state();
		await b.sync();
		expect(b.years.get(first.year)).toBe(first.revision);
		expect(b.years.has(another.year)).toBe(false);
		current.set(changed.year, changed.revision);
		await b.mark(changed);
		await a.mark(another);
		expect(a.years).toEqual(
			new Map([
				[changed.year, changed.revision],
				[another.year, another.revision],
			]),
		);
		expect(remote.size).toBe(2);
	});
	it('discards stale pending reads without overwriting the current server read', async () => {
		const a = state();
		await a.mark(first);
		current.set(changed.year, changed.revision);
		remote.set(changed.year, changed.revision);
		await a.mark(first); // 古い画面からの再送
		expect(a.years.get(first.year)).toBe(changed.revision);
		expect(JSON.parse(storage.get(chronicleYearsKey('alice'))!).pending).toEqual([]);
	});
	it('persists failed writes and retries them after reopening', async () => {
		vi.mocked(putPreferences).mockRejectedValueOnce(new Error('offline'));
		await state().mark(first);
		expect(remote.size).toBe(0);
		const reopened = state();
		expect(reopened.years.get(first.year)).toBe(first.revision);
		await reopened.sync();
		expect(remote.get(first.year)).toBe(first.revision);
	});
	it('migrates only years whose full current contents were already read locally', async () => {
		const item = { id: 'one', kind: 'highlight' as const, date: '2025-01-01', titleJa: '出来事' };
		storage.set(
			chronicleStorageKey('alice'),
			JSON.stringify([[item.id, legacyChronicleRevision(item)]]),
		);
		const a = state();
		await a.migrate({ ...first, items: [item, { ...item, id: 'unread' }], hasMore: false });
		expect(remote.size).toBe(0);
		await a.migrate({ ...first, items: [{ ...item, titleJa: '更新' }], hasMore: false });
		expect(remote.size).toBe(0);
		await a.migrate({ ...first, items: [item], hasMore: false });
		expect(remote.get(first.year)).toBe(first.revision);
	});
	it('does not mark incomplete legacy pages from an older server as read', async () => {
		await state().migrate({ items: [], hasMore: false } as ChroniclePage);
		expect(putPreferences).not.toHaveBeenCalled();
	});
	it('does not drop a new revision read while a previous sync is pending', async () => {
		let resolve!: (view: PreferencesView) => void;
		vi.mocked(getPreferences).mockImplementationOnce(
			() =>
				new Promise((r) => {
					resolve = r;
				}),
		);
		const a = state();
		const old = a.mark(first);
		current.set(changed.year, changed.revision);
		const newer = a.mark(changed);
		resolve(view());
		await Promise.all([old, newer]);
		expect(remote.get(first.year)).toBe(changed.revision);
		expect(a.years.size).toBe(1);
	});
	it('ignores late responses after switching accounts or clearing local data', async () => {
		for (const dispose of [false, true]) {
			let active = true;
			let resolve!: (view: PreferencesView) => void;
			vi.mocked(getPreferences).mockImplementationOnce(
				() =>
					new Promise((r) => {
						resolve = r;
					}),
			);
			const a = createChronicleReadState(
				'alice',
				() => active,
				() => {},
			);
			const pending = a.sync();
			if (dispose) a.dispose();
			else active = false;
			storage.clear();
			remote.set(first.year, first.revision);
			resolve(view());
			await pending;
			expect(storage.size).toBe(0);
			expect(putPreferences).not.toHaveBeenCalled();
		}
	});
});
