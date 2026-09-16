import type { NewsView } from '$lib/api/types';

/** 日付見出しにも使う「そのニュースの日時」。botたんの投稿日を優先する。 */
const newsTime = (news: Pick<NewsView, 'createdAt' | 'indexedAt'>) =>
	Date.parse(news.createdAt || news.indexedAt) || 0;

/**
 * ニュース一覧を日付降順に揃える。
 * 検索（カテゴリタブ）は関連度順、おすすめはスコア順で返るため、そのままでは日付がばらばらに並ぶ。
 * 安定ソートなので、同時刻（＝同じ botたんバッチ）内はサーバの indexedAt DESC 順が残る。
 */
export const byNewestFirst = <T extends Pick<NewsView, 'createdAt' | 'indexedAt'>>(list: T[]) =>
	[...list].sort((a, b) => newsTime(b) - newsTime(a));
