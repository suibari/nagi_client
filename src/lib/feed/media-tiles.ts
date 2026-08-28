import type { FeedItem, PostImage, PostView } from '$lib/api/types';

/** メディアグリッドの1マス。1投稿に複数画像があれば、その枚数ぶんのタイルになる。 */
export type MediaTile = { post: PostView; image: PostImage; index: number };

/**
 * フィードをタイル列に均す。メディアグリッドは group=false で取得するので、
 * 各 FeedItem は自分自身が画像を持つ投稿であり、会話バブルまで潜る必要はない。
 */
export const mediaTiles = (items: FeedItem[]): MediaTile[] =>
	items.flatMap((post) => (post.images ?? []).map((image, index) => ({ post, image, index })));

/** DOMキー。楽観投稿が確定して uri が変わったらタイルごと差し替わってよい。 */
export const mediaTileKey = (tile: MediaTile) => `${tile.post.uri}#${tile.index}`;
