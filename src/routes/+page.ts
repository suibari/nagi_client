import { absolute, type PageSeo } from '$lib/seo/seo';

export const ssr = true;
export const prerender = true;

export const load = (): { seo: PageSeo } => ({
	seo: {
		title: 'Nagi（ナギ）— 気持ちを残し、ゆるくつながるSNS',
		description:
			'Nagi（ナギ）は、全肯定botたんが言葉を受け止める、AT Protocol上の全肯定SNSです。いいねやフォローを気にせず、自由に気持ちを投稿できます。',
		canonical: absolute('/'),
	},
});
