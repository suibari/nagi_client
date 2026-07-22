import type { SupportedLanguage } from './languagePreferences.svelte';

// 外部翻訳サービスの一覧。いずれも本文を URL に載せて Web ページを開くだけなので、
// API キーやログインは不要。id は localStorage / 設定 select の値として使う。
export const TRANSLATION_PROVIDERS = [
	{ id: 'kagi', name: 'Kagi', homepage: 'https://translate.kagi.com' },
	{ id: 'deepl', name: 'DeepL', homepage: 'https://www.deepl.com/translator' },
	{ id: 'google', name: 'Google', homepage: 'https://translate.google.com' },
] as const;

export type TranslationProvider = (typeof TRANSLATION_PROVIDERS)[number]['id'];

export const DEFAULT_TRANSLATION_PROVIDER: TranslationProvider = 'kagi';

const providerIds = new Set<string>(TRANSLATION_PROVIDERS.map((provider) => provider.id));

export function isTranslationProvider(value: unknown): value is TranslationProvider {
	return typeof value === 'string' && providerIds.has(value);
}

export function translationProviderName(provider: TranslationProvider): string {
	return TRANSLATION_PROVIDERS.find((entry) => entry.id === provider)?.name ?? provider;
}

// 選択したプロバイダーの Web ページを、本文と翻訳先言語を埋めた状態で開くための URL。
// Kagi / Google は text をクエリに、DeepL はフラグメント（本文がサーバーログに残りにくい）に載せる。
export function buildExternalTranslationUrl(
	provider: TranslationProvider,
	{ text, from, to }: { text: string; from?: SupportedLanguage; to: SupportedLanguage },
): string {
	const encoded = encodeURIComponent(text);
	switch (provider) {
		case 'kagi':
			return `https://translate.kagi.com/?text=${encoded}&to=${to}${from ? `&from=${from}` : ''}`;
		case 'deepl':
			return `https://www.deepl.com/translator#${from ?? 'auto'}/${to}/${encoded}`;
		case 'google':
			return `https://translate.google.com/?sl=${from ?? 'auto'}&tl=${to}&text=${encoded}&op=translate`;
	}
}
