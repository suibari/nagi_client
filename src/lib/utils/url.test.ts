import { describe, expect, it } from 'vitest';
import { isInternalUrl, toInternalPath } from './url';

describe('url utils', () => {
	it('should identify relative paths as internal', () => {
		expect(isInternalUrl('/profile/test')).toBe(true);
		expect(isInternalUrl('/terms')).toBe(true);
		expect(isInternalUrl('/search?tag=nagi')).toBe(true);
	});

	it('should not identify protocol relative or external URLs as internal without window', () => {
		expect(isInternalUrl('//example.com')).toBe(false);
		expect(isInternalUrl('https://example.com/foo')).toBe(false);
		expect(isInternalUrl(undefined)).toBe(false);
		expect(isInternalUrl(null)).toBe(false);
	});

	it('should convert internal URLs to relative path', () => {
		expect(toInternalPath('/profile/test')).toBe('/profile/test');
		expect(toInternalPath('https://nagi.app/profile/test?foo=bar#hash')).toBe('/profile/test?foo=bar#hash');
		expect(toInternalPath('https://example.com/profile/test')).toBe(undefined);
	});
});
