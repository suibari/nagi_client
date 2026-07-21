import emojiDataUrlJa from 'emoji-picker-element-data/ja/emojibase/data.json?url';
import emojiDataUrlEn from 'emoji-picker-element-data/en/emojibase/data.json?url';

/**
 * emoji-picker-element 内蔵の検索は使わず、ここで自前に検索する。
 * ライブラリ側は2文字未満のクエリ・トークンを捨てるため「炎」のような
 * 1文字の日本語では引けず、また ja データには英語キーワードが無いので
 * "fire" でも引けないため。
 */

type RawEmoji = {
	emoji: string;
	annotation: string;
	tags?: string[];
	shortcodes?: string[];
	order?: number;
};

// 一致した項目の種類。値がそのままスコアの重みになる（小さいほど良い）。
const FIELD_ANNOTATION = 0;
const FIELD_SHORTCODE = 1;
const FIELD_TAG = 2;
const FIELD_COUNT = 3;

export type UnicodeEmoji = {
	emoji: string;
	label: string;
	order: number;
	/** コードポイント数。同点時に単体の絵文字を ZWJ 合字より前に出すために使う。 */
	length: number;
	/** FIELD_* を添字とする、正規化済みキーワード。 */
	fields: string[][];
};

/** NFKC + 小文字化 + ひらがな→カタカナ（「ねこ」と「ネコ」を同一視する）。 */
export function normalizeEmojiText(value: string): string {
	return value
		.normalize('NFKC')
		.toLowerCase()
		.trim()
		.replace(/[ぁ-ゖ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60));
}

async function fetchEmojiData(url: string): Promise<RawEmoji[]> {
	const response = await fetch(url);
	if (!response.ok) throw new Error(`emoji data ${response.status}`);
	return response.json();
}

const indexCache = new Map<string, Promise<UnicodeEmoji[]>>();

/**
 * ja/en 双方のデータを突き合わせて検索用インデックスを作る。
 * 両者は同じ絵文字集合・同じ order を持つので emoji 文字列で結合できる。
 */
export function loadUnicodeEmojiIndex(locale: string): Promise<UnicodeEmoji[]> {
	const cached = indexCache.get(locale);
	if (cached) return cached;

	const promise = (async () => {
		const [ja, en] = await Promise.all([
			fetchEmojiData(emojiDataUrlJa),
			fetchEmojiData(emojiDataUrlEn),
		]);
		const enByEmoji = new Map(en.map((entry) => [entry.emoji, entry]));
		return ja.map((jaEntry) => {
			const enEntry = enByEmoji.get(jaEntry.emoji);
			const fields: Set<string>[] = [new Set(), new Set(), new Set()];
			const add = (field: number, text: string | undefined) => {
				const normalized = normalizeEmojiText(text ?? '');
				if (normalized) fields[field].add(normalized);
			};
			for (const source of [jaEntry, enEntry]) {
				if (!source) continue;
				add(FIELD_ANNOTATION, source.annotation);
				for (const shortcode of source.shortcodes ?? []) add(FIELD_SHORTCODE, shortcode);
				for (const tag of source.tags ?? []) add(FIELD_TAG, tag);
			}
			return {
				emoji: jaEntry.emoji,
				label: (locale === 'ja' ? jaEntry.annotation : enEntry?.annotation) ?? jaEntry.annotation,
				order: jaEntry.order ?? 0,
				length: [...jaEntry.emoji].length,
				fields: fields.map((set) => [...set]),
			};
		});
	})();

	indexCache.set(locale, promise);
	promise.catch(() => indexCache.delete(locale));
	return promise;
}

/**
 * 一致の質をスコア化する。完全一致 < 前方一致 < 部分一致、
 * 同じ種類なら 表示名 < ショートコード < タグ の順に良い。一致しなければ undefined。
 */
function scoreMatch(item: UnicodeEmoji, needle: string): number | undefined {
	let best: number | undefined;
	for (let field = 0; field < FIELD_COUNT; field++) {
		for (const key of item.fields[field]) {
			const at = key.indexOf(needle);
			if (at < 0) continue;
			const kind = key === needle ? 0 : at === 0 ? 1 : 2;
			const score = kind * FIELD_COUNT + field;
			if (best === undefined || score < best) best = score;
		}
		if (best === field) return best; // その種類で完全一致、これ以上は良くならない
	}
	return best;
}

const MAX_MATCH_SCORE = 3 * FIELD_COUNT;
const ASCII_ONLY = /^[\x20-\x7e]+$/;

/** クエリ全体での一致を優先し、無ければ語ごとの AND 一致（英数クエリのみ）で拾う。 */
function scoreQuery(item: UnicodeEmoji, phrase: string, tokens: string[]): number | undefined {
	const phraseScore = scoreMatch(item, phrase);
	if (phraseScore !== undefined) return phraseScore;
	if (tokens.length < 2) return undefined;

	let worst = 0;
	for (const token of tokens) {
		const score = scoreMatch(item, token);
		if (score === undefined) return undefined;
		worst = Math.max(worst, score);
	}
	// 語をばらした一致は、クエリ全体での一致より必ず後ろに置く。
	return MAX_MATCH_SCORE + worst;
}

export function searchUnicodeEmojis(
	index: UnicodeEmoji[],
	query: string,
	limit = 60,
): UnicodeEmoji[] {
	const phrase = normalizeEmojiText(query);
	if (!phrase) return [];
	// 英数クエリは空白区切りに意味があるので語ごとにも見る。
	// 日本語は語が分かち書きされないのでクエリ全体だけで判断する。
	const tokens = ASCII_ONLY.test(phrase) ? phrase.split(/\s+/).filter(Boolean) : [];

	const hits: { item: UnicodeEmoji; score: number }[] = [];
	for (const item of index) {
		const score = scoreQuery(item, phrase, tokens);
		if (score !== undefined) hits.push({ item, score });
	}
	hits.sort(
		(a, b) => a.score - b.score || a.item.length - b.item.length || a.item.order - b.item.order,
	);
	return hits.slice(0, limit).map((hit) => hit.item);
}
