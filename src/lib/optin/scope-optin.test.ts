import { describe, expect, it } from 'vitest';
import {
	BLUESKY_INTERACTION_REPO_SCOPES,
	BLUESKY_VIEW_RPC_SCOPES,
	BLUESKY_VIEW_SCOPES,
	CROSSPOST_SCOPE,
} from '$lib/oauth/client';
import { repoScopesCover, scopesCover } from './scope-optin';

describe('scopesCover', () => {
	it('matches granted scopes by name, ignoring aud and action parameters', () => {
		const granted = ['atproto', CROSSPOST_SCOPE, ...BLUESKY_VIEW_SCOPES].join(' ');
		expect(scopesCover(granted, BLUESKY_VIEW_RPC_SCOPES)).toBe(true);
		expect(scopesCover(granted, ['repo:app.bsky.feed.post'])).toBe(true);
	});

	it('does not treat crosspost-only sessions as able to read feeds', () => {
		expect(scopesCover(`atproto ${CROSSPOST_SCOPE}`, BLUESKY_VIEW_RPC_SCOPES)).toBe(false);
	});

	it('requires thread reading permission for sessions granted only the previous feed scopes', () => {
		const previous = BLUESKY_VIEW_SCOPES.filter(
			(scope) => !scope.startsWith('rpc:app.bsky.feed.getPostThread'),
		);
		expect(scopesCover(previous.join(' '), BLUESKY_VIEW_RPC_SCOPES)).toBe(false);
	});

	it('does not match a scope that merely shares a prefix', () => {
		expect(
			scopesCover('rpc:app.bsky.feed.getFeedGenerators?aud=*', ['rpc:app.bsky.feed.getFeed']),
		).toBe(false);
	});
});

describe('repoScopesCover', () => {
	const needDelete = ['repo:app.bsky.feed.post?action=create&action=delete'];

	it('does not treat create-only sessions as able to delete', () => {
		expect(repoScopesCover('atproto repo:app.bsky.feed.post?action=create', needDelete)).toBe(
			false,
		);
	});

	it('accepts the current crosspost scope and action-less grants', () => {
		expect(repoScopesCover(`atproto ${CROSSPOST_SCOPE}`, needDelete)).toBe(true);
		expect(repoScopesCover('atproto repo:app.bsky.feed.post', needDelete)).toBe(true);
		expect(repoScopesCover('atproto repo:*', needDelete)).toBe(true);
	});

	it('reads the collection query form', () => {
		expect(
			repoScopesCover(
				'repo?collection=app.bsky.feed.like&collection=app.bsky.feed.repost&action=create&action=delete',
				BLUESKY_INTERACTION_REPO_SCOPES.slice(0, 2),
			),
		).toBe(true);
	});

	it('requires every interaction collection', () => {
		const likeOnly = BLUESKY_INTERACTION_REPO_SCOPES[0];
		expect(repoScopesCover(likeOnly, BLUESKY_INTERACTION_REPO_SCOPES)).toBe(false);
	});
});
