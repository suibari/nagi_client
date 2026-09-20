import { fetchIndexableNews } from '$lib/news/indexable';
import type { ActorView, NewsView } from '$lib/api/types';
import { absolute, type PageSeo } from '$lib/seo/seo';

export const ssr = true;
export const prerender = true;

/**
 * プリレンダに焼き込む件数。ハイドレーション後は通常どおり getPositiveNews が
 * 同じ件数を取り直すので、ここは「クローラと初回表示が見る分」だけでよい。
 */
const SEED_LIMIT = 20;

export const load = async (): Promise<{
	seed: NewsView[];
	seedBotActor?: ActorView;
	seo: PageSeo;
}> => {
	// listIndexableNews を使う（getPositiveNews ではなく）。理由は2つ:
	// - 成人向けラベルの記事を必ず除外する。未認証ビューアは成人扱いなので、
	//   getPositiveNews をそのまま焼くとクローラに出てしまう
	// - 利用者投稿のニュースには submittedBy（handle・表示名）が付く。PDS 由来の
	//   識別情報なので、検索公開のオプトインが入るまで静的HTMLに載せない
	const { items, botActor } = await fetchIndexableNews();
	return {
		seed: items.slice(0, SEED_LIMIT),
		seedBotActor: botActor,
		seo: {
			title: '全肯定ニュース — 明るいニュースだけを毎日 | Nagi（ナギ）',
			description:
				'全肯定botたんが選んだ、読んで心が軽くなるニュースだけを毎日お届けします。1本ずつbotたんのひとこと付き。Nagi（ナギ）の全肯定ニュース。',
			canonical: absolute('/news'),
			// 取得に失敗したビルド（AppView が未デプロイ・不調）で、中身の無い一覧を
			// 索引させない。空の殻を索引させるのは noindex より悪い。
			// 次に中身の取れたビルドが走れば自動で index へ戻る。
			...(items.length ? {} : { robots: 'noindex,follow' as const }),
		},
	};
};
