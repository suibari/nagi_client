import { describe, expect, it } from 'vitest';
import { hashtagHref, normalizeTag } from './tags';

describe('normalizeTag', () => {
	it('drops leading # / ＃ and surrounding spaces, and lowercases', () => {
		expect(normalizeTag('  #Nagi ')).toBe('nagi');
		expect(normalizeTag('＃＃雑談')).toBe('雑談');
		expect(normalizeTag('#')).toBe('');
	});
});

describe('hashtagHref', () => {
	it('links to the tag mode of the search page', () => {
		expect(hashtagHref('#Nagi 雑談')).toBe('/search?tag=nagi%20%E9%9B%91%E8%AB%87');
	});
});
