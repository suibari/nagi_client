import { describe, expect, it } from 'vitest';
import type { EmojiView } from '$lib/api/types';
import { detectComposerSuggestionToken, replaceEmojiSuggestion } from './composer-suggestion';

const options = { mentions: true };

describe('detectComposerSuggestionToken', () => {
	it('detects a custom emoji query at line start or after whitespace', () => {
		expect(detectComposerSuggestionToken(':cat', 4, options)).toEqual({
			kind: 'emoji',
			start: 0,
			end: 4,
			query: 'cat',
		});
		expect(detectComposerSuggestionToken('hello :party_hat', 16, options)?.kind).toBe('emoji');
	});

	it('accepts a Japanese query because emoji are also searched by meaning', () => {
		expect(detectComposerSuggestionToken(':ねこ', 3, options)).toEqual({
			kind: 'emoji',
			start: 0,
			end: 3,
			query: 'ねこ',
		});
		expect(detectComposerSuggestionToken('今日は :お疲れ', 8, options)?.kind).toBe('emoji');
	});

	it('does not treat punctuation, URLs, times, or an empty colon as an emoji query', () => {
		expect(detectComposerSuggestionToken(':', 1, options)).toBeUndefined();
		expect(detectComposerSuggestionToken('12:30', 5, options)).toBeUndefined();
		expect(detectComposerSuggestionToken('https://example.com', 19, options)).toBeUndefined();
		expect(detectComposerSuggestionToken('word:cat', 8, options)).toBeUndefined();
		expect(detectComposerSuggestionToken('時刻:猫', 4, options)).toBeUndefined();
		expect(detectComposerSuggestionToken(':)', 2, options)).toBeUndefined();
	});

	it('detects mentions', () => {
		expect(detectComposerSuggestionToken('@alice', 6, options)?.kind).toBe('mention');
	});

	it('detects a hashtag query at line start or after whitespace, keeping the marker', () => {
		expect(detectComposerSuggestionToken('#nagi', 5, options)).toEqual({
			kind: 'tag',
			start: 0,
			end: 5,
			query: 'nagi',
			marker: '#',
		});
		expect(detectComposerSuggestionToken('今日の ＃さんぽ', 9, options)).toEqual({
			kind: 'tag',
			start: 5,
			end: 9,
			query: 'さんぽ',
			marker: '＃',
		});
	});

	it('does not treat an empty marker, URL fragments, or a mid-word # as a hashtag query', () => {
		expect(detectComposerSuggestionToken('#', 1, options)).toBeUndefined();
		expect(detectComposerSuggestionToken('https://example.com/#top', 24, options)).toBeUndefined();
		expect(detectComposerSuggestionToken('C#', 2, options)).toBeUndefined();
		expect(detectComposerSuggestionToken('#nagi ', 6, options)).toBeUndefined();
	});
});

describe('replaceEmojiSuggestion', () => {
	it('replaces the whole query with the canonical alias and returns its range', () => {
		const emoji = { name: ':cat_party:' } as EmojiView;
		const result = replaceEmojiSuggestion(
			'hello :cat world',
			{ kind: 'emoji', start: 6, end: 10, query: 'cat' },
			emoji,
		);
		expect(result).toEqual({
			text: 'hello :cat_party: world',
			start: 6,
			end: 17,
			delta: 7,
		});
	});

	it('replaces the query with the character itself for a Unicode emoji', () => {
		const result = replaceEmojiSuggestion(
			'hello :ねこ world',
			{ kind: 'emoji', start: 6, end: 9, query: 'ねこ' },
			'🐱',
		);
		expect(result).toEqual({ text: 'hello 🐱 world', start: 6, end: 8, delta: -1 });
	});
});
