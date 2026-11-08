import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	COMPOSER_MODE_STORAGE_KEY,
	COMPOSER_MODES,
	getComposerMode,
	groupComposerModes,
	isPlainPostMode,
	isWideComposer,
	resetComposerMode,
	setComposerMode,
} from './composer-mode';

function storageWith(initial?: string) {
	const values = new Map<string, string>();
	if (initial !== undefined) values.set(COMPOSER_MODE_STORAGE_KEY, initial);
	return {
		getItem: (key: string) => values.get(key) ?? null,
		setItem: (key: string, value: string) => values.set(key, value),
	};
}

afterEach(() => vi.unstubAllGlobals());

describe('composer mode preference', () => {
	it('keeps a selected mode in device storage until a post succeeds', () => {
		const localStorage = storageWith();
		vi.stubGlobal('window', { localStorage });

		setComposerMode('rich');
		expect(getComposerMode()).toBe('rich');
	});

	it('returns to simple mode after a successful post', () => {
		const localStorage = storageWith('rich');
		vi.stubGlobal('window', { localStorage });

		expect(resetComposerMode()).toBe('simple');
		expect(getComposerMode()).toBe('simple');
	});

	it('falls back to simple mode for missing or invalid stored values', () => {
		vi.stubGlobal('window', { localStorage: storageWith('unknown') });
		expect(getComposerMode()).toBe('simple');
	});

	it('ignores a blog tab stored before the blog moved to its own modal', () => {
		vi.stubGlobal('window', { localStorage: storageWith('blog') });
		expect(getComposerMode()).toBe('simple');
	});

	it('places the diary tab after rich, without a blog tab, and remembers it', () => {
		vi.stubGlobal('window', { localStorage: storageWith() });

		expect(COMPOSER_MODES).toEqual(['simple', 'rich', 'diary']);
		setComposerMode('diary');
		expect(getComposerMode()).toBe('diary');
		expect(isPlainPostMode('diary')).toBe(false);
		expect(isPlainPostMode('blog')).toBe(false);
		expect(isPlainPostMode('rich')).toBe(true);
	});

	it('groups simple and rich as posts, and keeps diary on its own', () => {
		expect(groupComposerModes(COMPOSER_MODES)).toEqual([['simple', 'rich'], ['diary']]);
		// 返信・引用やゲストでは、ポストのグループだけになる。
		expect(groupComposerModes(['simple', 'rich'])).toEqual([['simple', 'rich']]);
		expect(groupComposerModes(['diary'])).toEqual([['diary']]);
	});

	it('treats both rich and blog as the wide editor', () => {
		expect(isWideComposer('simple')).toBe(false);
		expect(isWideComposer('rich')).toBe(true);
		expect(isWideComposer('blog')).toBe(true);
		expect(isWideComposer('diary')).toBe(false);
	});
});
