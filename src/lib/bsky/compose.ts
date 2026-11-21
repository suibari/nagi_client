import type { PostDraft } from '$lib/atproto/records';
import { uploadPostAssets } from '$lib/atproto/records';
import { crosspostToBluesky } from '$lib/crosspost/bluesky';
import type { BskyComposeTarget } from '$lib/post/composer-host.svelte';

/**
 * Bluesky 投稿への返信・引用を、Bluesky にだけ投稿する（BSKY-09）。Nagi の投稿は作らない。
 * 分割・facet・埋め込み・via はクロスポストと同じ組み立てを使う。
 * 分割の途中で失敗したら CrosspostPartialError を投げる（作った分は消さない）。
 */
export async function postToBluesky(draft: PostDraft, target: BskyComposeTarget) {
	const assets = await uploadPostAssets(draft);
	const result = await crosspostToBluesky(
		draft,
		assets,
		target.kind === 'reply'
			? { reply: { root: target.root, parent: target.parent } }
			: { quote: target.parent },
	);
	if (!result) throw new Error('Nothing to post');
	return result.ref.root;
}
