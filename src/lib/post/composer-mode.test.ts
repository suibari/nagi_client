import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	COMPOSER_MODE_STORAGE_KEY,
	getComposerMode,
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
});
