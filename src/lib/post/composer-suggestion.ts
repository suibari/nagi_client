import type { EmojiView } from '$lib/api/types';

export type ComposerSuggestionToken =
	| { kind: 'mention'; start: number; end: number; query: string }
	| { kind: 'channel'; start: number; end: number; query: string; marker: '#' | '＃' }
	| { kind: 'emoji'; start: number; end: number; query: string };

export function detectComposerSuggestionToken(
	value: string,
	caret: number,
	options: { mentions: boolean; channels: boolean },
): ComposerSuggestionToken | undefined {
	const before = value.slice(0, caret);
	const mention = options.mentions ? /(^|[\s(\[{])@([^\s@]*)$/.exec(before) : undefined;
	if (mention?.[2])
		return {
			kind: 'mention',
			start: caret - mention[2].length - 1,
			end: caret,
			query: mention[2],
		};
	const channel = options.channels ? /(^|[\s(\[{])([#＃])([^\s#＃]*)$/.exec(before) : undefined;
	if (channel?.[3])
		return {
			kind: 'channel',
			start: caret - channel[3].length - 1,
			end: caret,
			query: channel[3],
			marker: channel[2] as '#' | '＃',
		};
	const emoji = /(^|[\s(\[{]):([A-Za-z0-9_-]+)$/.exec(before);
	if (emoji?.[2])
		return {
			kind: 'emoji',
			start: caret - emoji[2].length - 1,
			end: caret,
			query: emoji[2],
		};
}

export function replaceEmojiSuggestion(
	value: string,
	token: Extract<ComposerSuggestionToken, { kind: 'emoji' }>,
	emoji: EmojiView,
) {
	const text = `${value.slice(0, token.start)}${emoji.name}${value.slice(token.end)}`;
	return {
		text,
		start: token.start,
		end: token.start + emoji.name.length,
		delta: emoji.name.length - (token.end - token.start),
	};
}
