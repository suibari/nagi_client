import { listIndexableBlogs } from '$lib/api/appview';
import type { IndexableBlog } from '$lib/api/types';

export function blogPath(uri: string): string {
	const match = /^at:\/\/(did:[^/]+)\/(?:com\.suibari\.nagi\.post|site\.standard\.document)\/([^/]+)$/.exec(uri);
	if (!match) throw new Error(`Invalid blog URI: ${uri}`);
	return `/blog/${match[1]}/${match[2]}`;
}

export async function collectIndexableBlogs(
	page: (cursor?: string) => Promise<{ items: IndexableBlog[]; cursor?: string; hasMore: boolean }>,
): Promise<IndexableBlog[]> {
	const items: IndexableBlog[] = [];
	let cursor: string | undefined;
	const seenCursors = new Set<string>();
	while (true) {
		const result = await page(cursor);
		items.push(...result.items);
		if (!result.hasMore || !result.items.length || !result.cursor || seenCursors.has(result.cursor))
			break;
		seenCursors.add(result.cursor);
		cursor = result.cursor;
	}
	return items;
}

let memo: Promise<IndexableBlog[]> | undefined;
export function fetchIndexableBlogs(): Promise<IndexableBlog[]> {
	return (memo ??= collectIndexableBlogs(listIndexableBlogs).catch((error) => {
		console.warn('[seo] 索引対象ブログを取得できませんでした:', error);
		return [];
	}));
}
