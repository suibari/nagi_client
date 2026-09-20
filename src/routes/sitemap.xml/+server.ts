import { LEGAL_LAST_UPDATED } from '$lib/legal/meta';
import { fetchIndexableNews, newsRkey } from '$lib/news/indexable';
import { SITEMAP_ROUTES } from '$lib/seo/sitemap';
import { absolute } from '$lib/seo/seo';

/**
 * sitemap.xml をビルド時に生成する。
 *
 * ルートとして置いているのは、`static/` に手で置くと記事が増えても更新されないため。
 * `client-metadata.json/+server.ts` と同じく `prerender = true` なので、adapter-static でも
 * ビルド成果物に含まれる（ビルドスクリプトも prebuild フックも増やさない）。
 *
 * 記事一覧は prerender の `entries()` と**同じ** `fetchIndexableNews()` から取る。
 * 別々に取ると「sitemap にあるが実体が無いURL」が生まれ、クローラが404を踏む。
 */
export const prerender = true;

/** 文字参照が要る文字はURLに出ないはずだが、sitemap を壊さないために最低限は通す。 */
const xml = (value: string) =>
	value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const entry = (loc: string, lastmod?: string) =>
	`\t<url>\n\t\t<loc>${xml(loc)}</loc>${lastmod ? `\n\t\t<lastmod>${xml(lastmod)}</lastmod>` : ''}\n\t</url>`;

/** 規約とポリシーだけは本文の最終更新日が分かる。残りは嘘を書かず lastmod を省く。 */
const staticLastmod = (path: string) =>
	path === '/terms' || path === '/privacy' ? LEGAL_LAST_UPDATED : undefined;

export async function GET(): Promise<Response> {
	const { items } = await fetchIndexableNews();
	const newest = items[0]?.indexedAt?.slice(0, 10);
	const urls = [
		...SITEMAP_ROUTES.map((path) =>
			entry(absolute(path), path === '/news' ? newest : staticLastmod(path)),
		),
		...items.map((news) =>
			entry(absolute(`/news/${newsRkey(news.uri)}`), news.indexedAt.slice(0, 10)),
		),
	];
	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
		{ headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
	);
}
