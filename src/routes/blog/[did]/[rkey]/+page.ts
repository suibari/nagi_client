import { error } from '@sveltejs/kit';
import { blogPath, fetchIndexableBlogs } from '$lib/blog/indexable';
import { extractTitle, stripMarkdown } from '$lib/atproto/markdown';
import { absolute, type PageSeo } from '$lib/seo/seo';
import type { IndexableBlog } from '$lib/api/types';
import type { ThreadView } from '$lib/api/types';
import { getThread } from '$lib/api/appview';
import { getRecord } from '$lib/atproto/pds';

export const ssr = true;
export const prerender = true;

export async function entries(): Promise<Array<{ did: string; rkey: string }>> {
	return (await fetchIndexableBlogs()).map((post) => {
		const [, , did, rkey] = blogPath(post.uri).split('/');
		return { did, rkey };
	});
}

export const load = async ({
	params,
}: {
	params: { did: string; rkey: string };
}): Promise<{
	post: IndexableBlog;
	thread?: ThreadView;
	tags: string[];
	seo: PageSeo;
}> => {
	const path = `/blog/${params.did}/${params.rkey}`;
	const documentUri = `at://${params.did}/site.standard.document/${params.rkey}`;
	const legacyUri = `at://${params.did}/com.suibari.nagi.post/${params.rkey}`;
	const [indexedPost, thread] = await Promise.all([
		fetchIndexableBlogs().then((items) => items.find((item) => blogPath(item.uri) === path)),
		getThread(documentUri)
			.then((result) => result.thread)
			.catch(() => getThread(legacyUri).then((result) => result.thread).catch(() => undefined)),
	]);
	if (thread && (thread.post.deleted || !thread.post.article)) error(404, 'Blog post not found');
	const post: IndexableBlog | undefined = thread
		? {
				uri: thread.post.uri,
				text: thread.post.text,
				author: thread.post.author,
				createdAt: thread.post.createdAt,
				indexedAt: thread.post.indexedAt,
			}
		: indexedPost;
	if (!post) error(404, 'Blog post not found');
	// 記事本体は prerender で残し、画像や著者情報も取得できれば HTML に含める。
	// AppView が一時的に読めなくても記事本文の公開は続ける。
	const text = thread?.post.text ?? post.text;
	const title = extractTitle(text) ?? text.slice(0, 80);
	let tags: string[] = [];
	try {
		const record = await getRecord(params.did, 'site.standard.document', params.rkey);
		if (Array.isArray(record?.value.tags))
			tags = record.value.tags.filter((tag: unknown): tag is string => typeof tag === 'string');
	} catch {
		// 旧記事や PDS の一時エラーではタグ欄だけを省く。
	}
	return {
		post,
		thread,
		tags,
		seo: {
			title: `${title} | Nagi（ナギ）`,
			description: stripMarkdown(text).slice(0, 160),
			canonical: absolute(path),
		},
	};
};
