import { describe, expect, it } from 'vitest';
import { PostTranslations } from './postTranslations.svelte';

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
