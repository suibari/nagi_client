import { describe, expect, it } from 'vitest';
import { splitArticleText } from './articleText';

describe('splitArticleText', () => {
	it('splits the leading heading from the body', () => {
		expect(splitArticleText('# 雨の日\n\n本文です')).toEqual({
			title: '雨の日',
			body: '本文です',
			prefix: '# 雨の日\n\n',
		});
	});

	it('treats the whole text as body when there is no heading', () => {
		const result = splitArticleText('見出しのない本文');
		expect(result.body).toBe('見出しのない本文');
		expect(result.prefix).toBe('');
	});

	it('uses the first line as the title when a translation dropped the heading marker', () => {
		expect(splitArticleText('A Rainy Day\n\nThe body.', true)).toEqual({
			title: 'A Rainy Day',
			body: 'The body.',
			prefix: 'A Rainy Day\n\n',
		});
	});

	it('keeps the translated heading when the marker survived', () => {
		const result = splitArticleText('# A Rainy Day\n\nThe body.', true);
		expect(result.title).toBe('A Rainy Day');
		expect(result.body).toBe('The body.');
	});
});
