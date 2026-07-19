export const SUPPORTED_LANGUAGES = [
	'ar',
	'bn',
	'bg',
	'zh',
	'hr',
	'cs',
	'da',
	'nl',
	'en',
	'et',
	'fi',
	'fr',
	'de',
	'el',
	'he',
	'hi',
	'hu',
	'id',
	'it',
	'ja',
	'ko',
	'lv',
	'lt',
	'no',
	'pl',
	'pt',
	'ro',
	'ru',
	'sr',
	'sk',
	'sl',
	'es',
	'sw',
	'sv',
	'th',
	'tr',
	'uk',
	'vi',
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export type LanguagePreference = 'browser' | SupportedLanguage;

export const POST_LANGUAGE_STORAGE_KEY = 'nagi-post-language';
export const TRANSLATION_LANGUAGE_STORAGE_KEY = 'nagi-translation-language';

const supported = new Set<string>(SUPPORTED_LANGUAGES);

export function normalizeSupportedLanguage(value: unknown): SupportedLanguage | undefined {
	if (typeof value !== 'string') return;
	try {
		const code = Intl.getCanonicalLocales(value)[0]?.split('-')[0]?.toLowerCase();
		return supported.has(code) ? (code as SupportedLanguage) : undefined;
	} catch {
		return;
	}
}

function browserLanguage(): SupportedLanguage {
	if (typeof navigator === 'undefined') return 'en';
	for (const value of [...(navigator.languages ?? []), navigator.language]) {
		const language = normalizeSupportedLanguage(value);
		if (language) return language;
	}
	return 'en';
}

function storedPreference(key: string): LanguagePreference {
	if (typeof window === 'undefined') return 'browser';
	try {
		const value = window.localStorage.getItem(key);
		return value === 'browser' || normalizeSupportedLanguage(value) === value ? value : 'browser';
	} catch {
		return 'browser';
	}
}

function storePreference(key: string, preference: LanguagePreference): void {
	if (typeof window === 'undefined') return;
	try {
		window.localStorage.setItem(key, preference);
	} catch {
		// The preference still applies in-memory when storage is unavailable.
	}
}

const preferences = $state({
	post: storedPreference(POST_LANGUAGE_STORAGE_KEY),
	translation: storedPreference(TRANSLATION_LANGUAGE_STORAGE_KEY),
});

export const languagePreferences = {
	get postPreference(): LanguagePreference {
		return preferences.post;
	},
	get translationPreference(): LanguagePreference {
		return preferences.translation;
	},
	get postLanguage(): SupportedLanguage {
		return preferences.post === 'browser' ? browserLanguage() : preferences.post;
	},
	get translationLanguage(): SupportedLanguage {
		return preferences.translation === 'browser' ? browserLanguage() : preferences.translation;
	},
};

export function setPostLanguagePreference(preference: LanguagePreference): void {
	preferences.post = preference;
	storePreference(POST_LANGUAGE_STORAGE_KEY, preference);
}

export function setTranslationLanguagePreference(preference: LanguagePreference): void {
	preferences.translation = preference;
	storePreference(TRANSLATION_LANGUAGE_STORAGE_KEY, preference);
}

export function languageName(language: SupportedLanguage, displayLocale: string): string {
	try {
		return new Intl.DisplayNames([displayLocale], { type: 'language' }).of(language) ?? language;
	} catch {
		return language;
	}
}
