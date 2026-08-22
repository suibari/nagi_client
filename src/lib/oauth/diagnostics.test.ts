import { describe, expect, it } from 'vitest';
import { classifyOAuthFailure } from './diagnostics';

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
