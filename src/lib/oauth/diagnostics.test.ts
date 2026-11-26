import { afterEach, describe, expect, it, vi } from 'vitest';
import { track } from '@vercel/analytics';
import { trackUmami } from '$lib/analytics/umami';
import { classifyOAuthFailure, reportOAuthDiagnostic } from './diagnostics';

vi.mock('@vercel/analytics', () => ({ track: vi.fn() }));
vi.mock('$lib/analytics/umami', () => ({ trackUmami: vi.fn() }));

describe('classifyOAuthFailure', () => {
	it('separates transient network failures from permanent refresh rejection', () => {
		expect(classifyOAuthFailure(new TypeError('Failed to fetch'))).toBe('network');
		expect(classifyOAuthFailure(new TypeError('Cannot read properties of undefined'))).toBe(
			'unknown',
		);
		expect(classifyOAuthFailure(new Error('OAuth invalid_grant during refresh'))).toBe(
			'refresh-rejected',
		);
	});

	it('recognizes missing browser storage and DPoP failures', () => {
		expect(classifyOAuthFailure(new Error('Session not found in session store'))).toBe(
			'storage-missing',
		);
		expect(classifyOAuthFailure(new Error('Invalid DPoP proof nonce'))).toBe('dpop');
	});
});

describe('reportOAuthDiagnostic', () => {
	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	it('両方の計測先へ固定の診断項目を渡す', () => {
		vi.stubGlobal('navigator', { onLine: true, locks: {} });
		vi.stubGlobal('window', {});
		vi.stubGlobal('localStorage', { getItem: () => null });
		vi.spyOn(console, 'warn').mockImplementation(() => {});

		reportOAuthDiagnostic(
			'restore-failed',
			new Error('Network failed', { cause: new Error('Fixture response') }),
		);

		const fields = {
			failure: 'network',
			online: true,
			locks: true,
			display: 'browser',
			hoursSinceSuccess: null,
		};
		expect(track).toHaveBeenCalledExactlyOnceWith('oauth_restore_failed', fields);
		expect(trackUmami).toHaveBeenCalledExactlyOnceWith('oauth_restore_failed', fields);
	});
});
