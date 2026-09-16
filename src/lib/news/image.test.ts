import { describe, expect, it } from 'vitest';
import { safeNewsImageUrl } from './image';

describe('safeNewsImageUrl', () => {
	it('accepts an HTTPS image URL', () => {
		expect(safeNewsImageUrl('https://cdn.example.com/news.jpg')).toBe(
			'https://cdn.example.com/news.jpg',
		);
	});

	it.each(['http://example.com/news.jpg', 'data:image/png;base64,AA==', 'not a url', ''])(
		'rejects %s',
		(value) => {
			expect(safeNewsImageUrl(value)).toBeUndefined();
		},
	);
});
