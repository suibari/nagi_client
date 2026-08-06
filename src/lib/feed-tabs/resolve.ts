import {
	ApiRequestError,
	getAffirmation,
	getChannelTimeline,
	getHomeTimeline,
	getTimeline,
	searchPosts,
	searchPostsByQuery,
} from '$lib/api/appview';
import type { FeedItem, TimelinePage } from '$lib/api/types';
import { affirmationFeedRead, feedRead, globalFeedRead, homeFeedRead } from '$lib/feed/unread.svelte';
import { m } from '$lib/i18n/i18n.svelte';
import type { ReadWatermark } from '$lib/unread/watermark.svelte';
import { channelLabel } from './labels.svelte';
import type { FeedTab } from './types';

/**
 * タブ1枚を「どう取ってどう出すか」に落としたもの。取得経路は既存の XRPC を
 * そのまま指すだけで、新しい経路は作らない — こっそり投稿の扱いを含む可視性は
 * すべてサーバー側の既存クエリが決めており、タブ化で変わってはいけない。
 */
export type FeedTabSpec = {
	/** Feed インスタンスのキャッシュキー。同じキーなら同じ取得結果とみなす。 */
	key: string;
	fetcher: (cursor?: string) => Promise<TimelinePage>;
	optimisticFilter: (item: FeedItem) => boolean;
	watermark?: ReadWatermark;
	empty: () => string;
	/** 未ログイン向けの案内を出すタブ（従来の `/feed`）。 */
	showGuestHero?: boolean;
	/** 401/403 のときに再ログイン導線を出すタブ（ホームだけ）。 */
	handleHomeAuthError?: boolean;
	/** チャンネルタブのとき、チャンネルページへ渡す AT-URI。 */
	channelUri?: string;
};

/** at://<did>/<collection>/<rkey> → /channels/<did>/<rkey> */
export function channelHref(uri: string): string {
	const rest = uri.slice('at://'.length).split('/');
	return `/channels/${rest[0]}/${rest[2]}`;
}

/** チャンネルごとに既読を分ける。URI をそのままキーにすると `/` などが混ざる。 */
function channelWatermarkKey(uri: string): string {
	const rest = uri.slice('at://'.length).split('/');
	return `channel.${rest[0]}.${rest[2]}`;
}

/** タブバー・設定画面・プレビューで共通の表示名。 */
export function feedTabLabel(tab: FeedTab): string {
	switch (tab.kind) {
		case 'list':
			return m.navHome();
		case 'global':
			return m.navGlobal();
		case 'custom':
			return m.navAffirmation();
		case 'channel':
			return channelLabel(tab.uri) ?? tab.label ?? m.feedTabsKindChannel();
		case 'search':
			return tab.queryKind === 'tag' ? `#${tab.query}` : (tab.query ?? m.feedTabsKindSearch());
	}
}

/**
 * ホームは本人向けなので、認可が足りないときだけ文言を差し替える。
 * MainFeed が持っていた分岐をここへ移した（タブ化で呼び出し元が増えたため）。
 */
function homeFetcher(onAuthError: (failed: boolean) => void) {
	return async (cursor?: string) => {
		onAuthError(false);
		try {
			return await getHomeTimeline(cursor);
		} catch (error) {
			if (
				error instanceof ApiRequestError &&
				(error.status === 401 || error.status === 403)
			) {
				onAuthError(true);
				throw new Error(m.homeFeedAuthRequired());
			}
			throw error;
		}
	};
}

/**
 * タブ記述子を実行仕様へ。did はキャッシュキーと「ホームを本人向けに引くか」の判定に使う。
 * onAuthError は FeedShell の state を更新するためのコールバック。
 */
export function resolveFeedTab(
	tab: FeedTab,
	ctx: { did?: string; onAuthError?: (failed: boolean) => void },
): FeedTabSpec {
	const scope = ctx.did ?? 'guest';
	const noop = () => undefined;
	switch (tab.kind) {
		case 'list': {
			// 未ログインではホームリストが無いので、従来どおりグローバルを見せる。
			if (!ctx.did)
				return {
					key: `${scope}:global`,
					fetcher: getTimeline,
					optimisticFilter: (item) => !item.threadKossori,
					watermark: globalFeedRead,
					empty: m.feedEmpty,
					showGuestHero: true,
				};
			return {
				key: `${scope}:home`,
				fetcher: homeFetcher(ctx.onAuthError ?? noop),
				optimisticFilter: (item) => !item.reply && !item.channelOnly,
				watermark: homeFeedRead,
				empty: m.homeFeedEmpty,
				handleHomeAuthError: true,
			};
		}
		case 'global':
			return {
				key: `${scope}:global`,
				fetcher: getTimeline,
				optimisticFilter: (item) => !item.threadKossori,
				watermark: globalFeedRead,
				empty: m.feedEmpty,
				showGuestHero: true,
			};
		case 'custom':
			// 今は全肯定だけ。ユーザー定義のカスタムフィードもここに入る予定。
			return {
				key: `${scope}:affirmation`,
				fetcher: getAffirmation,
				optimisticFilter: (item) => Boolean(item.isAffirmation) && !item.threadKossori,
				watermark: affirmationFeedRead,
				empty: m.affirmationEmpty,
			};
		case 'channel': {
			const uri = tab.uri ?? '';
			return {
				key: `${scope}:channel:${uri}`,
				fetcher: (cursor) => getChannelTimeline(uri, cursor),
				optimisticFilter: (item) => item.channel?.uri === uri,
				watermark: feedRead(channelWatermarkKey(uri)),
				empty: m.channelTimelineEmpty,
				channelUri: uri,
			};
		}
		case 'search': {
			const query = tab.query ?? '';
			const isTag = tab.queryKind === 'tag';
			return {
				key: `${scope}:search:${isTag ? 'tag' : 'q'}:${query}`,
				// 意味検索(semantic)は Ollama への往復が走る。タブは開くたびに叩かれるので
				// 一致(exact)に固定する。あいまい検索が要るときは /search へ。
				fetcher: (cursor) =>
					isTag ? searchPosts(query, cursor) : searchPostsByQuery(query, cursor, 'exact'),
				// 検索結果に楽観投稿を混ぜても一致するとは限らないので出さない。
				optimisticFilter: () => false,
				// 結果の並びが安定しないため未読の意味がない（/search も渡していない）。
				empty: isTag ? m.searchTagEmpty : m.searchExactEmpty,
			};
		}
	}
}
