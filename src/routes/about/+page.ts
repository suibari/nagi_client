import { absolute, type PageSeo } from '$lib/seo/seo';

export const ssr = true;
export const prerender = true;

export const load = (): { seo: PageSeo } => ({
	seo: {
		title: 'Nagiについて — 全肯定SNS Nagi（ナギ）',
		description:
			'全肯定SNS Nagi（ナギ）が選ばれる理由と、はじめかた。全肯定botたんが必ず返信し、いいねもフォローもなく、3000文字のMarkdownで長く書けます。投稿はAT Protocolであなた自身のPDSに残ります。',
		canonical: absolute('/about'),
	},
});
