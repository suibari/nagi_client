import { describe, expect, it } from 'vitest';
import { BLUESKY_VIEW_RPC_SCOPES, BLUESKY_VIEW_SCOPES, CROSSPOST_SCOPE } from '$lib/oauth/client';
import { scopesCover } from './scope-optin';

describe('scopesCover', () => {
	it('matches granted scopes by name, ignoring aud and action parameters', () => {
		const granted = ['atproto', CROSSPOST_SCOPE, ...BLUESKY_VIEW_SCOPES].join(' ');
		expect(scopesCover(granted, BLUESKY_VIEW_RPC_SCOPES)).toBe(true);
		expect(scopesCover(granted, ['repo:app.bsky.feed.post'])).toBe(true);
	});

	it('does not treat crosspost-only sessions as able to read feeds', () => {
		expect(scopesCover(`atproto ${CROSSPOST_SCOPE}`, BLUESKY_VIEW_RPC_SCOPES)).toBe(false);
	});

	it('does not match a scope that merely shares a prefix', () => {
		expect(
			scopesCover('rpc:app.bsky.feed.getFeedGenerators?aud=*', ['rpc:app.bsky.feed.getFeed']),
		).toBe(false);
	});
});
