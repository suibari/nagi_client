import type { BskyFeedItemView } from './mapView';

/**
 * Bluesky アプリの「フォロー中」の表示設定。getTimeline はこれを反映せずに返し、
 * 絞り込みはクライアントの仕事になっている。hideRepliesByLikeCount は古い設定なので見ない。
 */
export type TimelineViewPrefs = {
	hideReplies: boolean;
	hideRepliesByUnfollowed: boolean;
	hideReposts: boolean;
	hideQuotePosts: boolean;
};

/**
 * 本人の投稿と、本人あての返信は設定に関わらず残す（自分の書いたものが消えると混乱する）。
 * フォロー外への返信は、返信先が本人・投稿者自身（自分のスレッドの続き）・フォロー中なら残す。
 */
export function filterTimeline(
	items: BskyFeedItemView[],
	prefs: TimelineViewPrefs,
	viewerDid: string,
): BskyFeedItemView[] {
	return items.filter((item) => {
		if (item.repostedBy) return !prefs.hideReposts;
		const own = item.post.author.did === viewerDid;
		if (!own && prefs.hideQuotePosts && item.post.quote) return false;
		const reply = item.reply;
		if (!reply || own || reply.parentDid === viewerDid) return true;
		if (prefs.hideReplies) return false;
		if (prefs.hideRepliesByUnfollowed)
			return reply.parentFollowed || reply.parentDid === item.post.author.did;
		return true;
	});
}
