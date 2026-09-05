import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	DEFAULT_THEME_PALETTE,
	THEME_PALETTE_STORAGE_KEY,
	THEME_STORAGE_KEY,
	clearThemePreference,
	getThemePalette,
	isThemePalette,
	setThemePalette,
	setThemePreference,
} from './theme';

describe('theme appearance', () => {
	let values: Map<string, string>;
	let root: {
		dataset: Record<string, string>;
		style: Record<string, string>;
		removeAttribute: ReturnType<typeof vi.fn>;
	};
	let meta: { content: string };

	beforeEach(() => {
		values = new Map();
		root = { dataset: {}, style: {}, removeAttribute: vi.fn() };
		meta = { content: '' };
		vi.stubGlobal('window', {
			localStorage: {
				getItem: (key: string) => values.get(key) ?? null,
				setItem: (key: string, value: string) => values.set(key, value),
				removeItem: (key: string) => values.delete(key),
			},
			matchMedia: () => ({ matches: false }),
		});
		vi.stubGlobal('document', {
			documentElement: root,
			querySelector: () => meta,
		});
	});

	afterEach(() => vi.unstubAllGlobals());

	it('accepts only supported palettes and falls back to bot mint', () => {
		expect(isThemePalette('morpho-blue')).toBe(true);
		expect(isThemePalette('unknown')).toBe(false);
		values.set(THEME_PALETTE_STORAGE_KEY, 'unknown');
		expect(getThemePalette()).toBe(DEFAULT_THEME_PALETTE);
	});

	it('applies palette and brightness through the same appearance path', () => {
		setThemePalette('latte-pink');
		expect(values.get(THEME_PALETTE_STORAGE_KEY)).toBe('latte-pink');
		expect(root.dataset.palette).toBe('latte-pink');
		expect(meta.content).toBe('#fbf8f9');

		setThemePreference('dark');
		expect(values.get(THEME_STORAGE_KEY)).toBe('dark');
		expect(root.dataset.theme).toBe('dark');
		expect(meta.content).toBe('#110f10');
	});

	it('clears both settings and restores the bot mint system default', () => {
		values.set(THEME_STORAGE_KEY, 'dark');
		values.set(THEME_PALETTE_STORAGE_KEY, 'simple');
		clearThemePreference();
		expect(values.size).toBe(0);
		expect(root.dataset.palette).toBe('bot-mint');
		expect(root.removeAttribute).toHaveBeenCalledWith('data-theme');
		expect(meta.content).toBe('#f4fafa');
	});
});
