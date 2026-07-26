export const PUBLICATION = 'site.standard.publication';
export const DOCUMENT = 'site.standard.document';
/** markdown を document.content の open union に載せるための lexicon（markpub.at）。 */
export const MARKDOWN = 'at.markpub.markdown';
export const MARKDOWN_TEXT = 'at.markpub.text';

/**
 * publication.url は「document.path と連結して canonical URL を作るためのベース」と
 * lexicon に明記されている。ユーザーごとの publication でも url は Nagi 本体で共通にし、
 * name / description / icon で個人を表す。ローカル開発でも本番の公開 URL を書く
 * （レコードは恒久的で、localhost を指しても意味がないため）。
 */
export const NAGI_PUBLIC_ORIGIN = 'https://nagi.suibari.com';

export type StandardSitePreferences = { showInDiscover?: boolean };

export type StandardSitePublication = {
	$type?: string;
	url: string;
	name: string;
	description?: string;
	icon?: unknown;
	preferences?: StandardSitePreferences;
};

export type StandardSiteDocument = {
	$type?: string;
	site: string;
	title: string;
	publishedAt: string;
	updatedAt?: string;
	path?: string;
	description?: string;
	textContent?: string;
	content?: unknown;
	coverImage?: unknown;
	tags?: string[];
};

/** 投稿1件を standard.site の記事として書き出すための入力。 */
export type ArticleInput = {
	/** Nagi 投稿の rkey。document の rkey にもそのまま使う。 */
	rkey: string;
	title: string;
	/** 生の markdown（Nagi 投稿の text そのもの）。 */
	markdown: string;
	publishedAt: string;
	tags: string[];
	/** 1枚目の画像の BlobRef。1MB 以下のときだけ渡す。 */
	coverImage?: unknown;
};
