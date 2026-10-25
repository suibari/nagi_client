import {
	DEFAULT_FEED_TABS,
	DEFAULT_SOURCE,
	FEED_TAB_KINDS,
	FEED_TABS_LIMIT,
	MAX_TAB_LABEL_LENGTH,
	MAX_TAB_QUERY_LENGTH,
	newTabId,
	tabIdentity,
	type FeedTab,
	type FeedTabKind,
} from './types';
import { isFeedGeneratorUri } from '$lib/bsky/links';
import { normalizeTag } from '$lib/tags';

/**
 * 他人が書いた JSON として扱う。サーバー（AppView の parseFeedTabs）と同じルールで
 * 落とす — 片方だけ緩いと、弾かれずに入った値で描画側が落ちる。
 *
 * 直すのではなく捨てる方針。壊れた1枚のために全部を既定へ戻すと、その端末の設定が
 * 黙って消えるので、読める分だけ残す。
 */
function parseTab(raw: unknown): FeedTab | undefined {
	if (!raw || typeof raw !== 'object') return undefined;
	const item = raw as Record<string, unknown>;
	const kind = item.kind as FeedTabKind;
	if (!FEED_TAB_KINDS.includes(kind)) return undefined;
	const tab: FeedTab = { id: typeof item.id === 'string' ? item.id : '', kind };
	if (typeof item.label === 'string' && item.label)
		tab.label = item.label.slice(0, MAX_TAB_LABEL_LENGTH);
	// list / custom は今それぞれ1つずつしか無いので、未知の source（将来のクライアントが
	// 書いたもの）は素通しせず既定へ寄せる。
	if (kind === 'list' || kind === 'custom') tab.source = DEFAULT_SOURCE[kind];
	if (kind === 'search' || kind === 'hashtag') {
		const raw = typeof item.query === 'string' ? item.query : '';
		const query = kind === 'hashtag' ? normalizeTag(raw) : raw.trim();
		if (!query || query.length > MAX_TAB_QUERY_LENGTH) return undefined;
		tab.query = query;
	}
	// Bluesky のホームタイムラインは uri を持たず source: following で指す（AppView と同じ規則）。
	if (kind === 'bsky' && item.source !== undefined) {
		if (item.source !== 'following' || item.uri !== undefined) return undefined;
		tab.source = 'following';
	} else if (kind === 'bsky') {
		if (typeof item.uri !== 'string' || !isFeedGeneratorUri(item.uri)) return undefined;
		tab.uri = item.uri;
	}
	return tab;
}

/**
 * 廃止した形のタブを hashtag タブへ寄せる。AppView も読み書きのたびに同じ変換をするが、
 * この端末の localStorage に残った分はここで直す。
 *  - channel タブ → チャンネル名（label のスナップショット）の hashtag タブ。名前が無ければ落とす。
 *  - queryKind: 'tag' の search タブ → hashtag タブ。
 */
function upgradeLegacyTab(raw: unknown): unknown {
	if (!raw || typeof raw !== 'object') return raw;
	const item = raw as Record<string, unknown>;
	if (item.kind === 'channel')
		return typeof item.label === 'string' && item.label
			? { id: item.id, kind: 'hashtag', query: item.label }
			: undefined;
	if (item.kind === 'search' && item.queryKind !== undefined) {
		const { queryKind, ...rest } = item;
		return queryKind === 'tag' ? { ...rest, kind: 'hashtag' } : rest;
	}
	return raw;
}

/**
 * 保存・描画の直前に必ず通す。重複除去・id 採番・上限を担保する。
 * 空になった場合だけ既定へ落とす（タブが1本も無いフィードは操作不能になるため）。
 */
export function normalizeFeedTabs(raw: unknown): FeedTab[] {
	if (!Array.isArray(raw)) return [...DEFAULT_FEED_TABS];
	const tabs: FeedTab[] = [];
	const identities = new Set<string>();
	const ids = new Set<string>();
	for (const entry of raw) {
		if (tabs.length >= FEED_TABS_LIMIT) break;
		const tab = parseTab(upgradeLegacyTab(entry));
		if (!tab) continue;
		const identity = tabIdentity(tab);
		if (identities.has(identity)) continue;
		identities.add(identity);
		// id が無い / 重なるものは採番し直す。?tab= で引くタブが一意に決まらないため。
		if (!tab.id || ids.has(tab.id))
			tab.id = newTabId(tab.kind === 'search' ? 'q' : tab.kind === 'bsky' ? 'bsky' : 'tag');
		ids.add(tab.id);
		tabs.push(tab);
	}
	if (!tabs.length) return [...DEFAULT_FEED_TABS];
	return tabs;
}
