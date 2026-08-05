import type { EmojiFavorite, EmojiView } from '$lib/api/types';
import { preferences } from '$lib/preferences/preferences.svelte';
import {
	reactionChoiceKey,
	refreshReactionChoices,
	validChoice,
	type ReactionChoice,
} from './reactionUsage';

/**
 * お気に入り絵文字パレット。真実源はアカウント（AppView）で、localStorage は
 * その端末のキャッシュ。同期できない端末（permission-set が古い等）では
 * localStorage 単独で従来どおり動く。
 *
 * 同期が有効なあいだはキーに DID を付ける。旧 v1 キーは DID で分かれておらず、
 * 1台で複数アカウントを使うと相手の一覧を引き継いでしまうため。
 */
const LEGACY_KEY = 'nagi:emoji-favorites:v1';
const KEY_PREFIX = 'nagi:emoji-favorites:v2';
const MAX_FAVORITES = 32;

type StoredFavorites = { choices: ReactionChoice[]; updatedAt: string };

/** 同期が有効な DID。sync 層が設定する。undefined なら未サインイン/未同期。 */
let scopeDid: string | undefined;

export const favoritesStorageKey = (did?: string) =>
	did ? `${KEY_PREFIX}.${encodeURIComponent(did)}` : LEGACY_KEY;

/** 同期のスコープを切り替える。アカウント切替とサインアウトで呼ぶ。 */
export function setFavoritesScope(did: string | undefined) {
	scopeDid = did;
}

function readKey(key: string): StoredFavorites | undefined {
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return undefined;
		const parsed = JSON.parse(raw);
		// v1 は生の配列。updatedAt を持たないので、初回同期の和集合でしか使わない。
		if (Array.isArray(parsed))
			return { choices: parsed.filter(validChoice).slice(0, MAX_FAVORITES), updatedAt: '' };
		if (!parsed || !Array.isArray(parsed.choices)) return undefined;
		return {
			choices: parsed.choices.filter(validChoice).slice(0, MAX_FAVORITES),
			updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '',
		};
	} catch {
		return undefined;
	}
}

/** 配列の順序がそのまま表示順。並び替えは配列を差し替えて保存する。 */
export function loadFavorites(): ReactionChoice[] {
	// DID スコープへ移行済みでもキャッシュがまだ無い端末では、旧キーの内容を見せる
	// （初回同期が終わるまでパレットが空に見えないように）。
	const stored =
		readKey(favoritesStorageKey(scopeDid)) ?? (scopeDid ? readKey(LEGACY_KEY) : undefined);
	return stored?.choices ?? [];
}

/** 同期用に、この端末が持っている値と最終更新時刻をそのまま返す。 */
export function loadStoredFavorites(did: string): StoredFavorites | undefined {
	return readKey(favoritesStorageKey(did)) ?? readKey(LEGACY_KEY);
}

function write(key: string, choices: ReactionChoice[], updatedAt: string) {
	try {
		localStorage.setItem(key, JSON.stringify({ choices, updatedAt }));
	} catch {
		// ストレージが使えなくてもリアクション自体は動かす。
	}
}

export function saveFavorites(favorites: ReactionChoice[]) {
	const choices = favorites.slice(0, MAX_FAVORITES);
	const updatedAt = new Date().toISOString();
	write(favoritesStorageKey(scopeDid), choices, updatedAt);
	preferences.pushFavorites(choices as EmojiFavorite[], updatedAt);
}

/**
 * サーバーから受け取った内容をこの端末へ書き戻す。編集ではないので push しない
 * （送り返すと updatedAt だけが進み続ける）。
 */
export function adoptFavorites(did: string, choices: ReactionChoice[], updatedAt: string) {
	write(favoritesStorageKey(did), choices.slice(0, MAX_FAVORITES), updatedAt);
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

/**
 * 2つの一覧の和集合。先に渡した方の順序を保ち、片方にしか無いものを末尾へ足す。
 * 初回同期でしか使わない: 単純な後勝ちだと、サーバーが空の状態で端末Aと端末Bが
 * 別々の一覧を持っていたとき、後から同期した側の一覧が移行の瞬間に消えてしまう。
 */
export function unionFavorites(
	primary: ReactionChoice[],
	secondary: ReactionChoice[],
): ReactionChoice[] {
	const merged = [...primary];
	const keys = new Set(merged.map(reactionChoiceKey));
	for (const choice of secondary) {
		if (merged.length >= MAX_FAVORITES) break;
		const key = reactionChoiceKey(choice);
		if (keys.has(key)) continue;
		keys.add(key);
		merged.push(choice);
	}
	return merged;
}

/**
 * 既にお気に入りなら並びを変えず何もしない。新規は末尾に足す。
 * 満杯のときも元の配列をそのまま返す（末尾に足してから slice すると、
 * 足したはずの絵文字自身が切り捨てられて無言の no-op になる）。
 */
export function addFavorite(
	favorites: ReactionChoice[],
	raw: string | EmojiView,
): ReactionChoice[] {
	return insertFavorite(favorites, raw, favorites.length);
}

/**
 * 指定位置に差し込む。既にお気に入りなら並びを変えず何もしない。
 * 満杯のときは元の配列をそのまま返すので、呼び出し側は参照の同一性で
 * 「入らなかった」ことを判定できる（末尾を黙って切り捨てない）。
 */
export function insertFavorite(
	favorites: ReactionChoice[],
	raw: string | EmojiView,
	index: number,
): ReactionChoice[] {
	const choice = toChoice(raw);
	const key = reactionChoiceKey(choice);
	if (favorites.some((item) => reactionChoiceKey(item) === key)) return favorites;
	if (favoritesFull(favorites)) return favorites;
	const next = [...favorites];
	next.splice(Math.max(0, Math.min(index, next.length)), 0, choice);
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
