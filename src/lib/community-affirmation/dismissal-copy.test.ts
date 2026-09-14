import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (relativePath: string) => readFileSync(new URL(relativePath, import.meta.url), 'utf8');

describe('community affirmation dismissal copy', () => {
	it('describes skipping similar posts from the same user in Japanese and English', () => {
		const ja = read('../i18n/ja.ts');
		const en = read('../i18n/en.ts');

		expect(ja).toContain("communityAffirmationDismiss: '似た投稿を見送る'");
		expect(ja).toContain("communityAffirmationDismissAria: 'このユーザーによる似た投稿を見送る'");
		expect(en).toContain("communityAffirmationDismiss: 'Skip similar posts'");
		expect(en).toContain("communityAffirmationDismissAria: 'Skip similar posts from this user'");
	});
});
