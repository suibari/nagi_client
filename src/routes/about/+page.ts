import { absolute, type PageSeo } from '$lib/seo/seo';

export const ssr = true;
export const prerender = true;

export const load = (): { seo: PageSeo } => ({
	seo: {
		title: 'Nagiについて — 全肯定SNS Nagi（ナギ）',
		description:
			'全肯定SNS Nagi（ナギ）が選ばれる理由と、はじめかた。全肯定botたんが必ず返信し、いいねもフォローもなく、Markdownのブログなら文字数を気にせず書けます。日記・感情グラフ・自分年表で、自分の日々をふりかえることもできます。投稿はAT Protocolであなた自身のPDSに残ります。',
		canonical: absolute('/about'),
	},
});
