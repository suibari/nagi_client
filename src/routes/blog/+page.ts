import { buildBlogDirectoryItem } from '$lib/blog/directory';
import { fetchIndexableBlogs } from '$lib/blog/indexable';
import { absolute, type PageSeo } from '$lib/seo/seo';
import type { BlogDirectoryItem } from '$lib/blog/directory';

export const ssr = true;
export const prerender = true;

export const load = async (): Promise<{ seed: BlogDirectoryItem[]; seo: PageSeo }> => {
	const posts = await fetchIndexableBlogs();
	return {
		// タグは hydration 後に各 document から補う。静的 HTML にも記事そのものは残す。
		seed: posts.map((post) => buildBlogDirectoryItem(post)),
		seo: {
			title: 'ブログ | Nagi（ナギ）',
			description: 'Nagiで公開されたブログを、著者やタグから見つけて読めます。',
			canonical: absolute('/blog'),
			...(posts.length ? {} : { robots: 'noindex,follow' as const }),
		},
	};
};
