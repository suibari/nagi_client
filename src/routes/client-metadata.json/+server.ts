import { env } from '$env/dynamic/private';
import { createOAuthClientMetadata, resolveOAuthDeployment } from '$lib/oauth/deployment';
import { FULL_SCOPE } from '$lib/oauth/client';
import { json } from '@sveltejs/kit';

export const prerender = true;

export function GET() {
	const deployment = resolveOAuthDeployment(env);
	return json(createOAuthClientMetadata(deployment, FULL_SCOPE));
}
