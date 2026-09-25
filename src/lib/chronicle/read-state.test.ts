import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PreferencesView } from '$lib/api/types';
vi.mock('$lib/api/appview', () => ({ getPreferences: vi.fn(), putPreferences: vi.fn() }));
import { getPreferences, putPreferences } from '$lib/api/appview';
import { chronicleReadToken, chronicleStorageKey, createChronicleReadState } from './read-state';

const view = (tokens: Iterable<string>): PreferencesView => ({
	readPositions: [],
	emojiFavorites: [],
	feedTabs: [],
	chronicleReadRevisions: [...tokens],
});
let remote: Set<string>;
let storage: Map<string, string>;
beforeEach(() => {
	vi.resetAllMocks();
	remote = new Set();
	storage = new Map();
	vi.stubGlobal('localStorage', {
		getItem: (key: string) => storage.get(key) ?? null,
		setItem: (key: string, value: string) => storage.set(key, value),
	});
	vi.mocked(getPreferences).mockImplementation(async () => view(remote));
	vi.mocked(putPreferences).mockImplementation(async (input) => {
		for (const token of input.chronicleReadRevisions ?? []) remote.add(token);
		return view(remote);
	});
});

afterEach(() => vi.unstubAllGlobals());

describe('chronicle account read state', () => {
	it('unions reads across fresh devices without reading unseen pages or edited revisions', async () => {
		const a = createChronicleReadState(
			'alice',
			() => true,
			() => {},
		);
		await a.mark([['event', 'original']]);
		storage.clear(); // 別端末にはlocalStorageを引き継がない。
		const b = createChronicleReadState(
			'alice',
			() => true,
			() => {},
		);
		await b.sync();
		expect(b.tokens.has(await chronicleReadToken('event', 'original'))).toBe(true);
		expect(b.tokens.has(await chronicleReadToken('event', 'edited'))).toBe(false);
		expect(b.tokens.has(await chronicleReadToken('other-year', 'original'))).toBe(false);
		await b.mark([['event', 'edited']]);
		await a.mark([['other-year', 'original']]);
		await b.sync();
		expect(a.tokens.size).toBe(3);
		expect(b.tokens).toEqual(a.tokens);
	});

	it('migrates existing local reads and retries failed writes on resume', async () => {
		storage.set(chronicleStorageKey('alice'), JSON.stringify([['event', 'original']]));
		vi.mocked(putPreferences).mockRejectedValueOnce(new Error('offline'));
		const a = createChronicleReadState(
			'alice',
			() => true,
			() => {},
		);
		await a.sync();
		expect(remote.size).toBe(0);
		expect(a.tokens.size).toBe(1);
		await a.sync();
		expect(remote).toEqual(a.tokens);
	});

	it('does not upload a previous account’s reads after the account changes', async () => {
		let active = true;
		let resolve!: (view: PreferencesView) => void;
		vi.mocked(getPreferences).mockImplementation(
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
		const pending = a.mark([['event', 'original']]);
		await vi.waitFor(() => expect(getPreferences).toHaveBeenCalled());
		active = false;
		resolve(view([]));
		await pending;
		expect(putPreferences).not.toHaveBeenCalled();
	});

	it('does not drop reads added while a sync request is pending', async () => {
		let resolve!: (view: PreferencesView) => void;
		vi.mocked(getPreferences).mockImplementationOnce(
			() =>
				new Promise((r) => {
					resolve = r;
				}),
		);
		const a = createChronicleReadState(
			'alice',
			() => true,
			() => {},
		);
		const pending = a.sync();
		await vi.waitFor(() => expect(getPreferences).toHaveBeenCalled());
		const marking = a.mark([['event', 'original']]);
		await vi.waitFor(() => expect(a.tokens.size).toBe(1));
		resolve(view([]));
		await Promise.all([pending, marking]);
		expect(remote).toEqual(a.tokens);
		expect(remote.size).toBe(1);
	});

	it('splits large migrations into batches', async () => {
		const entries = Array.from({ length: 205 }, (_, index) => [`event-${index}`, 'original']);
		storage.set(chronicleStorageKey('alice'), JSON.stringify(entries));
		const a = createChronicleReadState(
			'alice',
			() => true,
			() => {},
		);
		await a.sync();
		expect(putPreferences).toHaveBeenCalledTimes(2);
		expect(remote.size).toBe(205);
	});

	it('does not restore deleted cache from an in-flight request', async () => {
		let resolve!: (view: PreferencesView) => void;
		vi.mocked(getPreferences).mockImplementation(
			() =>
				new Promise((r) => {
					resolve = r;
				}),
		);
		const a = createChronicleReadState(
			'alice',
			() => true,
			() => {},
		);
		const pending = a.sync();
		await vi.waitFor(() => expect(getPreferences).toHaveBeenCalled());
		a.dispose();
		storage.clear();
		resolve(view(['a'.repeat(64)]));
		await pending;
		expect(storage.size).toBe(0);
	});
});
