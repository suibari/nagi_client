/** 正規URLの基点。canonical と sitemap が同じ綴りを使うための唯一の出どころ。 */
export const SITE_ORIGIN = 'https://nagi.suibari.com';

/**
 * ページ単位の検索向けメタデータ。ルートの `load()` が返し、`+layout.svelte` が読む。
 *
 * **これを返すこと自体が「このページは索引してよい」の合図**で、返さないページには
 * layout が `noindex` を出す。以前はパスの完全一致表を layout が持っていたが、
 * その形だと動的ルートを載せられず、ルートを足したときに表への追記を忘れる。
 * 判定をページ側のデータに移したことで、索引対象は「中身を持って返せたページ」と
 * 同義になり、空の殻が索引される経路が構造的に無くなる。
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

/** サイト内パスから canonical 用の絶対URLを作る。 */
export const absolute = (path: string): string => new URL(path, SITE_ORIGIN).toString();
