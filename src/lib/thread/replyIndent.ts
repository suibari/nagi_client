import type { PostView } from '$lib/api/types';

/** タイムラインとスレッドページで共通の、返信深度から見た目の段数への変換。 */
export function replyIndent(depth: number): number {
	return Math.min(Math.max(0, depth - 1), 5);
}

/**
 * reply.parent をたどり、ルートからの返信ホップ数を返す。
 * 欠けた親や循環した参照があっても表示を止めず、取得できた範囲の深度を使う。
 */
export function replyDepths(rootUri: string, posts: PostView[]): Map<string, number> {
	const parentByUri = new Map(posts.map((post) => [post.uri, post.reply?.parent.uri]));
	const depths = new Map<string, number>();

	for (const post of posts) {
		let depth = 0;
		let current: string | undefined = post.uri;
		const seen = new Set<string>();
		while (current && current !== rootUri && !seen.has(current)) {
			seen.add(current);
			current = parentByUri.get(current);
			depth += 1;
			if (depth > 64) break;
		}
		depths.set(post.uri, depth);
	}

	return depths;
}
