import { BrowserOAuthClient } from '@atproto/oauth-client-browser';
const production = typeof location !== 'undefined' && location.hostname === 'nagi.suibari.com';
const origin = typeof location !== 'undefined' ? location.origin : 'http://127.0.0.1';
export const CROSSPOST_SCOPE = 'repo:app.bsky.feed.post';
const baseScopes = [
	'atproto',
	'repo:com.suibari.nagi.post',
	'repo:com.suibari.nagi.reaction',
	'repo:com.suibari.nagi.profile',
	'blob:image/*',
	'rpc:com.suibari.nagi.getTimeline?aud=did:web:nagi-api.suibari.com%23nagi_appview',
	'rpc:com.suibari.nagi.getAffirmation?aud=did:web:nagi-api.suibari.com%23nagi_appview',
	'rpc:com.suibari.nagi.getThread?aud=did:web:nagi-api.suibari.com%23nagi_appview',
	'rpc:com.suibari.nagi.getProfile?aud=did:web:nagi-api.suibari.com%23nagi_appview',
	'rpc:com.suibari.nagi.getNotifications?aud=did:web:nagi-api.suibari.com%23nagi_appview',
	'rpc:com.suibari.nagi.updateSeen?aud=did:web:nagi-api.suibari.com%23nagi_appview',
	'rpc:com.suibari.nagi.deleteAccountData?aud=did:web:nagi-api.suibari.com%23nagi_appview',
	'rpc:com.suibari.nagi.getLinkMetadata?aud=did:web:nagi-api.suibari.com%23nagi_appview',
	'rpc:com.suibari.nagi.getLinkThumbnail?aud=did:web:nagi-api.suibari.com%23nagi_appview',
];
// クロスポストはオプトインのため、通常のサインインでは base のみを要求する。
// クライアントメタデータには宣言可能な最大集合として crosspost も含める。
export const BASE_SCOPE = baseScopes.join(' ');
export const FULL_SCOPE = [...baseScopes, CROSSPOST_SCOPE].join(' ');
const scope = FULL_SCOPE;
export const oauthClient = new BrowserOAuthClient({
	clientMetadata: production
		? {
				client_id: 'https://nagi.suibari.com/client-metadata.json',
				client_name: 'Nagi',
				client_uri: 'https://nagi.suibari.com',
				redirect_uris: ['https://nagi.suibari.com/oauth/callback'],
				grant_types: ['authorization_code', 'refresh_token'],
				response_types: ['code'],
				scope,
				token_endpoint_auth_method: 'none',
				application_type: 'web',
				dpop_bound_access_tokens: true,
			}
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
	handleResolver: 'https://bsky.social',
});
