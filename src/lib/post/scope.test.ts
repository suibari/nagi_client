import { afterEach, describe, expect, it } from 'vitest';
import {
	defaultScopeForPath,
	restorePostScope,
	scopeAfterExternalEligibility,
	setLastPostScope,
} from './scope';

const values = new Map<string, string>();
const windowStub = {
	localStorage: {
		getItem: (key: string) => values.get(key) ?? null,
		setItem: (key: string, value: string) => values.set(key, value),
	},
};

afterEach(() => {
	values.clear();
	Reflect.deleteProperty(globalThis, 'window');
});

describe('post scope persistence', () => {
	it('restores the last external scope over a page default', () => {
		Object.assign(globalThis, { window: windowStub });
		setLastPostScope('external');
		expect(restorePostScope('feed')).toBe('external');
		expect(defaultScopeForPath('/')).toBe('external');
	});

	it('keeps external while OAuth readiness is still loading', () => {
		expect(scopeAfterExternalEligibility('external', false, false)).toBe('external');
	});

	it('narrows external only after unavailability is confirmed', () => {
		expect(scopeAfterExternalEligibility('external', true, false)).toBe('feed');
		expect(scopeAfterExternalEligibility('external', true, true)).toBe('external');
	});
});
