import { BrowserOAuthClient } from '@atproto/oauth-client-browser';
import { createOAuthClientMetadata } from './deployment';

/** Bluesky が提供する PDS 群の共通 OAuth / アカウント作成入口。 */
export const BLUESKY_ENTRYWAY_URL = 'https://bsky.social';

/** クロスポスト対象コレクション。付与判定の前方一致にも使う。 */
export const CROSSPOST_COLLECTION_SCOPE = 'repo:app.bsky.feed.post';
/** プロフィール設定から Bluesky profile の website だけを更新するための権限。 */
export const BLUESKY_PROFILE_COLLECTION_SCOPE = 'repo:app.bsky.actor.profile';
export const BLUESKY_PROFILE_SCOPE = `${BLUESKY_PROFILE_COLLECTION_SCOPE}?action=create&action=update`;
// Nagi は Bluesky 投稿を作成するだけで、更新・削除は一切行わない（cf. crosspost/bluesky.ts）。
// action 未指定は create/update/delete 全許可になるため、明示的に create のみへ絞る。
export const CROSSPOST_SCOPE = `${CROSSPOST_COLLECTION_SCOPE}?action=create`;
export const BLUEMOJI_SCOPE = 'repo:blue.moji.collection.item';
// standard.site（長文記事の共通 lexicon）へのオプトイン公開に使うコレクション。
// 記事は作成だけでなく編集(putRecord)・削除も Nagi の投稿に追従させるため、
// crosspost と違って action は絞らない。
// site.standard.authFull という permission set も公開されているが、
// subscription / recommend まで含む過剰な束なので採らない。
export const STANDARD_SITE_COLLECTION_SCOPES = [
	'repo:site.standard.publication',
	'repo:site.standard.document',
];
// Nagi namespace の repo/rpc 権限は permission set に集約し、公開済み lexicon を真実源にする。
// 定義: bsky-affirmative-bot/packages/nagi-lexicon/lexicons/com/suibari/nagi/appviewAccess.json
// blob と別 namespace の Bluemoji repo 権限は permission set に入れられないため直接スコープで残す。
// rpc aud は permission set 側で "aud":"*" にハードコード（旧 PDS の bare-aud 照合対応, cf. Skyblur）。
// そのため include に aud パラメータは付けない。真実源は nagi-lexicon の NAGI_OAUTH_SCOPE。
const baseScopes = [
	'atproto',
	'blob:image/*',
	'include:com.suibari.nagi.appviewAccess',
	BLUEMOJI_SCOPE,
	BLUESKY_PROFILE_SCOPE,
];
/** サインイン時に追加で要求するオプトイン権限。どちらも既定は要求しない。 */
export type ScopeOptIns = { crosspost?: boolean; standardSite?: boolean };

/**
 * オプトインの組み合わせからスコープ文字列を組み立てる。
 * 有効化済みのものを落とすと黙って機能が止まるので、呼び出し側は
 * 「今付与されているもの + 今回追加するもの」を渡すこと（cf. lib/optin/scope-optin.ts）。
 */
export function buildScope(optIns: ScopeOptIns = {}): string {
	const scopes = [...baseScopes];
	if (optIns.crosspost) scopes.push(CROSSPOST_SCOPE);
	if (optIns.standardSite) scopes.push(...STANDARD_SITE_COLLECTION_SCOPES);
	return scopes.join(' ');
}

// クロスポストと standard.site はオプトインのため、通常のサインインでは base のみを要求する。
// クライアントメタデータには宣言可能な最大集合として両方を含める。
export const BASE_SCOPE = buildScope();
export const FULL_SCOPE = buildScope({ crosspost: true, standardSite: true });
const scope = FULL_SCOPE;

let oauthClient: BrowserOAuthClient | undefined;
type SessionDeletedHandler = (sub: string, cause: unknown) => void;
const sessionDeletedHandlers = new Set<SessionDeletedHandler>();

export function onOAuthSessionDeleted(handler: SessionDeletedHandler): () => void {
	sessionDeletedHandlers.add(handler);
	return () => sessionDeletedHandlers.delete(handler);
}

/**
 * BrowserOAuthClient は生成時に IndexedDB を開くため、プリレンダリング中には生成しない。
 * 公開ページを静的HTMLにしつつ、ブラウザでは従来どおり単一のクライアントを共有する。
 */
export function getOAuthClient(): BrowserOAuthClient {
	if (typeof location === 'undefined') {
		throw new Error('OAuth client is only available in the browser');
	}
	if (oauthClient) return oauthClient;

	const origin = location.origin;
	const localDevelopment =
		location.protocol === 'http:' &&
		['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
	if (!localDevelopment && origin !== __NAGI_OAUTH_DEPLOYMENT__.clientOrigin) {
		location.replace(
			`${__NAGI_OAUTH_DEPLOYMENT__.clientOrigin}${location.pathname}${location.search}${location.hash}`,
		);
		throw new Error('Moving to the canonical OAuth origin');
	}

	oauthClient = new BrowserOAuthClient({
		onSessionDeleted: (sub, cause) => {
			for (const handler of sessionDeletedHandlers) handler(sub, cause);
		},
		// 本番だけでなく preview(develop) でもサインインできるよう、client metadata は
		// デプロイ先から組み立てる。ローカル開発だけは loopback client を使う。
		clientMetadata: !localDevelopment
			? createOAuthClientMetadata(__NAGI_OAUTH_DEPLOYMENT__, scope)
			: {
					client_id: `http://localhost?redirect_uri=${encodeURIComponent(`${origin}/oauth/callback`)}&scope=${encodeURIComponent(scope)}`,
					client_name: 'Nagi (local development)',
					client_uri: origin,
					redirect_uris: [`${origin}/oauth/callback`],
					grant_types: ['authorization_code', 'refresh_token'],
					response_types: ['code'],
					scope,
					token_endpoint_auth_method: 'none',
					application_type: 'native',
					dpop_bound_access_tokens: true,
				},
		handleResolver: BLUESKY_ENTRYWAY_URL,
	});
	return oauthClient;
}
