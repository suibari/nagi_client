import { describe, expect, it } from 'vitest';
import { ApiRequestError, isAuthorizationError } from './appview';

describe('isAuthorizationError', () => {
	it('recognizes AppView and PDS authorization failures', () => {
		for (const status of [401, 403]) {
			expect(isAuthorizationError(new ApiRequestError(status, 'Forbidden', 'Denied'))).toBe(true);
			expect(isAuthorizationError(Object.assign(new Error('Denied'), { status }))).toBe(true);
		}
		expect(isAuthorizationError(new ApiRequestError(400, undefined, 'Missing scope'))).toBe(true);
		expect(isAuthorizationError(new ApiRequestError(400, undefined, 'Permission required'))).toBe(
			true,
		);
	});

	it('does not offer reauthorization for service or unrelated failures', () => {
		for (const error of [
			new ApiRequestError(503, 'not_configured', 'Not configured'),
			new ApiRequestError(500, undefined, 'Failed'),
			new ApiRequestError(400, undefined, 'Invalid prompt'),
			new Error('Network error'),
			null,
		]) {
			expect(isAuthorizationError(error)).toBe(false);
		}
	});
});
