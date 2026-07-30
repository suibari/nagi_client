import type { EmojiView } from '$lib/api/types';
import {
	reactionChoiceKey,
	refreshReactionChoices,
	validChoice,
	type ReactionChoice,
} from './reactionUsage';

const FAVORITES_KEY = 'nagi:emoji-favorites:v1';
const MAX_FAVORITES = 32;

/** 配列の順序がそのまま表示順。並び替えは配列を差し替えて保存する。 */
export function loadFavorites(): ReactionChoice[] {
	try {
		const stored = JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? '[]');
		if (!Array.isArray(stored)) return [];
		return stored.filter(validChoice).slice(0, MAX_FAVORITES);
	} catch {
		return [];
	}
}

export function saveFavorites(favorites: ReactionChoice[]) {
	try {
		localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites.slice(0, MAX_FAVORITES)));
	} catch {
		// ストレージが使えなくてもリアクション自体は動かす。
	}
}

export async function refreshFavorites(favorites: ReactionChoice[]): Promise<ReactionChoice[]> {
	const refreshed = await refreshReactionChoices(favorites);
	saveFavorites(refreshed);
	return refreshed;
}

const toChoice = (raw: string | EmojiView): ReactionChoice =>
	typeof raw === 'string'
		? { kind: 'unicode', emoji: raw.normalize('NFC') }
		: { kind: 'custom', emoji: raw };

/** 既にお気に入りなら並びを変えず何もしない。新規は末尾に足す。 */
export function addFavorite(
	favorites: ReactionChoice[],
	raw: string | EmojiView,
): ReactionChoice[] {
	const choice = toChoice(raw);
	const key = reactionChoiceKey(choice);
	if (favorites.some((item) => reactionChoiceKey(item) === key)) return favorites;
	const next = [...favorites, choice].slice(0, MAX_FAVORITES);
	saveFavorites(next);
	return next;
}

export function removeFavorite(favorites: ReactionChoice[], key: string): ReactionChoice[] {
	const next = favorites.filter((item) => reactionChoiceKey(item) !== key);
	saveFavorites(next);
	return next;
}

export function isFavorite(favorites: ReactionChoice[], raw: string | EmojiView): boolean {
	const key = reactionChoiceKey(toChoice(raw));
	return favorites.some((item) => reactionChoiceKey(item) === key);
}

export const favoritesFull = (favorites: ReactionChoice[]) => favorites.length >= MAX_FAVORITES;
