import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { en } from '$lib/i18n/en';
import { ja } from '$lib/i18n/ja';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');

// 保護者の同意の要件は廃止した（AUTH-07、MOD-01）。規約・画面・送信のどこにも戻さない。
describe('parental consent is no longer required', () => {
	const sources = {
		termsJa: read('../../routes/terms/TermsJa.svelte'),
		termsEn: read('../../routes/terms/TermsEn.svelte'),
		privacyJa: read('../../routes/privacy/PrivacyJa.svelte'),
		privacyEn: read('../../routes/privacy/PrivacyEn.svelte'),
		login: read('../../routes/login/+page.svelte'),
		ageForm: read('../components/AgeAssuranceForm.svelte'),
		age: read('../moderation/age.svelte.ts'),
	};

	it.each(Object.entries(sources))('%s does not mention parental consent', (_name, source) => {
		expect(source).not.toMatch(/保護者|guardian|parentalConsent|parental_consent/i);
	});

	it('keeps the messages free of parental consent', () => {
		for (const messages of [ja, en]) {
			expect(JSON.stringify(messages)).not.toMatch(/保護者|guardian/i);
		}
	});

	it('keeps the terms agreement on the login screen', () => {
		expect(sources.login).toContain('m.loginAgreeBefore()');
		expect(sources.login).toContain('href="/terms"');
		expect(sources.login).toContain('href="/privacy"');
	});
});
