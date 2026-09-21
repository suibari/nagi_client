import { error } from '@sveltejs/kit';
import { blogPath, fetchIndexableBlogs } from '$lib/blog/indexable';
import { extractTitle, stripMarkdown } from '$lib/atproto/markdown';
import { absolute, type PageSeo } from '$lib/seo/seo';
import type { IndexableBlog } from '$lib/api/types';

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
	seo: PageSeo;
}> => {
	const path = `/blog/${params.did}/${params.rkey}`;
	const post = (await fetchIndexableBlogs()).find((item) => blogPath(item.uri) === path);
	if (!post) error(404, 'Blog post not found');
	const title = extractTitle(post.text) ?? post.text.slice(0, 80);
	return {
		post,
		seo: {
			title: `${title} | Nagi（ナギ）`,
			description: stripMarkdown(post.text).slice(0, 160),
			canonical: absolute(path),
		},
	};
};
