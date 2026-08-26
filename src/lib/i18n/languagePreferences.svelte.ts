import {
	DEFAULT_TRANSLATION_PROVIDER,
	isTranslationProvider,
	type TranslationProvider,
} from './translationProviders';

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
export const TRANSLATION_PROVIDER_STORAGE_KEY = 'nagi-translation-provider';
export const AUTO_TRANSLATE_STORAGE_KEY = 'nagi-auto-translate';
const CACHE_PREFIX = 'nagi.language-preferences.v1.';
export type StoredLanguagePreferences = {
	post: LanguagePreference;
	translation: LanguagePreference;
	provider: TranslationProvider;
	autoTranslate: boolean;
	updatedAt: string;
};
let scopedDid: string | undefined;
let changed: ((value: StoredLanguagePreferences) => void) | undefined;

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

function storedProvider(): TranslationProvider {
	if (typeof window === 'undefined') return DEFAULT_TRANSLATION_PROVIDER;
	try {
		const value = window.localStorage.getItem(TRANSLATION_PROVIDER_STORAGE_KEY);
		return isTranslationProvider(value) ? value : DEFAULT_TRANSLATION_PROVIDER;
	} catch {
		return DEFAULT_TRANSLATION_PROVIDER;
	}
}

// 自動翻訳は既定 on。localStorage に 'off' が入っている時だけ off にする。
function storedAutoTranslate(): boolean {
	if (typeof window === 'undefined') return true;
	try {
		return window.localStorage.getItem(AUTO_TRANSLATE_STORAGE_KEY) !== 'off';
	} catch {
		return true;
	}
}

const preferences = $state({
	post: storedPreference(POST_LANGUAGE_STORAGE_KEY),
	translation: storedPreference(TRANSLATION_LANGUAGE_STORAGE_KEY),
	provider: storedProvider(),
	autoTranslate: storedAutoTranslate(),
});

export const languagePreferencesStorageKey = (did: string) =>
	`${CACHE_PREFIX}${encodeURIComponent(did)}`;
export function loadStoredLanguagePreferences(did: string): StoredLanguagePreferences | undefined {
	if (typeof window === 'undefined') return;
	try {
		const value = JSON.parse(
			window.localStorage.getItem(languagePreferencesStorageKey(did)) ?? 'null',
		);
		if (
			!value ||
			typeof value.updatedAt !== 'string' ||
			!(value.post === 'browser' || normalizeSupportedLanguage(value.post) === value.post) ||
			!(
				value.translation === 'browser' ||
				normalizeSupportedLanguage(value.translation) === value.translation
			) ||
			!isTranslationProvider(value.provider) ||
			typeof value.autoTranslate !== 'boolean'
		)
			return;
		return value;
	} catch {
		return;
	}
}
export function hasLegacyLanguagePreferences(): boolean {
	if (typeof window === 'undefined') return false;
	try {
		return [
			POST_LANGUAGE_STORAGE_KEY,
			TRANSLATION_LANGUAGE_STORAGE_KEY,
			TRANSLATION_PROVIDER_STORAGE_KEY,
			AUTO_TRANSLATE_STORAGE_KEY,
		].some((key) => window.localStorage.getItem(key) !== null);
	} catch {
		return false;
	}
}
export function languagePreferencesSnapshot(
	updatedAt = new Date().toISOString(),
): StoredLanguagePreferences {
	return { ...preferences, updatedAt };
}
export function adoptLanguagePreferences(
	did: string,
	value: Omit<StoredLanguagePreferences, 'updatedAt'>,
	updatedAt: string,
) {
	preferences.post = value.post;
	preferences.translation = value.translation;
	preferences.provider = value.provider;
	preferences.autoTranslate = value.autoTranslate;
	try {
		localStorage.setItem(
			languagePreferencesStorageKey(did),
			JSON.stringify({ ...value, updatedAt }),
		);
	} catch {}
}
export function setLanguagePreferencesScope(did: string | undefined) {
	scopedDid = did;
	if (!did) {
		preferences.post = storedPreference(POST_LANGUAGE_STORAGE_KEY);
		preferences.translation = storedPreference(TRANSLATION_LANGUAGE_STORAGE_KEY);
		preferences.provider = storedProvider();
		preferences.autoTranslate = storedAutoTranslate();
		return;
	}
	const stored = loadStoredLanguagePreferences(did);
	if (stored) adoptLanguagePreferences(did, stored, stored.updatedAt);
	else {
		preferences.post = storedPreference(POST_LANGUAGE_STORAGE_KEY);
		preferences.translation = storedPreference(TRANSLATION_LANGUAGE_STORAGE_KEY);
		preferences.provider = storedProvider();
		preferences.autoTranslate = storedAutoTranslate();
	}
}
export function subscribeLanguagePreferencesChanged(
	handler: (value: StoredLanguagePreferences) => void,
) {
	changed = handler;
}
function persistSyncedPreferences() {
	if (!scopedDid) return;
	const snapshot = languagePreferencesSnapshot();
	try {
		localStorage.setItem(languagePreferencesStorageKey(scopedDid), JSON.stringify(snapshot));
	} catch {}
	changed?.(snapshot);
}

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
	get translationProvider(): TranslationProvider {
		return preferences.provider;
	},
	get autoTranslate(): boolean {
		return preferences.autoTranslate;
	},
};

export function setPostLanguagePreference(preference: LanguagePreference): void {
	preferences.post = preference;
	if (!scopedDid) storePreference(POST_LANGUAGE_STORAGE_KEY, preference);
	persistSyncedPreferences();
}

export function setTranslationLanguagePreference(preference: LanguagePreference): void {
	preferences.translation = preference;
	if (!scopedDid) storePreference(TRANSLATION_LANGUAGE_STORAGE_KEY, preference);
	persistSyncedPreferences();
}

export function setTranslationProviderPreference(provider: TranslationProvider): void {
	preferences.provider = provider;
	if (typeof window === 'undefined') return;
	try {
		if (!scopedDid) window.localStorage.setItem(TRANSLATION_PROVIDER_STORAGE_KEY, provider);
	} catch {
		// The preference still applies in-memory when storage is unavailable.
	}
	persistSyncedPreferences();
}

export function setAutoTranslatePreference(enabled: boolean): void {
	preferences.autoTranslate = enabled;
	if (typeof window === 'undefined') return;
	try {
		if (!scopedDid) window.localStorage.setItem(AUTO_TRANSLATE_STORAGE_KEY, enabled ? 'on' : 'off');
	} catch {
		// The preference still applies in-memory when storage is unavailable.
	}
	persistSyncedPreferences();
}

export function clearLanguagePreferences(): void {
	preferences.post = 'browser';
	preferences.translation = 'browser';
	preferences.provider = DEFAULT_TRANSLATION_PROVIDER;
	preferences.autoTranslate = true;
	if (typeof window === 'undefined') return;
	window.localStorage.removeItem(POST_LANGUAGE_STORAGE_KEY);
	window.localStorage.removeItem(TRANSLATION_LANGUAGE_STORAGE_KEY);
	window.localStorage.removeItem(TRANSLATION_PROVIDER_STORAGE_KEY);
	window.localStorage.removeItem(AUTO_TRANSLATE_STORAGE_KEY);
	if (scopedDid) window.localStorage.removeItem(languagePreferencesStorageKey(scopedDid));
}

export function languageName(language: SupportedLanguage, displayLocale: string): string {
	try {
		return new Intl.DisplayNames([displayLocale], { type: 'language' }).of(language) ?? language;
	} catch {
		return language;
	}
}
