import type { PostVideoRecord } from './records';

const POST = 'com.suibari.nagi.post';

/** com.suibari.nagi.post#image の中身（$type を除く）。 */
export type StoredPostImage = {
	image: unknown;
	alt: string;
	contentWarning?: boolean;
	aspectRatio?: { width: number; height: number };
};

export type StoredQuoteRef = { uri: string; cid: string };

/** 投稿の embed を型によらず均した中身。 */
export type PostEmbedMedia = {
	images: StoredPostImage[];
	video?: PostVideoRecord;
	quote?: StoredQuoteRef;
};

/**
 * 投稿レコードの embed から画像・動画・引用を取り出す。生レコードを読むときはここを通す
 * （AppView の nagiPostMedia と同じ役割）。
 *
 * メディアの置き場所は embed の型ごとに違う:
 * - `#images`  … `images`
 * - `#video`   … embed 自体が動画
 * - `#gallery` … `items` に `#image` / `#video` が混ざる
 * - `#quote`   … `record` と、任意の `images` / `video`
 *
 * 過去のレコードが残るので、読み手はこの4通りを扱い続ける。形はこれ以上増やさないこと。
 * 知らない型の embed は undefined を返す（書き換えると中身を失うため）。
 */
export function postEmbedMedia(embed: unknown): PostEmbedMedia | undefined {
	if (!embed || typeof embed !== 'object') return { images: [] };
	const value = embed as Record<string, unknown>;
	const images = (list: unknown) => (Array.isArray(list) ? (list as StoredPostImage[]) : []);
	switch (value.$type) {
		case `${POST}#images`:
			return { images: images(value.images) };
		case `${POST}#video`: {
			const { $type: _type, ...video } = value;
			return { images: [], video: video as PostVideoRecord };
		}
		case `${POST}#gallery`: {
			const result: PostEmbedMedia = { images: [] };
			for (const item of Array.isArray(value.items) ? value.items : []) {
				const { $type: type, ...rest } = (item ?? {}) as Record<string, unknown>;
				if (type === `${POST}#image`) result.images.push(rest as StoredPostImage);
				// 動画は1本まで。崩れたレコードでも先頭だけ使う。
				else if (type === `${POST}#video` && !result.video) result.video = rest as PostVideoRecord;
			}
			return result;
		}
		case `${POST}#quote`:
			return {
				images: images(value.images),
				...(value.video && typeof value.video === 'object'
					? { video: value.video as PostVideoRecord }
					: {}),
				quote: value.record as StoredQuoteRef,
			};
		default:
			return undefined;
	}
}

/**
 * 画像・動画・引用から投稿の embed を組み立てる。どの型で書くかの規則はここだけが持つ:
 * 引用あり→`#quote`、画像と動画→`#gallery`、画像だけ→`#images`、動画だけ→`#video`。
 * `#gallery` の items は画像→動画の順に並べる（AppView のビューもこの順で返す）。
 */
export function buildPostEmbed({
	images,
	video,
	quote,
}: PostEmbedMedia): Record<string, unknown> | undefined {
	if (quote)
		return {
			$type: `${POST}#quote`,
			record: quote,
			...(images.length ? { images } : {}),
			...(video ? { video } : {}),
		};
	if (video && images.length)
		return {
			$type: `${POST}#gallery`,
			items: [
				...images.map((image) => ({ $type: `${POST}#image`, ...image })),
				{ $type: `${POST}#video`, ...video },
			],
		};
	if (video) return { $type: `${POST}#video`, ...video };
	if (images.length) return { $type: `${POST}#images`, images };
	return undefined;
}
