import { normalizeTag } from '$lib/tags';

/** お気に入りタグの上限と1つの長さ。AppView の TAG_FAVORITES_LIMIT / TAG_FAVORITE_MAX_LENGTH と揃える。 */
export const TAG_FAVORITES_LIMIT = 32;
export const TAG_MAX_LENGTH = 64;
/** 最近使ったタグの上限。端末ローカルの履歴なので、パレットに収まる程度で十分。 */
export const RECENT_TAGS_LIMIT = 24;

/** 保存できる正規形にする。空・長すぎ・空白入りは undefined。 */
export function toStoredTag(raw: string): string | undefined {
	const tag = normalizeTag(raw);
	if (!tag || tag.length > TAG_MAX_LENGTH || /\s/.test(tag)) return undefined;
	return tag;
}

/** 正規化し、空と重複を落として上限で切る。並びは先勝ち。 */
export function normalizeTagList(input: unknown, limit: number): string[] {
	if (!Array.isArray(input)) return [];
	const seen = new Set<string>();
	const tags: string[] = [];
	for (const raw of input) {
		if (typeof raw !== 'string') continue;
		const tag = toStoredTag(raw);
		if (!tag || seen.has(tag)) continue;
		seen.add(tag);
		tags.push(tag);
		if (tags.length >= limit) break;
	}
	return tags;
}

/**
 * 末尾に足す。既にあれば並びを変えず、満杯なら元の配列をそのまま返す
 * （呼び出し側は参照の同一性で「入らなかった」ことを判定できる）。
 */
export function addTag(tags: string[], raw: string): string[] {
	const tag = toStoredTag(raw);
	if (!tag || tags.includes(tag) || tags.length >= TAG_FAVORITES_LIMIT) return tags;
	return [...tags, tag];
}

export function removeTag(tags: string[], raw: string): string[] {
	const tag = normalizeTag(raw);
	return tags.filter((item) => item !== tag);
}

/** index の要素を1つ前（-1）/後ろ（+1）へ動かす。端なら元の配列。 */
export function moveTag(tags: string[], index: number, delta: -1 | 1): string[] {
	const target = index + delta;
	if (index < 0 || index >= tags.length || target < 0 || target >= tags.length) return tags;
	const next = [...tags];
	[next[index], next[target]] = [next[target], next[index]];
	return next;
}

/** 今回使ったタグを先頭へ積む（本文の出現順を保つ）。 */
export function pushRecentTags(recents: string[], used: string[]): string[] {
	return normalizeTagList([...used, ...recents], RECENT_TAGS_LIMIT);
}
