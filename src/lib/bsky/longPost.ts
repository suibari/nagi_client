import type { PostView, StrongRef, ThreadView } from '$lib/api/types';
import type { BskyFacet } from './mapView';

/** Bluesky 投稿の追加フィールドのキー。定義は lexicon の com.suibari.nagi.longPost。 */
export const LONG_POST_FIELD = 'com.suibari.nagi.longPost';
const NAGI_POST = 'com.suibari.nagi.post';

/**
 * 投稿レコードから長文の目印を取り出す（BSKY-16）。投稿者と同じリポジトリの Nagi 投稿を
 * 指すものだけを認め、他人の投稿を「全文」と名乗らせない。
 */
export function longPostOf(record: unknown, authorDid: string): StrongRef | undefined {
	if (!record || typeof record !== 'object') return undefined;
	const value = (record as Record<string, unknown>)[LONG_POST_FIELD];
	if (!value || typeof value !== 'object') return undefined;
	const { uri, cid } = value as { uri?: unknown; cid?: unknown };
	if (typeof uri !== 'string' || typeof cid !== 'string' || !cid) return undefined;
	if (!uri.startsWith(`at://${authorDid}/${NAGI_POST}/`)) return undefined;
	return { uri, cid };
}

/** 目印の先の本文を、Nagi で見せられる状態のときだけ返す。版（cid）の違いは問わない。 */
export function longPostText(
	post: PostView | undefined,
	authorDid: string,
): { text: string; facets?: BskyFacet[] } | undefined {
	if (!post || post.author.did !== authorDid) return undefined;
	if (post.deleted || post.unavailableReason || post.kossori || post.threadKossori)
		return undefined;
	// 伏せた本文やモデレーションの対象を、Nagi の表示判定を通さずに開かない。
	if (post.contentWarning || post.cwRestricted || post.moderationLabels?.length) return undefined;
	if (!post.text) return undefined;
	return { text: post.text, facets: post.facets as BskyFacet[] | undefined };
}

export async function loadLongPostText(
	ref: StrongRef,
	authorDid: string,
	load: (uri: string) => Promise<{ thread: ThreadView }>,
) {
	const { thread } = await load(ref.uri);
	return longPostText(thread?.post, authorDid);
}
