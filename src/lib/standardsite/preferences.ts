import { hasOptInScope } from '$lib/optin/scope-optin';

/** 現在のセッションに、ログイン時必須の site.standard.* 書き込み権限が付与されているか。 */
export const hasStandardSiteScope = () => hasOptInScope('standardSite');

/**
 * その投稿を「ブログとしても出す」候補に載せてよいか。
 * 記事は公開レコードとして外部から読まれるので、Nagi のタイムラインに出さない投稿
 * （こっそり投稿・チャンネル投稿）は対象外にする。長さでは絞らない。
 */
export function isArticleCandidate(input: { kossori?: boolean; channel?: unknown }): boolean {
	return !input.kossori && !input.channel;
}
