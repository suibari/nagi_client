import { absolute, type PageSeo } from '$lib/seo/seo';

export const ssr = true;
export const prerender = true;

export const load = (): { seo: PageSeo } => ({
	seo: {
		title: 'みんなの投稿 — Nagi（ナギ）',
		description:
			'Nagi（ナギ）の公開タイムライン。全肯定botたんが受け止めた、みんなの気持ちを読めます。',
		canonical: absolute('/feed'),
		// 中身はその時々のタイムラインで、プリレンダ HTML には見出ししか残らない。
		// 空に近いページを索引に載せないよう noindex にし、sitemap にも入れない。
		robots: 'noindex,follow',
	},
});
