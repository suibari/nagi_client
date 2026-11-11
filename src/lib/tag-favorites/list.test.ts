import { describe, expect, it } from 'vitest';
import {
	addTag,
	moveTag,
	normalizeTagList,
	pushRecentTags,
	RECENT_TAGS_LIMIT,
	removeTag,
	TAG_FAVORITES_LIMIT,
	toStoredTag,
} from './list';

describe('toStoredTag', () => {
	it('normalizes to the lowercase form without #', () => {
		expect(toStoredTag(' ＃Nagi ')).toBe('nagi');
	});
	it('rejects empty, too long and spaced tags', () => {
		expect(toStoredTag('#')).toBeUndefined();
		expect(toStoredTag('a'.repeat(65))).toBeUndefined();
		expect(toStoredTag('two words')).toBeUndefined();
	});
});

describe('normalizeTagList', () => {
	it('drops invalid and duplicate entries, keeping the first order', () => {
		expect(normalizeTagList(['#B', 'a', 'b', 1, '', 'A'], 10)).toEqual(['b', 'a']);
		expect(normalizeTagList('nope', 10)).toEqual([]);
	});
});

describe('addTag', () => {
	it('appends new tags and keeps existing ones in place', () => {
		const tags = ['a', 'b'];
		expect(addTag(tags, '#C')).toEqual(['a', 'b', 'c']);
		expect(addTag(tags, 'A')).toBe(tags);
	});
	it('returns the same array when full or invalid', () => {
		const full = Array.from({ length: TAG_FAVORITES_LIMIT }, (_, i) => `t${i}`);
		expect(addTag(full, 'new')).toBe(full);
		expect(addTag(['a'], '#')).toEqual(['a']);
	});
});

describe('removeTag / moveTag', () => {
	it('removes by the normalized form', () => {
		expect(removeTag(['a', 'b'], '#A')).toEqual(['b']);
	});
	it('swaps with a neighbour and ignores moves past the ends', () => {
		const tags = ['a', 'b', 'c'];
		expect(moveTag(tags, 1, -1)).toEqual(['b', 'a', 'c']);
		expect(moveTag(tags, 1, 1)).toEqual(['a', 'c', 'b']);
		expect(moveTag(tags, 0, -1)).toBe(tags);
		expect(moveTag(tags, 2, 1)).toBe(tags);
	});
});

describe('pushRecentTags', () => {
	it('puts the used tags first in body order without duplicates', () => {
		expect(pushRecentTags(['x', 'b'], ['B', 'c'])).toEqual(['b', 'c', 'x']);
	});
	it('caps the history', () => {
		const recents = Array.from({ length: RECENT_TAGS_LIMIT }, (_, i) => `t${i}`);
		const next = pushRecentTags(recents, ['new']);
		expect(next).toHaveLength(RECENT_TAGS_LIMIT);
		expect(next[0]).toBe('new');
	});
});
