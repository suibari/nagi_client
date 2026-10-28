import { get } from 'svelte/store';
import { searchEmojis } from '$lib/api/appview';
import type { EmojiView } from '$lib/api/types';
import { displayEmojiName, listMyBluemoji } from '$lib/atproto/bluemoji';
import { session } from '$lib/oauth/session.svelte';
import { loadUnicodeEmojiIndex, searchUnicodeEmojis } from './unicodeSearch';

export type UnicodeEmojiChoice = { emoji: string; label: string };

/** 投稿欄の `:` 補完の1行。カスタム絵文字の後ろに Unicode 絵文字が続く。 */
export type EmojiSuggestion =
	| { kind: 'custom'; emoji: EmojiView }
	| ({ kind: 'unicode' } & UnicodeEmojiChoice);

export type EmojiSearchResult = {
	/** カスタム絵文字。Unicode 絵文字より常に上に並べる。 */
	custom: EmojiView[];
	unicode: UnicodeEmojiChoice[];
};

const isAbort = (error: unknown) => error instanceof DOMException && error.name === 'AbortError';

/**
 * 絵文字の意味検索。AppView が名前の一致 → 意味の近さの順に並べた結果を、
 * カスタム絵文字 → Unicode 絵文字の順で返す。
 *
 * 本人の絵文字は AppView にも載っているが、作った直後はまだ取り込まれていないことがある。
 * そこで本人 PDS のキャッシュから名前で一致したもののうち、AppView の結果に無いものを先頭に足す。
 *
 * AppView が落ちていても、本人の絵文字と手元の Unicode 検索（名前の一致だけ）で返す。
 */
export async function searchEmojiSuggestions(opts: {
	q: string;
	limit: number;
	includeUnicode: boolean;
	locale: string;
	signal?: AbortSignal;
}): Promise<EmojiSearchResult> {
	const q = opts.q.trim();
	if (!q) return { custom: [], unicode: [] };
	const did = get(session)?.did;
	const needle = q.toLowerCase();
	// AppView と同じく、名前の区切り（- _ 空白）の違いは無視する（bottan で :bot-tan_duel:）。
	const flat = (value: string) => value.toLowerCase().replace(/[_\-\s]/g, '');
	const flatNeedle = flat(q);
	const [own, remote] = await Promise.all([
		did
			? listMyBluemoji()
					.then((emojis) =>
						emojis.filter(
							(emoji) =>
								!emoji.adultOnly &&
								((flatNeedle && flat(displayEmojiName(emoji.name)).includes(flatNeedle)) ||
									(emoji.alt?.toLowerCase().includes(needle) ?? false)),
						),
					)
					.catch(() => [])
			: Promise.resolve([]),
		searchEmojis({
			q,
			semantic: true,
			includeUnicode: opts.includeUnicode,
			preferRepo: did,
			limit: opts.limit,
			signal: opts.signal,
		}).catch((error) => {
			if (isAbort(error)) throw error;
			return undefined;
		}),
	]);

	const remoteUris = new Set(remote?.emojis.map((emoji) => emoji.uri));
	const custom = [
		...own.filter((emoji) => !remoteUris.has(emoji.uri)),
		...(remote?.emojis ?? []),
	].slice(0, opts.limit);
	if (!opts.includeUnicode) return { custom, unicode: [] };

	if (remote?.unicode)
		return {
			custom,
			unicode: remote.unicode.map((emoji) => ({
				emoji: emoji.emoji,
				label: opts.locale === 'ja' ? emoji.labelJa : emoji.labelEn,
			})),
		};
	// AppView に届かないときは手元の名前一致だけで出す。これも失敗したら検索失敗として投げる。
	const index = await loadUnicodeEmojiIndex(opts.locale);
	return {
		custom,
		unicode: searchUnicodeEmojis(index, q, opts.limit).map((emoji) => ({
			emoji: emoji.emoji,
			label: emoji.label,
		})),
	};
}
