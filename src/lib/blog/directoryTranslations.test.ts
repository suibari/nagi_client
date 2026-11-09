import { describe, expect, it } from 'vitest';
import { translatedBlogSummary } from './directoryTranslations';

describe('translatedBlogSummary', () => {
	it('takes the title and a plain description from the translated article', () => {
		expect(
			translatedBlogSummary('# 雨の日\n\n**本を**読んだ。', '# A Rainy Day\n\nI read **a book**.'),
		).toEqual({ title: 'A Rainy Day', description: 'I read a book.' });
	});

	it('keeps the first line as the title when the translation dropped the heading marker', () => {
		expect(translatedBlogSummary('# 雨の日\n\n本文', 'A Rainy Day\n\nThe body.')).toEqual({
			title: 'A Rainy Day',
			description: 'The body.',
		});
	});

	it('limits the description to the card length', () => {
		const body = 'a'.repeat(300);
		expect(translatedBlogSummary('# 題\n\n本文', `# Title\n\n${body}`).description).toHaveLength(
			200,
		);
	});
});
