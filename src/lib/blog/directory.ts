import { extractTitle, stripMarkdown } from '$lib/atproto/markdown';
import { getRecord } from '$lib/atproto/pds';
import type { IndexableBlog } from '$lib/api/types';
import { fetchIndexableBlogs } from './indexable';

export type BlogDirectoryItem = IndexableBlog & {
	title: string;
	description: string;
	tags: string[];
	headerImage?: string;
};

const normalize = (value: string) => value.trim().toLocaleLowerCase();

function blobCid(value: unknown): string | undefined {
	if (!value || typeof value !== 'object') return undefined;
	const ref = (value as { ref?: unknown }).ref;
	if (typeof ref === 'string') return ref;
	if (!ref || typeof ref !== 'object') return undefined;
	const link = (ref as { $link?: unknown }).$link;
	return typeof link === 'string' ? link : undefined;
}

export function blogDocumentLocation(uri: string): { did: string; rkey: string } | undefined {
	const match =
		/^at:\/\/(did:[^/]+)\/(?:com\.suibari\.nagi\.post|site\.standard\.document)\/([^/]+)$/.exec(
			uri,
		);
	return match ? { did: match[1], rkey: match[2] } : undefined;
}

export function buildBlogDirectoryItem(
	post: IndexableBlog,
	record?: Record<string, unknown> | null,
): BlogDirectoryItem {
	const plain = stripMarkdown(post.text);
	const recordTitle = typeof record?.title === 'string' ? record.title.trim() : '';
	const recordDescription =
		typeof record?.description === 'string' ? record.description.trim() : '';
	const tags = Array.isArray(record?.tags)
		? [
				...new Set(
					record.tags
						.filter((tag): tag is string => typeof tag === 'string')
						.map((tag) => tag.trim().replace(/^[#＃]+/, ''))
						.filter(Boolean),
				),
			]
		: [];
	const coverCid = blobCid(record?.coverImage);
	return {
		...post,
		title: recordTitle || extractTitle(post.text) || plain.slice(0, 80),
		description: recordDescription || plain.slice(0, 200),
		tags,
		...(coverCid
			? {
					headerImage: `/api/blob/${encodeURIComponent(post.author.did)}/${encodeURIComponent(coverCid)}`,
				}
			: {}),
	};
}

export function blogMatches(item: BlogDirectoryItem, query: string): boolean {
	const needle = normalize(query);
	if (!needle) return true;
	return [
		item.title,
		item.description,
		item.text,
		item.author.displayName ?? '',
		item.author.handle,
		...item.tags,
	].some((value) => normalize(value).includes(needle));
}

let memo: Promise<BlogDirectoryItem[]> | undefined;

/** 公開ブログ一覧に、各 standard.site document が持つタグと概要を付ける。 */
export function fetchBlogDirectory(): Promise<BlogDirectoryItem[]> {
	return (memo ??= fetchIndexableBlogs().then((posts) =>
		Promise.all(
			posts.map(async (post) => {
				const location = blogDocumentLocation(post.uri);
				if (!location) return buildBlogDirectoryItem(post);
				const document = await getRecord(location.did, 'site.standard.document', location.rkey);
				return buildBlogDirectoryItem(post, document?.value);
			}),
		),
	));
}
