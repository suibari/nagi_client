import type { NewsPage, NewsView, RecommendedNewsView } from '$lib/api/types';
import type { UnreadView } from '$lib/unread/watermark.svelte';
import { byNewestFirst } from './order';

/** 「おすすめの理由：〜」に出す関心ジャンル。おすすめ以外のカードでは undefined。 */
export const recommendedReason = (news: NewsView | RecommendedNewsView) =>
	'reason' in news ? (news.reason?.genre ?? news.reason?.keyword) : undefined;

/**
 * 未読のおすすめを新しい順に先頭（カルーセルの左側）へ置き、残りを新着で埋める。
 * 既読のおすすめは先頭に寄せないが、新着に含まれていればラベル付きで出す。同じカードは一度だけ出す。
 */
export function selectMyNagiNews(
	page: NewsPage,
	view: UnreadView | undefined,
	limit: number,
): Array<NewsView | RecommendedNewsView> {
	const recommended = byNewestFirst(page.recommended ?? []);
	// 新着側に紛れた既読おすすめにも理由ラベルを出すため、おすすめ側の記事に差し替える。
	const byUri = new Map(recommended.map((news) => [news.uri, news]));
	const newest = byNewestFirst(page.items).map((news) => byUri.get(news.uri) ?? news);
	const seen = new Set<string>();
	return [...recommended.filter((news) => view?.isUnread(news)), ...newest]
		.filter((news) => {
			if (seen.has(news.uri)) return false;
			seen.add(news.uri);
			return true;
		})
		.slice(0, Math.max(0, limit));
}
