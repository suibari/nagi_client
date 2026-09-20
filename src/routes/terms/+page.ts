import { absolute, type PageSeo } from '$lib/seo/seo';

export const ssr = true;
export const prerender = true;

export const load = (): { seo: PageSeo } => ({
	seo: {
		title: 'Nagi 利用規約',
		description:
			'全肯定SNS Nagi（ナギ）の利用規約とコミュニティガイドライン。利用資格、禁止事項、保護される表現、違反への対応、AI機能の取り扱いについて記載しています。',
		canonical: absolute('/terms'),
	},
});
