import { absolute, type PageSeo } from '$lib/seo/seo';

export const ssr = true;
export const prerender = true;

export const load = (): { seo: PageSeo } => ({
	seo: {
		title: 'Nagi プライバシーポリシー',
		description:
			'全肯定SNS Nagi（ナギ）のプライバシーポリシー。どの情報をあなたのPDSとNagiのサーバのどちらに保存するか、AI機能でGoogleに何を送信するか、削除の方法を記載しています。',
		canonical: absolute('/privacy'),
	},
});
