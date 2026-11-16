import type { PostView } from '$lib/api/types';
import { blobRefCid, type PostAssets, type PostDraft } from '$lib/atproto/records';
import { optimisticPosts } from '$lib/feed/optimistic-posts.svelte';

const blobUrl = (did: string, blob: unknown) => {
	const cid = blobRefCid(blob);
	return cid ? `/api/blob/${encodeURIComponent(did)}/${encodeURIComponent(cid)}` : undefined;
};

/** 新しく公開した記事を、記事ページで表示できる形にする（画像は AppView の blob プロキシを指す）。 */
export function createdArticleView(
	draft: PostDraft,
	assets: PostAssets,
	created: { uri: string; cid: string },
	did: string,
): PostView {
	const images = assets.images.flatMap((image) => {
		const url = blobUrl(did, image.image);
		return url
			? [
					{
						url,
						alt: image.alt,
						...(image.contentWarning ? { contentWarning: true } : {}),
						...(image.aspectRatio ? { aspectRatio: image.aspectRatio } : {}),
					},
				]
			: [];
	});
	const linkCards = assets.cards.map((card) => {
		const thumb = card.thumb ? blobUrl(did, card.thumb) : undefined;
		return {
			uri: card.uri,
			title: card.title,
			...(card.description ? { description: card.description } : {}),
			...(thumb ? { thumb } : {}),
		};
	});
	return {
		uri: created.uri,
		cid: created.cid,
		author: optimisticPosts.author(did),
		text: draft.text,
		facets: draft.facets as PostView['facets'],
		langs: draft.langs,
		createdAt: draft.createdAt,
		indexedAt: draft.createdAt,
		...(images.length ? { images } : {}),
		...(linkCards.length ? { linkCards } : {}),
		article: true,
		reactions: [],
		isBot: false,
		isAffirmation: false,
	};
}

type SavedArticle = { post: PostView; tags: string[] };

/**
 * 執筆ページで保存した直後の記事（BLOG-07）。記事ページは AppView が同じ cid を返すまで
 * これを表示する。リロードで消えてよい（そのころには AppView が追いついている）。
 */
class SavedArticles {
	#items = $state<Record<string, SavedArticle>>({});

	set(post: PostView, tags: string[]) {
		this.#items = { ...this.#items, [post.uri]: { post, tags } };
	}

	get(uri: string): SavedArticle | undefined {
		return this.#items[uri];
	}

	/** AppView の内容がまだ保存前なら、保存した記事を返す（追いついたら呼び出し側で clear する）。 */
	pending(uri: string, fetched?: PostView): SavedArticle | undefined {
		const saved = this.#items[uri];
		return saved && fetched?.cid !== saved.post.cid ? saved : undefined;
	}

	clear(uri: string) {
		if (!(uri in this.#items)) return;
		const { [uri]: _removed, ...rest } = this.#items;
		this.#items = rest;
	}
}

export const savedArticles = new SavedArticles();
