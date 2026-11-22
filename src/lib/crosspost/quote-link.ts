import { getLinkMetadata, getLinkThumbnail } from '$lib/api/appview';
import type { NewsView, PostView, RadioTrack } from '$lib/api/types';
import { postHref } from '$lib/feed/post-follow.svelte';
import { newsRkey } from '$lib/news/indexable';
import { isAppviewOwnedUri } from '$lib/post/appview-uri';
import { radioSongCard } from '$lib/radio/song-card';
import { NAGI_PUBLIC_ORIGIN } from '$lib/standardsite/types';
import type { QuoteLinkCard } from './bluesky';

/** 引用先。Composer の quoteTarget と、貼り付けで付いた引用（post だけ）の両方を受ける。 */
export type QuoteLinkSource = {
	post?: Pick<PostView, 'uri' | 'kossori' | 'threadKossori'>;
	news?: Pick<NewsView, 'uri'>;
	radio?: RadioTrack;
};

/**
 * 引用先を Bluesky でリンクとして出すときの URL（BSKY-05）。
 * こっそり投稿は Bluesky から開けないので undefined（＝クロスポストできない）。
 */
export function quoteLinkUrl(source: QuoteLinkSource): string | undefined {
	if (source.post) {
		const { uri, kossori, threadKossori } = source.post;
		if (kossori || threadKossori || isAppviewOwnedUri(uri)) return undefined;
		return `${NAGI_PUBLIC_ORIGIN}${postHref(uri)}`;
	}
	// ニュースは元記事ではなく Nagi のニュースページへ誘導する（NEWS-03）。
	if (source.news) return `${NAGI_PUBLIC_ORIGIN}/news/${newsRkey(source.news.uri)}`;
	if (source.radio) return radioSongCard(source.radio)?.uri;
	return undefined;
}

/**
 * リンクカードの中身を取る。取れなくてもホスト名で出し、投稿は止めない（MEDIA-06）。
 * upload はサムネイルを PDS に上げて blob ref を返す。上げられないときは undefined。
 */
export async function loadQuoteLinkCard(
	uri: string,
	upload: (blob: Blob) => Promise<unknown>,
): Promise<QuoteLinkCard> {
	const fallback: QuoteLinkCard = { uri, title: new URL(uri).hostname };
	let metadata;
	try {
		metadata = await getLinkMetadata(uri);
	} catch {
		return fallback;
	}
	let thumb: unknown;
	if (metadata.image) {
		try {
			thumb = await upload(await getLinkThumbnail(metadata.image));
		} catch {
			// サムネイルが無くてもカードは出す。
		}
	}
	return {
		uri,
		title: metadata.title || fallback.title,
		...(metadata.description ? { description: metadata.description } : {}),
		...(thumb ? { thumb } : {}),
	};
}
