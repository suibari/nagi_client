import { ja, type Messages } from './ja';
import { en } from './en';

export type LocalePreference = 'system' | 'ja' | 'en';
export type Locale = 'ja' | 'en';

export const LOCALE_STORAGE_KEY = 'nagi-locale';

const catalogs: Record<Locale, Messages> = { ja, en };

export function isLocalePreference(value: unknown): value is LocalePreference {
	return value === 'system' || value === 'ja' || value === 'en';
}

function detectLocale(): Locale {
	if (typeof navigator === 'undefined') return 'en';
	return navigator.language?.toLowerCase().startsWith('ja') ? 'ja' : 'en';
}

function getStoredPreference(): LocalePreference {
	if (typeof window === 'undefined') return 'system';

	try {
		const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
		return isLocalePreference(stored) ? stored : 'system';
	} catch {
		return 'system';
	}
}

const prefs = $state({ preference: getStoredPreference() });

export const i18n = {
	get preference(): LocalePreference {
		return prefs.preference;
	},
	get locale(): Locale {
		return prefs.preference === 'system' ? detectLocale() : prefs.preference;
	},
};

function applyLang(): void {
	if (typeof document === 'undefined') return;
	document.documentElement.lang = i18n.locale;
}

export function setLocalePreference(preference: LocalePreference): void {
	prefs.preference = preference;
	if (typeof window !== 'undefined') {
		try {
			window.localStorage.setItem(LOCALE_STORAGE_KEY, preference);
		} catch {
			// The language still applies in-memory when storage is unavailable.
		}
	}
	applyLang();
}

export function clearLocalePreference(): void {
	prefs.preference = 'system';
	if (typeof window !== 'undefined') window.localStorage.removeItem(LOCALE_STORAGE_KEY);
	applyLang();
}

applyLang();

/** Locale string for Intl/toLocaleString calls. */
export function dateLocale(): 'ja-JP' | 'en-US' {
	return i18n.locale === 'ja' ? 'ja-JP' : 'en-US';
}

type MessageAccessors = {
	[K in keyof Messages]: Messages[K] extends (...args: infer A) => string
		? (...args: A) => string
		: () => string;
};

/**
 * Reactive message accessors: call as m.key() / m.key(args). Each call reads
 * the current locale from $state, so calls made during render re-run when the
 * language changes. Strings copied into state (e.g. error messages captured in
 * a catch block) keep the language they were created in.
 */
export const m = Object.fromEntries(
	(Object.keys(ja) as (keyof Messages)[]).map((key) => [
		key,
		(...args: unknown[]) => {
			const value = catalogs[i18n.locale][key];
			return typeof value === 'function' ? (value as (...a: unknown[]) => string)(...args) : value;
		},
	]),
) as MessageAccessors;
