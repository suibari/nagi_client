import { error } from '@sveltejs/kit';
import { browser } from '$app/environment';
import { getNewsItem } from '$lib/api/appview';
import { fetchIndexableNews, newsRkey } from '$lib/news/indexable';
import { absolute, type PageSeo } from '$lib/seo/seo';
import type { ActorView, NewsView } from '$lib/api/types';

export const ssr = true;
export const prerender = true;

/**
 * プリレンダするパーマリンクの一覧。
 * `load()` と sitemap.xml も同じ fetchIndexableNews() を見るので、三者の集合はずれない。
 */
export async function entries(): Promise<Array<{ rkey: string }>> {
	const { items } = await fetchIndexableNews();
	return items.map((news) => ({ rkey: newsRkey(news.uri) }));
}

export const load = async ({
	params,
}: {
	params: { rkey: string };
}): Promise<{ news: NewsView; botActor?: ActorView; seo: PageSeo }> => {
	// ビルド時は entries() と同じメモから引く（記事ごとに往復しない）。
	// ブラウザでは、まだビルドに含まれていない公開直後の記事をここで取りに行く。
	const cached = browser ? undefined : await fetchIndexableNews();
	const hit = cached?.items.find((news) => newsRkey(news.uri) === params.rkey);
	const item = hit
		? { news: hit, botActor: cached?.botActor }
		: await getNewsItem(params.rkey, 'ja').catch(() => undefined);
	if (!item) error(404, 'News not found');

	return {
		news: item.news,
		botActor: item.botActor,
		seo: {
			title: `${item.news.title} — 全肯定ニュース | Nagi（ナギ）`,
			// botたんのひとことは120〜240字の書き下ろしで、承認時に固定される。
			// meta description にそのまま使える唯一のテキスト（記事本文は保持していない）。
			description: item.news.botComment,
			canonical: absolute(`/news/${params.rkey}`),
		},
	};
};
