import type { FeedItem, PostView } from '$lib/api/types';
import { NSFW_SELF_LABELS } from '$lib/moderation/preferences.svelte';

/**
 * ランディングの「いまのNagi」に並べる実投稿を、公開TLの1ページから選ぶ。
 *
 * 初めて来た人がいきなり目にする場所なので、本文を伏せる必要のあるもの
 * （CW・ラベル・こっそり）と、文脈が分からないもの（返信・引用・ブログ）は外す。
 * 体験の見本としては「書く → botたんが受け止める → 絵文字が届く」が見えてほしいので、
 * botたんの返信が付いた投稿だけを候補にし、絵文字の種類が多いものを優先する（1人1件まで）。
 * 画像・動画は絵文字が集まりやすく、Nagi らしさが伝わるので候補に残す。
 *
 * セルフラベルは、表示設定で伏せる対象になるもの（NSFW）だけを外す。botたんの返信には
 * 必ず ai-generated が付くので、ラベルの有無だけで外すと1件も残らない。
 */
export type ShowcasePost = { post: PostView; botReply: PostView };

const hasHiddenContent = (post: PostView) =>
	Boolean(
		post.contentWarning ||
		post.cwRestricted ||
		post.moderationLabels?.length ||
		post.selfLabels?.some((label) => NSFW_SELF_LABELS.has(label)) ||
		post.images?.some((image) => image.contentWarning) ||
		post.video?.contentWarning,
	);

const isShowable = (post: PostView) =>
	!post.isBot &&
	!post.reply &&
	!post.quote &&
	!post.article &&
	!post.deleted &&
	!post.unavailableReason &&
	!post.optimisticState &&
	!(post.threadKossori ?? post.kossori) &&
	!hasHiddenContent(post);

/** 会話グループ表示なら直下の bot 返信、そうでなければ botReply。 */
function botReplyOf(item: FeedItem): PostView | undefined {
	const reply =
		item.botReply ??
		item.conversation?.bubbles.find((bubble) => bubble.depth === 1 && bubble.post.isBot)?.post;
	if (!reply || reply.deleted || reply.unavailableReason || hasHiddenContent(reply)) return;
	return reply;
}

export function pickShowcasePosts(items: FeedItem[], limit = 4): ShowcasePost[] {
	const seen = new Set<string>();
	const candidates: Array<ShowcasePost & { order: number; score: number }> = [];
	for (const [order, item] of items.entries()) {
		const post: PostView = item.conversation?.root ?? item;
		if (seen.has(post.uri) || !isShowable(post)) continue;
		const botReply = botReplyOf(item);
		if (!botReply) continue;
		seen.add(post.uri);
		// 数は画面に出さない。並べ替えにだけ使う。
		candidates.push({ post, botReply, order, score: post.reactions.length });
	}
	// 同じ人ばかり並ぶと「いまのNagi」に見えないので、1人1件にする。
	const authors = new Set<string>();
	return candidates
		.sort((a, b) => b.score - a.score || a.order - b.order)
		.filter(({ post }) => {
			if (authors.has(post.author.did)) return false;
			authors.add(post.author.did);
			return true;
		})
		.slice(0, limit)
		.sort((a, b) => a.order - b.order)
		.map(({ post, botReply }) => ({ post, botReply }));
}
