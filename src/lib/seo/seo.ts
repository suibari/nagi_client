/** 正規URLの基点。canonical と sitemap が同じ綴りを使うための唯一の出どころ。 */
export const SITE_ORIGIN = 'https://nagi.suibari.com';

/**
 * ページ単位の検索向けメタデータ。ルートの `load()` が返し、`+layout.svelte` が読む。
 * これを返すこと自体が索引許可の合図で、返さないページには layout が `noindex` を出す（SEO-01）。
 */
export type PageSeo = {
	title: string;
	description: string;
	/** 絶対URL。重複URLを1本へ寄せるため、必ず正規の綴りを入れる。`absolute()` を使う。 */
	canonical: string;
	/**
	 * 既定は index,follow。canonical は出したいが索引はさせたくないページ
	 * （ページ送りの2ページ目など）でだけ指定する。
	 */
	robots?: 'index,follow' | 'noindex,follow';
};

export const absolute = (path: string): string => new URL(path, SITE_ORIGIN).toString();
