import type { NewsPage, NewsView } from '$lib/api/types';
import type { UnreadView } from '$lib/unread/watermark.svelte';
import { byNewestFirst } from './order';

/** 未読のおすすめを新しい順に優先し、残りを新着で埋める。同じカードは一度だけ出す。 */
export function selectMyNagiNews(
	page: NewsPage,
	view: UnreadView | undefined,
	limit: number,
): NewsView[] {
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
