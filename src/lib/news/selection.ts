import type { NewsPage, NewsView, RecommendedNewsView } from '$lib/api/types';
import type { UnreadView } from '$lib/unread/watermark.svelte';
import { byNewestFirst } from './order';

/** 「おすすめの理由：〜」に出す関心ジャンル。おすすめ以外のカードでは undefined。 */
export const recommendedReason = (news: NewsView | RecommendedNewsView) =>
	'reason' in news ? (news.reason?.genre ?? news.reason?.keyword) : undefined;

/**
 * 右サイドバーの候補にする期間。ニュースは6時間ごとのスロットでまとめて公開されるので、
 * 最新の候補からこの幅に入るもの（＝最新スロットぶん）だけを比べる。
 */
const PICK_WINDOW_MS = 6 * 60 * 60 * 1000;

const newsTime = (news: Pick<NewsView, 'createdAt' | 'indexedAt'>) =>
	Date.parse(news.createdAt || news.indexedAt) || 0;

/**
 * 右サイドバーに出すニュースを、最新スロットから1件だけ選ぶ。
 *
 * 読んだ人が自分の話としてコメントしやすい記事（talkScore が高い記事）を最優先にし、
 * 同点なら未読 → 関心ジャンルのおすすめ → 新しい順で決める。古い高得点記事が居座らないよう、
 * 最新の候補から6時間以内に絞って比べる。talkScore の無い記事（導入前の承認）は最下位。
 */
export function pickSidebarNews(
	page: NewsPage,
	view: UnreadView | undefined,
): NewsView | RecommendedNewsView | undefined {
	const recommended = page.recommended ?? [];
	// 新着側に紛れたおすすめにも理由ラベルを出すため、おすすめ側の記事に差し替える。
	const byUri = new Map(recommended.map((news) => [news.uri, news]));
	const seen = new Set<string>();
	const candidates = byNewestFirst([
		...page.items.map((news) => byUri.get(news.uri) ?? news),
		...recommended,
	]).filter((news) => {
		if (seen.has(news.uri)) return false;
		seen.add(news.uri);
		return true;
	});
	const newest = candidates[0];
	if (!newest) return undefined;
	const since = newsTime(newest) - PICK_WINDOW_MS;
	const rank = (news: NewsView | RecommendedNewsView) => [
		news.talkScore ?? -1,
		view?.isUnread(news) ? 1 : 0,
		recommendedReason(news) ? 1 : 0,
	];
	// 安定ソートなので、残りの同点は新しい順のまま。
	return candidates
		.filter((news) => newsTime(news) >= since)
		.sort((a, b) => {
			const [ra, rb] = [rank(a), rank(b)];
			return rb[0] - ra[0] || rb[1] - ra[1] || rb[2] - ra[2];
		})[0];
}
