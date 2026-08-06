import { preferences } from '$lib/preferences/preferences.svelte';
import { normalizeFeedTabs } from './normalize';
import { DEFAULT_FEED_TABS, type FeedTab } from './types';

/**
 * フィードのタブ構成。真実源はアカウント（AppView）で、localStorage はその端末の
 * キャッシュ。同期できない端末（permission-set が古い等）では localStorage 単独で動く。
 *
 * お気に入り絵文字（$lib/emoji/favorites）とほぼ同じ作りだが、タブバーは常時
 * マウントされているのでリアクティブな singleton を持つ点だけ違う。
 *
 * 重要: このモジュールのトップレベルで localStorage / window に触らないこと。
 * `/global` は prerender=true で、ビルド時に Node で評価される。
 */
const KEY_PREFIX = 'nagi:feed-tabs:v1';

type StoredFeedTabs = { tabs: FeedTab[]; updatedAt: string };

/** 同期が有効な DID。sync 層が設定する。undefined なら未サインイン/未同期。 */
let scopeDid: string | undefined;

export const feedTabsStorageKey = (did?: string) =>
	did ? `${KEY_PREFIX}.${encodeURIComponent(did)}` : `${KEY_PREFIX}.guest`;

/** 同期のスコープを切り替える。アカウント切替とサインアウトで呼ぶ。 */
export function setFeedTabsScope(did: string | undefined) {
	scopeDid = did;
	feedTabs.hydrate();
}

function readKey(key: string): StoredFeedTabs | undefined {
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return undefined;
		const parsed = JSON.parse(raw);
		if (!parsed || !Array.isArray(parsed.tabs)) return undefined;
		return {
			tabs: normalizeFeedTabs(parsed.tabs),
			updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '',
		};
	} catch {
		return undefined;
	}
}

/** 同期用に、この端末が持っている値と最終更新時刻をそのまま返す。 */
export function loadStoredFeedTabs(did: string): StoredFeedTabs | undefined {
	return readKey(feedTabsStorageKey(did));
}

function write(key: string, tabs: FeedTab[], updatedAt: string) {
	try {
		localStorage.setItem(key, JSON.stringify({ tabs, updatedAt }));
	} catch {
		// ストレージが使えなくても、そのセッションのあいだは $state 側で動く。
	}
}

/**
 * サーバーから受け取った内容をこの端末へ書き戻す。編集ではないので push しない
 * （送り返すと updatedAt だけが進み続ける）。
 */
export function adoptFeedTabs(did: string, tabs: FeedTab[], updatedAt: string) {
	write(feedTabsStorageKey(did), tabs, updatedAt);
}

class FeedTabsStore {
	/** 既定値のまま初期化する。プリレンダでもここが評価されるため。 */
	tabs = $state<FeedTab[]>([...DEFAULT_FEED_TABS]);
	/** この端末（このアカウント）が一度でもカスタムしたか。未設定なら既定を出しているだけ。 */
	configured = $state(false);

	/** localStorage から読み直す。browser でのみ呼ぶこと。 */
	hydrate() {
		const stored = readKey(feedTabsStorageKey(scopeDid));
		this.tabs = stored?.tabs ?? [...DEFAULT_FEED_TABS];
		this.configured = Boolean(stored);
	}

	byId(id: string | null | undefined): FeedTab | undefined {
		if (!id) return undefined;
		return this.tabs.find((tab) => tab.id === id);
	}

	/** ?tab= が無い / 消えたタブを指しているときに開くタブ。 */
	get fallback(): FeedTab {
		return this.tabs[0] ?? DEFAULT_FEED_TABS[0];
	}

	/** ユーザーの編集。localStorage へ書き、サーバーへも押し上げる。 */
	replace(next: FeedTab[]) {
		const tabs = normalizeFeedTabs(next);
		const updatedAt = new Date().toISOString();
		this.tabs = tabs;
		this.configured = true;
		write(feedTabsStorageKey(scopeDid), tabs, updatedAt);
		preferences.pushFeedTabs(tabs, updatedAt);
	}

	/** サーバー由来の反映。push はしない。 */
	adopt(tabs: FeedTab[]) {
		this.tabs = normalizeFeedTabs(tabs);
		this.configured = true;
	}
}

export const feedTabs = new FeedTabsStore();
