import { extractTitle } from '$lib/atproto/markdown';

export type ArticleText = {
	title: string;
	/** タイトル行を除いた本文。 */
	body: string;
	/** 本文の前に落とした部分（タイトル行と続く空白）。facet のバイト位置をずらすのに使う。 */
	prefix: string;
};

const HEADING = /^# [^\n]+\n*\s*/;

/**
 * 記事の Markdown をタイトルと本文に分ける。記事は先頭の `# ` 行がタイトル。
 *
 * 訳文はモデルが `# ` を落とすことがあるので、原文に見出しがあった場合（headingExpected）は
 * 先頭の空でない行をタイトルとして扱う。そうしないとタイトルが本文の頭に重複して出る。
 */
export function splitArticleText(text: string, headingExpected = false): ArticleText {
	const heading = text.match(HEADING)?.[0];
	if (heading) {
		return {
			title: extractTitle(text) ?? heading.replace(/^#\s*/, '').trim(),
			body: text.slice(heading.length),
			prefix: heading,
		};
	}
	if (headingExpected) {
		const firstLine = text.match(/^\s*([^\n]+)\n*\s*/);
		if (firstLine) {
			return {
				title: firstLine[1].replace(/^#+\s*/, '').trim(),
				body: text.slice(firstLine[0].length),
				prefix: firstLine[0],
			};
		}
	}
	return { title: extractTitle(text) ?? text.slice(0, 80), body: text, prefix: '' };
}
