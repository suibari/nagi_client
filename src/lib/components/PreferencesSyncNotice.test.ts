import { describe, expect, it, vi } from 'vitest';
import { render } from 'svelte/server';
vi.mock('$lib/oauth/session.svelte', async () => {
	const { writable } = await import('svelte/store');
	return { session: writable({ did: 'did:plc:alice' }), signIn: vi.fn() };
});
vi.mock('$lib/preferences/sync.svelte', () => ({ retryPreferences: vi.fn() }));
vi.mock('$lib/preferences/preferences.svelte', () => ({
	preferences: { loading: false, loadFailed: false, unauthorized: false, retryable: false },
}));
vi.mock('$lib/optin/scope-optin', () => ({ grantedOptIns: vi.fn() }));
vi.mock('$lib/i18n/i18n.svelte', () => ({
	m: {
		preferencesSyncLoading: () => 'Syncing favorites',
		preferencesSyncFailed: () => 'Could not load favorites',
		preferencesSyncRetrying: () => 'Retrying automatically',
		preferencesSyncRetry: () => 'Retry',
		preferencesSyncUnavailable: () => 'Authorization required',
		preferencesSyncReauthorize: () => 'Sign in again',
	},
}));
import Notice from './PreferencesSyncNotice.svelte';
import { preferences } from '$lib/preferences/preferences.svelte';

describe('preference sync status', () => {
	it('shows a distinct loading, failure and recovered state', () => {
		preferences.loading = true;
		expect(render(Notice).body).toContain('Syncing favorites');
		preferences.loading = false;
		preferences.loadFailed = true;
		preferences.retryable = true;
		const failed = render(Notice).body;
		expect(failed).toContain('Could not load favorites');
		expect(failed).toContain('Retrying automatically');
		expect(failed).toContain('Retry');
		preferences.loadFailed = false;
		expect(render(Notice).body).not.toContain('Could not load favorites');
	});
	it('offers reauthorization instead of automatic retries for scope errors', () => {
		preferences.unauthorized = true;
		const html = render(Notice).body;
		expect(html).toContain('Authorization required');
		expect(html).toContain('Sign in again');
		expect(html).not.toContain('Retrying automatically');
	});
});
