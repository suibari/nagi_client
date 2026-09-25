import type { NewsPage, NewsView, RecommendedNewsView } from '$lib/api/types';
import type { UnreadView } from '$lib/unread/watermark.svelte';
import { byNewestFirst } from './order';

/** 「おすすめの理由：〜」に出す関心ジャンル。おすすめ以外のカードでは undefined。 */
export const recommendedReason = (news: NewsView | RecommendedNewsView) =>
	'reason' in news ? (news.reason?.genre ?? news.reason?.keyword) : undefined;

/**
 * 未読のおすすめを新しい順に先頭（カルーセルの左側）へ置き、残りを新着で埋める。
 * 既読のおすすめは出さない。同じカードは一度だけ出す。
 */
export function selectMyNagiNews(
	page: NewsPage,
	view: UnreadView | undefined,
	limit: number,
): Array<NewsView | RecommendedNewsView> {
	const recommended = byNewestFirst(page.recommended ?? []).filter((news) => view?.isUnread(news));
	const seen = new Set<string>();
	return [...recommended, ...byNewestFirst(page.items)]
		.filter((news) => {
			if (seen.has(news.uri)) return false;
			seen.add(news.uri);
			return true;
		})
		.slice(0, Math.max(0, limit));
}
