import { preferences } from '$lib/preferences/preferences.svelte';
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

/**
 * お気に入りタグと最近使ったタグ。
 *
 * お気に入りは真実源がアカウント（AppView）で、localStorage はその端末のキャッシュ。
 * 同期できない端末では localStorage 単独で動く（お気に入り絵文字・タブ構成と同じ作り）。
 * 最近使ったタグは端末ごとの履歴で、同期しない。
 *
 * パレット・右クリックメニュー・設定画面で状態を共有するので、リアクティブな singleton を持つ。
 * このモジュールのトップレベルで localStorage に触らないこと（prerender 時に Node で評価される）。
 */
const FAVORITES_PREFIX = 'nagi:tag-favorites:v1';
const RECENTS_PREFIX = 'nagi:tag-recents:v1';

type StoredTagFavorites = { tags: string[]; updatedAt: string };

let scopeDid: string | undefined;

export const tagFavoritesStorageKey = (did?: string) =>
	`${FAVORITES_PREFIX}.${did ? encodeURIComponent(did) : 'guest'}`;
export const recentTagsStorageKey = (did?: string) =>
	`${RECENTS_PREFIX}.${did ? encodeURIComponent(did) : 'guest'}`;

/** アカウント切替とサインアウトで呼ぶ。 */
export function setTagFavoritesScope(did: string | undefined) {
	scopeDid = did;
	tagFavorites.hydrate();
}

function readFavorites(key: string): StoredTagFavorites | undefined {
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return undefined;
		const parsed = JSON.parse(raw);
		if (!parsed || !Array.isArray(parsed.tags)) return undefined;
		return {
			tags: normalizeTagList(parsed.tags, TAG_FAVORITES_LIMIT),
			updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '',
		};
	} catch {
		return undefined;
	}
}

function readRecents(key: string): string[] {
	try {
		const raw = localStorage.getItem(key);
		return raw ? normalizeTagList(JSON.parse(raw), RECENT_TAGS_LIMIT) : [];
	} catch {
		return [];
	}
}

function write(key: string, value: unknown) {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch {
		// ストレージが使えなくても、そのセッションのあいだは $state 側で動く。
	}
}

/** 同期用に、この端末が持っている値と最終更新時刻をそのまま返す。 */
export function loadStoredTagFavorites(did: string): StoredTagFavorites | undefined {
	return readFavorites(tagFavoritesStorageKey(did));
}

/**
 * サーバーから受け取った内容をこの端末へ書き戻す。編集ではないので push しない
 * （送り返すと updatedAt だけが進み続ける）。表示中のスコープなら画面にも反映する。
 */
export function adoptTagFavorites(did: string, tags: string[], updatedAt: string) {
	const normalized = normalizeTagList(tags, TAG_FAVORITES_LIMIT);
	write(tagFavoritesStorageKey(did), { tags: normalized, updatedAt });
	if (did === scopeDid) tagFavorites.favorites = normalized;
}

class TagFavoritesStore {
	favorites = $state<string[]>([]);
	recents = $state<string[]>([]);

	/** localStorage から読み直す。browser でのみ呼ぶこと。 */
	hydrate() {
		this.favorites = readFavorites(tagFavoritesStorageKey(scopeDid))?.tags ?? [];
		this.recents = readRecents(recentTagsStorageKey(scopeDid));
	}

	get full() {
		return this.favorites.length >= TAG_FAVORITES_LIMIT;
	}

	has(tag: string) {
		const normalized = toStoredTag(tag);
		return Boolean(normalized) && this.favorites.includes(normalized!);
	}

	/** 入らなかった（満杯・不正）ときは false。既にあれば true。 */
	add(tag: string): boolean {
		const next = addTag(this.favorites, tag);
		if (next === this.favorites) return this.has(tag);
		this.#save(next);
		return true;
	}

	remove(tag: string) {
		this.#save(removeTag(this.favorites, tag));
	}

	toggle(tag: string): boolean {
		if (this.has(tag)) {
			this.remove(tag);
			return true;
		}
		return this.add(tag);
	}

	move(index: number, delta: -1 | 1) {
		const next = moveTag(this.favorites, index, delta);
		if (next !== this.favorites) this.#save(next);
	}

	/** 投稿に成功したときに、その投稿で使ったタグを履歴へ積む。 */
	recordUsed(tags: string[]) {
		if (!tags.length) return;
		this.recents = pushRecentTags(this.recents, tags);
		write(recentTagsStorageKey(scopeDid), this.recents);
	}

	#save(tags: string[]) {
		const updatedAt = new Date().toISOString();
		this.favorites = tags;
		write(tagFavoritesStorageKey(scopeDid), { tags, updatedAt });
		preferences.pushTagFavorites(tags, updatedAt);
	}
}

export const tagFavorites = new TagFavoritesStore();
