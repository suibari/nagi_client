import { absolute, type PageSeo } from '$lib/seo/seo';

export const ssr = true;
export const prerender = true;

export const load = (): { seo: PageSeo } => ({
	seo: {
		title: 'Nagi（ナギ）— 気持ちを残し、振り返れる。安心してつながるSNS',
		description:
			'Nagi（ナギ）は、いいねの数もフォロワー数もないAT Protocol上のSNSです。書いた気持ちは全肯定botたんが受け止め、日記と感情グラフになって残ります。',
		canonical: absolute('/'),
	},
});
