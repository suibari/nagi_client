import { get } from 'svelte/store';
import type { EmojiFavorite, PreferencesView } from '$lib/api/types';
import type { ReactionChoice } from '$lib/emoji/reactionUsage';
import {
	adoptFavorites,
	favoritesStorageKey,
	loadStoredFavorites,
	saveFavorites,
	setFavoritesScope,
	unionFavorites,
} from '$lib/emoji/favorites';
import {
	adoptFeedTabs,
	feedTabs,
	feedTabsStorageKey,
	loadStoredFeedTabs,
	setFeedTabsScope,
} from '$lib/feed-tabs/feed-tabs.svelte';
import { feedTabLabelsStorageKey } from '$lib/feed-tabs/labels.svelte';
import { myNagiStorageKey, type MyNagiUnreadSection } from '$lib/my-nagi/unread.svelte';
import { newsStorageKey } from '$lib/news/unread.svelte';
import { session } from '$lib/oauth/session.svelte';
import { clearSections, reconcileSections, sectionWatermark } from '$lib/unread/sections.svelte';
import { preferences } from './preferences.svelte';

/**
 * サーバーの設定をこの端末へ、この端末の設定をサーバーへ流し込む層。
 * トランスポート（`./preferences.svelte`）とストレージ（favorites / watermark）の
 * あいだに置くことで、どちらからも逆向きの import を作らずに済む。
 */
const FIRST_SYNC_PREFIX = 'nagi:emoji-favorites-synced';

const firstSyncKey = (did: string) => `${FIRST_SYNC_PREFIX}.${encodeURIComponent(did)}`;

function hasSyncedBefore(did: string): boolean {
	try {
		return localStorage.getItem(firstSyncKey(did)) === '1';
	} catch {
		// ストレージが使えない端末では毎回「初回」＝和集合になる。
		// 黙って失うより、1回多く足す方を選ぶ。
		return false;
	}
}

function markSynced(did: string) {
	try {
		localStorage.setItem(firstSyncKey(did), '1');
	} catch {
		// 記録できなくても同期自体は成立する。
	}
}

/**
 * お気に入りの突き合わせ。
 * - 初回（この端末×このアカウントで初めて）は和集合。単純な後勝ちにすると、サーバーが
 *   空の状態で端末Aと端末Bが別々の一覧を持っていたとき、後から同期した側が消える。
 * - 2回目以降は updatedAt による後勝ち。
 */
function applyFavorites(did: string, view: PreferencesView) {
	const local = loadStoredFavorites(did);
	const remote = view.emojiFavorites as ReactionChoice[];
	const remoteUpdatedAt = view.emojiFavoritesUpdatedAt;

	if (!hasSyncedBefore(did)) {
		const merged = unionFavorites(remote, local?.choices ?? []);
		markSynced(did);
		if (merged.length === remote.length) {
			// 和集合が増えていない＝サーバーと同じ。updatedAt を無駄に進めない。
			if (remoteUpdatedAt) adoptFavorites(did, remote, remoteUpdatedAt);
			return;
		}
		saveFavorites(merged);
		return;
	}

	// ISO 8601(UTC) 同士なので文字列比較がそのまま時刻順になる。
	const localUpdatedAt = local?.updatedAt ?? '';
	if (remoteUpdatedAt && remoteUpdatedAt > localUpdatedAt) {
		adoptFavorites(did, remote, remoteUpdatedAt);
		return;
	}
	// ローカルの方が本当に新しいときだけ押し上げる。同着で saveFavorites を呼ぶと
	// サインインのたびに updatedAt だけが進み、この端末が常に後勝ちしてしまう。
	if (local && localUpdatedAt > (remoteUpdatedAt ?? ''))
		preferences.pushFavorites(local.choices as EmojiFavorite[], localUpdatedAt);
}

/**
 * フィードのタブ構成の突き合わせ。お気に入りと違い**和集合はしない** — 順序のある
 * 1本の設定で、和集合すると同じタブが2枚並ぶ。純粋に updatedAt の後勝ち。
 * どちらにも記録が無ければ何もしない（既定タブのまま。勝手に保存すると、将来
 * 既定を変えてもこの人には反映されなくなる）。
 */
