import type { PostView } from '$lib/api/types';

/**
 * 閲覧者の投稿へ直接返信した、他の人の発言か。フィードで「あなたへ」の目印を出すかを決める。
 *
 * 親の作者は同じカードに並ぶ投稿から引く。こっそり投稿の URI は AppView の DID 配下にあって
 * 作者を指さないので、URI から読むのは親がカードに無いときだけにする。その場合こっそりの親は
 * 閲覧者と一致せず、目印が出ないほうへ倒れる。
 *
 * botたんの返信は除く。自分の投稿にはほぼ毎回付くので、目印にすると全部の投稿に出てしまう。
 */
export function isReplyToViewer(
	post: PostView,
	viewerDid: string | undefined,
	knownPosts: readonly PostView[],
): boolean {
	if (!viewerDid || !post.reply || post.deleted || post.isBot) return false;
	if (post.author.did === viewerDid) return false;
	const parentUri = post.reply.parent.uri;
	const parent = knownPosts.find((known) => known.uri === parentUri);
	const parentDid = parent ? parent.author.did : didFromAtUri(parentUri);
	return parentDid === viewerDid;
}

function didFromAtUri(uri: string): string | undefined {
	const match = /^at:\/\/([^/]+)\//.exec(uri);
	return match?.[1];
}
