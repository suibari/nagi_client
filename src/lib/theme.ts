export type ThemePreference = 'system' | 'light' | 'dark';
export type ThemePalette = 'bot-mint' | 'latte-pink' | 'kotomi-orange' | 'morpho-blue' | 'simple';

export const THEME_STORAGE_KEY = 'nagi-theme';
export const THEME_PALETTE_STORAGE_KEY = 'nagi-theme-palette';
export const DEFAULT_THEME_PALETTE: ThemePalette = 'bot-mint';

const THEME_COLORS: Record<ThemePalette, { light: string; dark: string }> = {
	'bot-mint': { light: '#f4fafa', dark: '#08110f' },
	'latte-pink': { light: '#fbf8f9', dark: '#110f10' },
	'kotomi-orange': { light: '#fbf9f6', dark: '#12100e' },
	'morpho-blue': { light: '#f7f9fc', dark: '#090e14' },
	simple: { light: '#ffffff', dark: '#000000' },
};

function resolvedMode(preference: ThemePreference): 'light' | 'dark' {
	return preference === 'dark' ||
		(preference === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
		? 'dark'
		: 'light';
}

function syncThemeColor(preference: ThemePreference, palette: ThemePalette): void {
	if (typeof document === 'undefined') return;
	const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
	if (!meta) return;
	meta.content = THEME_COLORS[palette][resolvedMode(preference)];
}

export function isThemePreference(value: unknown): value is ThemePreference {
	return value === 'system' || value === 'light' || value === 'dark';
}

export function isThemePalette(value: unknown): value is ThemePalette {
	return (
		value === 'bot-mint' ||
		value === 'latte-pink' ||
		value === 'kotomi-orange' ||
		value === 'morpho-blue' ||
		value === 'simple'
	);
}

export function getThemePreference(): ThemePreference {
	if (typeof window === 'undefined') return 'system';
	try {
		const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
		return isThemePreference(stored) ? stored : 'system';
	} catch {
		return 'system';
	}
}

export function getThemePalette(): ThemePalette {
	if (typeof window === 'undefined') return DEFAULT_THEME_PALETTE;
	try {
		const stored = window.localStorage.getItem(THEME_PALETTE_STORAGE_KEY);
		return isThemePalette(stored) ? stored : DEFAULT_THEME_PALETTE;
	} catch {
		return DEFAULT_THEME_PALETTE;
	}
}

export function applyThemePreference(
	preference: ThemePreference,
	palette = getThemePalette(),
): void {
	if (typeof document === 'undefined') return;
	document.documentElement.dataset.palette = palette;
	syncThemeColor(preference, palette);

	if (preference === 'system') {
		document.documentElement.removeAttribute('data-theme');
		document.documentElement.style.colorScheme = 'light dark';
		return;
	}

	document.documentElement.dataset.theme = preference;
	document.documentElement.style.colorScheme = preference;
}

export function setThemePreference(preference: ThemePreference): void {
	if (typeof window !== 'undefined') {
		try {
			window.localStorage.setItem(THEME_STORAGE_KEY, preference);
		} catch {
			// The visual preference still applies when storage is unavailable.
		}
	}
	applyThemePreference(preference);
}

export function setThemePalette(palette: ThemePalette): void {
	if (typeof window !== 'undefined') {
		try {
			window.localStorage.setItem(THEME_PALETTE_STORAGE_KEY, palette);
		} catch {
			// The visual preference still applies when storage is unavailable.
		}
	}
	applyThemePreference(getThemePreference(), palette);
}

export function clearThemePreference(): void {
	if (typeof window !== 'undefined') {
		window.localStorage.removeItem(THEME_STORAGE_KEY);
		window.localStorage.removeItem(THEME_PALETTE_STORAGE_KEY);
	}
	applyThemePreference('system', DEFAULT_THEME_PALETTE);
}
