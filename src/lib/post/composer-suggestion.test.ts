import { describe, expect, it } from 'vitest';
import type { EmojiView } from '$lib/api/types';
import { detectComposerSuggestionToken, replaceEmojiSuggestion } from './composer-suggestion';

const options = { mentions: true, channels: true };

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

	it('does not treat punctuation, URLs, times, or an empty colon as an emoji query', () => {
		expect(detectComposerSuggestionToken(':', 1, options)).toBeUndefined();
		expect(detectComposerSuggestionToken('12:30', 5, options)).toBeUndefined();
		expect(detectComposerSuggestionToken('https://example.com', 19, options)).toBeUndefined();
		expect(detectComposerSuggestionToken('word:cat', 8, options)).toBeUndefined();
		expect(detectComposerSuggestionToken(':猫', 2, options)).toBeUndefined();
	});

	it('preserves mention and channel detection precedence', () => {
		expect(detectComposerSuggestionToken('@alice', 6, options)?.kind).toBe('mention');
		expect(detectComposerSuggestionToken('#nagi', 5, options)?.kind).toBe('channel');
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
});
