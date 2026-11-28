import { extractTitle, stripMarkdown } from '$lib/atproto/markdown';
import { getRecord } from '$lib/atproto/pds';
import { get } from 'svelte/store';
import { listIndexableBlogs } from '$lib/api/appview';
import type { IndexableBlog } from '$lib/api/types';
import { mutes } from '$lib/mute/mutes.svelte';
import { session } from '$lib/oauth/session.svelte';
import { splitArticleText } from './articleText';
import { collectIndexableBlogs, fetchIndexableBlogs } from './indexable';

export type BlogDirectoryItem = IndexableBlog & {
	title: string;
	description: string;
	tags: string[];
	headerImage?: string;
	optimisticKey?: string;
	optimisticState?: 'sending' | 'indexing';
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
	const article = splitArticleText(post.text);
	// 既存の自動概要は本文全体を平文化し、長い場合は末尾に「…」を付けて保存している。
	const generatedDescription =
		recordDescription === plain ||
		(recordDescription.length > 1 &&
			recordDescription.endsWith('…') &&
			plain.startsWith(recordDescription.slice(0, -1)));
	const description =
		recordDescription && !(article.prefix && generatedDescription)
			? recordDescription
			: stripMarkdown(article.body).slice(0, 200);
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
		description,
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

/** mutesVersion は AppView がミュートで絞ったときの mutes.version。公開の一覧には無い。 */
export type BlogDirectory = { items: BlogDirectoryItem[]; mutesVersion?: number };

let memo: { key: string; directory: Promise<BlogDirectory> } | undefined;

/**
 * ブログ一覧に、各 standard.site document が持つタグと概要を付ける。
 * ログイン中はミュートで絞った一覧を取り、取れなければ公開の一覧を返す。
 */
export function fetchBlogDirectory(options: { refresh?: boolean } = {}): Promise<BlogDirectory> {
	const did = get(session)?.did;
	const version = mutes.version;
	const key = `${did ?? ''}\u0000${version}`;
	if (options.refresh || memo?.key !== key)
		memo = { key, directory: loadBlogDirectory(did, version, options.refresh) };
	return memo.directory;
}

async function loadBlogDirectory(
	did: string | undefined,
	version: number,
	refresh?: boolean,
): Promise<BlogDirectory> {
	let posts: IndexableBlog[] | undefined;
	let mutesVersion: number | undefined;
	if (did) {
		try {
			posts = await collectIndexableBlogs((cursor) => listIndexableBlogs(cursor, 'required'));
			mutesVersion = version;
		} catch {
			// 権限の無い古いセッションなどは公開の一覧へ落とし、仮の除外で補う。
		}
	}
	posts ??= await fetchIndexableBlogs({ refresh });
	const items = await Promise.all(
		posts.map(async (post) => {
			const location = blogDocumentLocation(post.uri);
			if (!location) return buildBlogDirectoryItem(post);
			const document = await getRecord(location.did, 'site.standard.document', location.rkey);
			return buildBlogDirectoryItem(post, document?.value);
		}),
	);
	return { items, ...(mutesVersion === undefined ? {} : { mutesVersion }) };
}

/** AppView が今のミュートで絞った一覧でなければ、仮に除いて返す（PROFILE-05）。 */
export function visibleBlogItems(directory: BlogDirectory): BlogDirectoryItem[] {
	if (directory.mutesVersion === mutes.version) return directory.items;
	return directory.items.filter((item) => !mutes.hidesProvisionally(item.author.did, item.tags));
}
