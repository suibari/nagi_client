import type { ActorView, CommunityAffirmationView, PostView } from '$lib/api/types';

export const hasCommunityAffirmationTimestamp = (item: CommunityAffirmationView) =>
	typeof item.createdAt === 'string' && !Number.isNaN(Date.parse(item.createdAt));

/** 匿名要約を、通常のbotたん吹き出しで表示するための読み取り専用PostViewへ整える。 */
export function communityAffirmationBotPost(
	item: CommunityAffirmationView,
	botActor?: ActorView,
): PostView {
	// AppViewとのローリング更新中に旧レスポンスが来ても、Invalid Dateを描画しない。
	// この代替値は呼び出し側が日時を隠す場合にだけ使われる。
	const createdAt = hasCommunityAffirmationTimestamp(item)
		? item.createdAt
		: '1970-01-01T00:00:00.000Z';
	return {
		uri: `${item.uri}#community-affirmation`,
		cid: item.cid,
		author: botActor ?? {
			did: 'did:unknown:bot-tan',
			handle: 'bot-tan',
			displayName: 'Botたん',
			isBot: true,
		},
		text: item.summary,
		images: item.images,
		linkCards: item.linkCards,
		createdAt,
		indexedAt: createdAt,
		reactions: [],
		isBot: true,
		isAffirmation: false,
	};
}
