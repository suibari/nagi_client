import type { FeedTab, FeedTabKind, FeedTabSource } from '$lib/api/types';

export type { FeedTab, FeedTabKind, FeedTabSource };

/** タブ数の上限。チャンネル追加の上限（50）より意図的に少ない。 */
export const FEED_TABS_LIMIT = 16;
export const FEED_TAB_KINDS: readonly FeedTabKind[] = [
	'list',
	'global',
	'custom',
	'channel',
	'search',
] as const;
export const MAX_TAB_QUERY_LENGTH = 128;
export const MAX_TAB_LABEL_LENGTH = 64;

/**
 * list / custom が今指せる中身。どちらも1つずつしか無いので、追加ダイアログは
 * 種別を選んだ時点でこれを既定として入れる（将来ここが複数になったら選択肢を出す）。
 */
export const DEFAULT_SOURCE: Partial<Record<FeedTabKind, FeedTabSource>> = {
	list: 'home',
	custom: 'affirmation',
};

/** 何も設定していない人が見るタブ。今日の見た目（ホーム/グローバル/全肯定）と同じ。 */
export const DEFAULT_FEED_TABS: FeedTab[] = [
	{ id: 'home', kind: 'list', source: 'home' },
	{ id: 'global', kind: 'global' },
	{ id: 'affirmation', kind: 'custom', source: 'affirmation' },
];

/**
 * 「同じ中身のタブか」の判定キー。id はランダムなので重複判定には使えない
 * （同じチャンネルを2回追加したら別 id の同じタブが並んでしまう）。
 */
export function tabIdentity(tab: FeedTab): string {
	switch (tab.kind) {
		case 'list':
		case 'custom':
			return `${tab.kind}:${tab.source ?? DEFAULT_SOURCE[tab.kind]}`;
		case 'channel':
			return `channel:${tab.uri ?? ''}`;
		case 'search':
			return `search:${tab.queryKind ?? 'keyword'}:${(tab.query ?? '').toLowerCase()}`;
		default:
			return tab.kind;
	}
}

/**
 * 組み込みタブの固定 id。`/feed?tab=global` を端末間で安定させたいので、
 * ランダム採番せずこの表から採る。ここに無いタブ（channel / search）は newTabId。
 */
const BUILTIN_IDS: Record<string, string> = {
	'list:home': 'home',
	global: 'global',
	'custom:affirmation': 'affirmation',
};
export const builtinTabId = (tab: FeedTab): string | undefined => BUILTIN_IDS[tabIdentity(tab)];

/**
 * channel / search タブの id。衝突しても normalize が採番し直すので短くてよい。
 * プリレンダ（Node）でも通るよう crypto が無ければ Math.random に落ちる。
 */
export function newTabId(prefix: 'ch' | 'q'): string {
	const bytes = new Uint8Array(4);
	if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(bytes);
	else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
	return `${prefix}_${[...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')}`;
}
