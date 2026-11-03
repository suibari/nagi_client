import { hasContentWarning } from '$lib/atproto/contentWarning';

/**
 * Bluesky が画像・動画をぼかすセルフラベル。クロスポストへ引き継ぐのもこの集合だけ。
 * Nagi で選べるのは sexual と graphic-media だが、旧データの porn・nudity も同じ扱いにする。
 */
export const BLUESKY_MEDIA_BLUR_LABELS = ['porn', 'sexual', 'nudity', 'graphic-media'] as const;

/** CW がクロスポストを止める理由。止めないときは undefined。 */
export type CrosspostContentWarningBlock = 'text' | 'media';

/**
 * Nagi で伏せたものを、伏せられない場所へは出さない。
 *
 * CW（本文の伏せ字・画像のぼかし）は Nagi 独自の機能で、Bluesky では効かない。
 * - 本文の伏せ字は Bluesky に相当する仕組みが無いので、常に止める。
 * - 画像・動画のぼかしは、Bluesky がぼかすセルフラベルが付いていれば同等に伏せられるので通す。
 *   ラベルが無ければ素のまま出てしまうので止める。
 *
 * ブログ（standard.site）はリーダーがラベルを解釈する保証が無いので、ここではなく
 * cwRestricted で CW 付きを一律に止めている。
 */
export function crosspostContentWarningBlock(content: {
	text: string;
	mediaWarning: boolean;
	labels: readonly string[];
}): CrosspostContentWarningBlock | undefined {
	if (hasContentWarning(content.text)) return 'text';
	if (
		content.mediaWarning &&
		!content.labels.some((label) =>
			(BLUESKY_MEDIA_BLUR_LABELS as readonly string[]).includes(label),
		)
	)
		return 'media';
	return undefined;
}
