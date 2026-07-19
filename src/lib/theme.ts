export type ThemePreference = 'system' | 'light' | 'dark';

export const THEME_STORAGE_KEY = 'nagi-theme';

export function isThemePreference(value: unknown): value is ThemePreference {
	return value === 'system' || value === 'light' || value === 'dark';
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

export function applyThemePreference(preference: ThemePreference): void {
	if (typeof document === 'undefined') return;

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

export function clearThemePreference(): void {
	if (typeof window !== 'undefined') window.localStorage.removeItem(THEME_STORAGE_KEY);
	applyThemePreference('system');
}
