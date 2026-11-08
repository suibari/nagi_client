import type { LinkCardView, PostImage } from '$lib/api/types';
import { articleCardUrls } from '$lib/atproto/markdown';
import { httpUrl } from '$lib/atproto/facets';
import { blobKey, inlineImageKeys } from './inlineImages';

export type ArticleMedia = {
	/** 本文の上に出すヘッダー画像。 */
	cover?: PostImage;
	/** 本文に置かれず、カバーにもしなかった画像。本文の後ろにまとめる。 */
	looseImages: PostImage[];
	/** 本文の URL だけの行に置かれていないリンクカード。本文の後ろにまとめる。 */
	looseLinkCards: LinkCardView[];
};

/**
 * 記事の画像とリンクカードを、本文の行に置かれたもの（RichText がその位置に出す）と
 * それ以外に分ける。本文に置かれていない画像のうち先頭がカバー（本文内画像に対応する
 * 前の記事との互換。standard.site の coverImage も「1枚目の画像」）。
 * フィードと記事ページで同じ見た目にするため、両方ここを通す。
 *
 * appViewOrigins は AppView が返す画像 URL のオリジン（本文の URL と照合キーをそろえる）。
 */
export function articleMedia(
	text: string,
	images: readonly PostImage[] = [],
	linkCards: readonly LinkCardView[] = [],
	appViewOrigins: readonly string[] = [],
): ArticleMedia {
	const inlineKeys = inlineImageKeys(text);
	const notInline = images.filter((image) => {
		const key = blobKey(image.url, appViewOrigins);
		return !key || !inlineKeys.has(key);
	});
	const cover = images[0] && notInline[0] === images[0] ? images[0] : undefined;
	const inlineCardUrls = new Set(articleCardUrls(text));
	return {
		cover,
		looseImages: cover ? notInline.slice(1) : notInline,
		looseLinkCards: linkCards.filter((card) => !inlineCardUrls.has(httpUrl(card.uri) ?? card.uri)),
	};
}
