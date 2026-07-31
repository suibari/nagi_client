import type { ActorView, NewsView, PostView } from '$lib/api/types';

/**
 * ニュースに添えた botたんコメントを、ChatBubble へそのまま渡せる PostView に仕立てる。
 * コメントは PDS 上の独立したレコードではないので、uri はニュースのものへ
 * `#bot-comment` を足した合成値にする（リアクションはニュース本体へ付く）。
 *
 * ニュース一覧と my Nagi の横スクロールカードの両方から使う。
 */
export function newsBotPost(news: NewsView, botActor?: ActorView): PostView {
	return {
		uri: `${news.uri}#bot-comment`,
		cid: news.cid,
		author: botActor ?? {
			did: 'did:unknown:bot-tan',
			handle: 'bot-tan',
			displayName: 'Botたん',
			isBot: true,
		},
		text: news.botComment,
		langs: [news.lang],
		createdAt: news.createdAt,
		indexedAt: news.indexedAt,
		reactions: [],
		isBot: true,
		isAffirmation: false,
	};
}

/** 記事 URL のうち http(s) のものだけを通す。 */
export function safeNewsUrl(url: string): string | undefined {
	try {
		const parsed = new URL(url);
		return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : undefined;
	} catch {
		return undefined;
	}
}
