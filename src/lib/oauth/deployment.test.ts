import { describe, expect, it } from 'vitest';
import { createOAuthClientMetadata, PRODUCTION_ORIGIN, resolveOAuthDeployment } from './deployment';

describe('resolveOAuthDeployment', () => {
	it('uses the public Nagi origin outside Vercel Preview', () => {
		expect(resolveOAuthDeployment({})).toEqual({
			clientOrigin: PRODUCTION_ORIGIN,
			clientId: 'https://nagi.suibari.com/client-metadata.json',
			redirectUri: 'https://nagi.suibari.com/oauth/callback',
		});
	});

	it('uses the stable branch URL for Vercel Preview', () => {
		expect(
			resolveOAuthDeployment({
				VERCEL_ENV: 'preview',
				VERCEL_BRANCH_URL: 'nagi-client-git-develop-suibari.vercel.app',
			}),
		).toEqual({
			clientOrigin: 'https://nagi-client-git-develop-suibari.vercel.app',
			clientId: 'https://nagi-client-git-develop-suibari.vercel.app/client-metadata.json',
			redirectUri: 'https://nagi-client-git-develop-suibari.vercel.app/oauth/callback',
		});
	});

	it('fails Preview builds that cannot determine the stable branch URL', () => {
		expect(() => resolveOAuthDeployment({ VERCEL_ENV: 'preview' })).toThrow(
			'VERCEL_BRANCH_URL is required',
		);
	});

	it('rejects a branch URL containing a path or protocol', () => {
		expect(() =>
			resolveOAuthDeployment({
				VERCEL_ENV: 'preview',
				VERCEL_BRANCH_URL: 'https://example.vercel.app/callback',
			}),
		).toThrow('VERCEL_BRANCH_URL must be a hostname');
	});
});

describe('createOAuthClientMetadata', () => {
	it('keeps the client ID and callback on the resolved origin', () => {
		const deployment = resolveOAuthDeployment({
			VERCEL_ENV: 'preview',
			VERCEL_BRANCH_URL: 'nagi-client-git-develop-suibari.vercel.app',
		});
		const metadata = createOAuthClientMetadata(deployment, 'atproto repo:example.record');

		expect(metadata).toMatchObject({
			client_id: `${deployment.clientOrigin}/client-metadata.json`,
			client_uri: deployment.clientOrigin,
			redirect_uris: [`${deployment.clientOrigin}/oauth/callback`],
			application_type: 'web',
			scope: 'atproto repo:example.record',
		});
	});
});