function applyFeedTabs(did: string, view: PreferencesView) {
	const local = loadStoredFeedTabs(did);
	const remoteUpdatedAt = view.feedTabsUpdatedAt;
	const localUpdatedAt = local?.updatedAt ?? '';
	// ISO 8601(UTC) 同士なので文字列比較がそのまま時刻順になる。
	if (remoteUpdatedAt && remoteUpdatedAt > localUpdatedAt) {
		adoptFeedTabs(did, view.feedTabs, remoteUpdatedAt);
		feedTabs.adopt(view.feedTabs);
		return;
	}
	if (local && localUpdatedAt > (remoteUpdatedAt ?? ''))
		preferences.pushFeedTabs(local.tabs, localUpdatedAt);
}

let syncing: Promise<void> = Promise.resolve();
let syncedDid: string | undefined;

/** 同期の完了を待ちたい処理（お気に入りパレットの事前解決など）から使う。 */
export const preferencesReady = () => syncing;

/**
 * サインイン状態が変わるたびに呼ぶ。DID が同じあいだは1回しか走らない。
 * 失敗しても投げない（同期はあくまで付加機能で、無くても全機能が動く）。
 */
export function syncPreferences(did: string | undefined): Promise<void> {
	if (!did) {
		syncedDid = undefined;
		setFavoritesScope(undefined);
		setFeedTabsScope(undefined);
		preferences.clear();
		syncing = Promise.resolve();
		return syncing;
	}
	if (syncedDid === did) return syncing;
	syncedDid = did;
	// タブ構成はサーバー同期の成否に関わらずアカウント単位。load を待たずに切り替える
	// （待つと、同期できない端末で guest のタブを見せたまま guest のキーへ書いてしまう）。
	setFeedTabsScope(did);
	syncing = (async () => {
		const view = await preferences.load();
		if (!view || get(session)?.did !== did) return;
		// ここから先の保存はアカウント（DID スコープ）のキャッシュへ書く。
		setFavoritesScope(did);
		// ニュースだけはサインイン前（guest スコープ）に作られていることがある。
		// アカウント側のキーへ差し替えてから突き合わせる。
		sectionWatermark('news', newsStorageKey(did), did);
		reconcileSections(did);
		applyFavorites(did, view);
		applyFeedTabs(did, view);
	})();
	return syncing;
}

const MY_NAGI_SECTIONS: MyNagiUnreadSection[] = ['bot', 'community', 'list', 'channels'];
/**
 * DID スコープへ移行する前に使っていたキー。移行前から使っている端末には
 * まだ残っているので、全データ削除ではこれらも消す。
 */
const PRE_SCOPE_KEYS = ['nagi.news-read-state.v1', 'nagi.my-nagi-read-state.v1.bot.public'];

/**
 * 同期していた設定の端末側キャッシュを消す。全データ削除で AppView の行を消しても、
 * ここを消さないと既読位置とお気に入りがこの端末に残り続ける。
 * サインアウト前のスコープ（DID）と、旧キー・guest スコープの両方を対象にする。
 */
export function clearLocalPreferenceCache(did: string) {
	const keys = [
		favoritesStorageKey(),
		favoritesStorageKey(did),
		firstSyncKey(did),
		feedTabsStorageKey(),
		feedTabsStorageKey(did),
		feedTabLabelsStorageKey,
		newsStorageKey(),
		newsStorageKey(did),
		...MY_NAGI_SECTIONS.flatMap((section) => [
			myNagiStorageKey(section),
			myNagiStorageKey(section, did),
		]),
		...PRE_SCOPE_KEYS,
	];
	for (const key of keys) {
		try {
			localStorage.removeItem(key);
		} catch {
			// 消せない端末でもアカウント削除自体は完了している。
		}
	}
	clearSections();
	setFavoritesScope(undefined);
	setFeedTabsScope(undefined);
	syncedDid = undefined;
}

// 送信結果（マージ後の確定値）でローカルを整える。押し返さないと、端末ごとに違う値を
// 持ったまま「同期したつもり」になる。
preferences.subscribeMerged((view, sent) => {
	const did = get(session)?.did;
	if (!did) return;
	reconcileSections(did);
	// 送っていない項目を応答で上書きすると、デバウンス待ちの編集を巻き戻して
	// しまう。自分が送った回の結果だけ取り込む。
	if (sent.favorites && view.emojiFavoritesUpdatedAt)
		adoptFavorites(did, view.emojiFavorites as ReactionChoice[], view.emojiFavoritesUpdatedAt);
	if (sent.feedTabs && view.feedTabsUpdatedAt) {
		adoptFeedTabs(did, view.feedTabs, view.feedTabsUpdatedAt);
		feedTabs.adopt(view.feedTabs);
	}
});
