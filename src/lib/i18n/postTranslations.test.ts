import { describe, expect, it } from 'vitest';
import { isTranslationCandidate, PostTranslations } from './postTranslations.svelte';

describe('translation original disclosure', () => {
	it('keeps the original open across component remounts for the same translation identity', () => {
		const translations = new PostTranslations();
		const uri = 'at://did:plc:alice/com.suibari.nagi.post/one';

		expect(translations.originalExpanded(uri, 'cid-1', 'ja')).toBe(false);
		translations.toggleOriginal(uri, 'cid-1', 'ja');

		// A newly mounted TranslateToggle reads the same store entry.
		expect(translations.originalExpanded(uri, 'cid-1', 'ja')).toBe(true);
	});

	it('starts closed when the post revision or target language changes', () => {
		const translations = new PostTranslations();
		const uri = 'at://did:plc:alice/com.suibari.nagi.post/one';

		translations.toggleOriginal(uri, 'cid-1', 'ja');

		expect(translations.originalExpanded(uri, 'cid-2', 'ja')).toBe(false);
		expect(translations.originalExpanded(uri, 'cid-1', 'en')).toBe(false);
	});

	it('closes an open original when toggled again', () => {
		const translations = new PostTranslations();
		const uri = 'at://did:plc:alice/com.suibari.nagi.post/one';

		translations.toggleOriginal(uri, 'cid-1', 'ja');
		translations.toggleOriginal(uri, 'cid-1', 'ja');

		expect(translations.originalExpanded(uri, 'cid-1', 'ja')).toBe(false);
	});
});

describe('translation candidates', () => {
	const post = (uri: string, langs?: string[]) => ({
		uri,
		cid: 'cid-1',
		text: '雨の日の物語',
		langs,
	});

	it('translates Zenkatsu author notes like posts', () => {
		const uri = 'at://did:plc:alice/com.suibari.nagi.zenkatsu/2026-09-19';
		expect(isTranslationCandidate(post(uri, ['ja']), 'en')).toBe(true);
		// 原文と同じ言語、言語不明（langs を書く前の提出）は訳さない。投稿と同じ扱い。
		expect(isTranslationCandidate(post(uri, ['ja']), 'ja')).toBe(false);
		expect(isTranslationCandidate(post(uri), 'en')).toBe(false);
	});

	it('does not send other record types to the translation API', () => {
		expect(
			isTranslationCandidate(post('at://did:plc:alice/com.suibari.nagi.cardGet/3m', ['ja']), 'en'),
		).toBe(false);
	});
});
