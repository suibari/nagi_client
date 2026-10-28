import type { EmojiView } from '$lib/api/types';

export type ComposerSuggestionToken =
	| { kind: 'mention'; start: number; end: number; query: string }
	| { kind: 'tag'; start: number; end: number; query: string; marker: '#' | '＃' }
	| { kind: 'emoji'; start: number; end: number; query: string };

export function detectComposerSuggestionToken(
	value: string,
	caret: number,
	options: { mentions: boolean },
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
	// facets.ts と同じく、行頭か空白の直後の # / ＃ だけをハッシュタグとして扱う。
	const tag = /(^|\s)([#＃])([^\s#＃]+)$/u.exec(before);
	if (tag)
		return {
			kind: 'tag',
			start: caret - tag[3].length - 1,
			end: caret,
			query: tag[3],
			marker: tag[2] as '#' | '＃',
		};
	// 絵文字は意味でも探すので、名前に使えない日本語（:ねこ）も検索語として受ける。
	// 記号は受けない（顔文字の :) や URL の途中を候補にしない）。
	const emoji = /(^|[\s(\[{]):([\p{L}\p{N}_-]+)$/u.exec(before);
	if (emoji?.[2])
		return {
			kind: 'emoji',
			start: caret - emoji[2].length - 1,
			end: caret,
			query: emoji[2],
		};
}

/** カスタム絵文字は :name: に、Unicode 絵文字はその文字に置き換える。 */
export function replaceEmojiSuggestion(
	value: string,
	token: Extract<ComposerSuggestionToken, { kind: 'emoji' }>,
	emoji: EmojiView | string,
) {
	const inserted = typeof emoji === 'string' ? emoji.normalize('NFC') : emoji.name;
	const text = `${value.slice(0, token.start)}${inserted}${value.slice(token.end)}`;
	return {
		text,
		start: token.start,
		end: token.start + inserted.length,
		delta: inserted.length - (token.end - token.start),
	};
}
