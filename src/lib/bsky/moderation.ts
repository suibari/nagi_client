import {
	moderatePost,
	type AppBskyEmbedRecord,
	type AppBskyFeedDefs,
	type ComAtprotoLabelDefs,
	type ModerationOpts,
} from '@atproto/api';
import { quotedRecord } from './mapView';

/**
 * Bluesky の投稿の見せ方。判定は Bluesky のラベルと、本人が Bluesky 側で選んだモデレーション設定
 * （購読ラベラー・成人向けの可否・ミュートワードなど）に従う。Nagi の自動判定は Bluesky の投稿には
 * 掛かっていないので、Nagi のモデレーション設定は使わない。
 *
 * 例外は年齢。Nagi で成人と確認できていない人には、Bluesky 側の設定に関わらず成人向けを出さない
 * （Nagi の AppView が未成年へ成人向けを返さないのと同じ線引きをクライアントで引く）。
 */

const ADULT_LABELS = new Set(['porn', 'sexual', 'nudity', 'graphic-media']);

export type BskyPostDisplay = {
	hidden: boolean;
	/** 投稿全体を注意で覆う。 */
	warnContent: boolean;
	/** 画像・動画だけを覆う。 */
	warnMedia: boolean;
};

/** 引用先のラベルも見る。成人向けの投稿を引用しただけの投稿から中身が見えてしまうため。 */
function quotedLabels(post: AppBskyFeedDefs.PostView): ComAtprotoLabelDefs.Label[] {
	const record = quotedRecord(post.embed) as AppBskyEmbedRecord.ViewRecord | undefined;
	if (record?.$type !== 'app.bsky.embed.record#viewRecord') return [];
	return [...(record.labels ?? []), ...(record.author.labels ?? [])];
}

const labelsOf = (post: AppBskyFeedDefs.PostView) => [
	...(post.labels ?? []),
	...(post.author.labels ?? []),
	...quotedLabels(post),
];

export const hasAdultLabel = (post: AppBskyFeedDefs.PostView) =>
	labelsOf(post).some((label) => !label.neg && ADULT_LABELS.has(label.val));

export function bskyPostDisplay(
	post: AppBskyFeedDefs.PostView,
	opts: ModerationOpts,
	viewer: { isAdult: boolean },
): BskyPostDisplay {
	if (!viewer.isAdult && hasAdultLabel(post))
		return { hidden: true, warnContent: false, warnMedia: false };
	const decision = moderatePost(post, opts);
	if (decision.ui('contentList').filter)
		return { hidden: true, warnContent: false, warnMedia: false };
	return {
		hidden: false,
		warnContent: decision.ui('contentList').blur || decision.ui('contentView').blur,
		warnMedia: decision.ui('contentMedia').blur,
	};
}
