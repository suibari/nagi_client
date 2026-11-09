import { getCachedTranslations } from '$lib/api/appview';
import { stripMarkdown } from '$lib/atproto/markdown';
import { splitArticleText } from './articleText';

const CACHE_BATCH_SIZE = 50;

/**
 * ブログ一覧のカードに出す訳。一覧は全記事を一度に並べるので、記事ごとに翻訳を生成させると
 * 長文の生成が並んでしまう。ここでは AppView のキャッシュだけを引き、無ければ原文のまま出す。
 * 英訳は取り込み時に事前生成されているので、英語ならほぼ揃う。ほかの言語は誰かが記事を開いて
 * 訳したあとから一覧にも出る。
 */
export async function fetchCachedBlogTranslations(
	uris: string[],
	target: string,
	signal?: AbortSignal,
): Promise<Map<string, string>> {
	const found = new Map<string, string>();
	for (let offset = 0; offset < uris.length; offset += CACHE_BATCH_SIZE) {
		const result = await getCachedTranslations(
			uris.slice(offset, offset + CACHE_BATCH_SIZE),
			target,
			signal,
		);
		for (const translated of result.translations) found.set(translated.uri, translated.text);
	}
	return found;
}

/**
 * 訳文からカードのタイトルと概要を作る。訳されるのは記事本文（先頭の `# ` 行がタイトル）なので、
 * レコードに別の概要が書かれていても、訳では本文の冒頭を概要にする（buildBlogDirectoryItem と同じ長さ）。
 */
export function translatedBlogSummary(
	originalText: string,
	translatedText: string,
): { title: string; description: string } {
	const headingExpected = Boolean(splitArticleText(originalText).prefix);
	const translated = splitArticleText(translatedText, headingExpected);
	return {
		title: translated.title,
		description: stripMarkdown(translated.body).slice(0, 200),
	};
}
