export const PRODUCTION_ORIGIN = 'https://nagi.suibari.com';

export type OAuthDeployment = {
	clientOrigin: `https://${string}`;
	clientId: `https://${string}`;
	redirectUri: `https://${string}`;
};

type DeploymentEnvironment = Readonly<Record<string, string | undefined>>;

function httpsOrigin(hostname: string, variableName: string): `https://${string}` {
	const url = new URL(`https://${hostname}`);
	if (url.hostname !== hostname || url.pathname !== '/' || url.search || url.hash || url.port) {
		throw new Error(`${variableName} must be a hostname without a path or protocol`);
	}
	return url.origin as `https://${string}`;
}

/**
 * Vercel Preview はデプロイ固有 URL ではなく、更新後も変わらないブランチ URL を
 * OAuth の正規 origin にする。認可サーバにキャッシュされるメタデータと、ブラウザの
 * origin 単位で保存される OAuth state / IndexedDB を同じ URL に固定するため。
 */
export function resolveOAuthDeployment(env: DeploymentEnvironment): OAuthDeployment {
	const clientOrigin =
		env.VERCEL_ENV === 'preview'
			? env.VERCEL_BRANCH_URL
				? httpsOrigin(env.VERCEL_BRANCH_URL, 'VERCEL_BRANCH_URL')
				: (() => {
						throw new Error(
							'VERCEL_BRANCH_URL is required for Preview OAuth. Enable Vercel system environment variables.',
						);
					})()
			: PRODUCTION_ORIGIN;

	return {
		clientOrigin,
		clientId: `${clientOrigin}/client-metadata.json` as `https://${string}`,
		redirectUri: `${clientOrigin}/oauth/callback` as `https://${string}`,
	};
}

export function createOAuthClientMetadata(deployment: OAuthDeployment, scope: string) {
	return {
		client_id: deployment.clientId,
		client_name: deployment.clientOrigin === PRODUCTION_ORIGIN ? 'Nagi' : 'Nagi Preview',
		client_uri: deployment.clientOrigin,
		tos_uri: `${deployment.clientOrigin}/terms`,
		policy_uri: `${deployment.clientOrigin}/privacy`,
		redirect_uris: [deployment.redirectUri] as [`https://${string}`, ...`https://${string}`[]],
		grant_types: ['authorization_code', 'refresh_token'] as ['authorization_code', 'refresh_token'],
		response_types: ['code'] as ['code'],
		scope,
		token_endpoint_auth_method: 'none' as const,
		application_type: 'web' as const,
		dpop_bound_access_tokens: true,
	};
}
