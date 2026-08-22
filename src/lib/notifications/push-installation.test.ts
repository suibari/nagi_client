import { describe, expect, it } from 'vitest';
import { createPushInstallation } from './push-installation';

describe('createPushInstallation', () => {
	it('creates an unguessable installation-scoped capability', () => {
		const first = createPushInstallation('did:plc:alice');
		const second = createPushInstallation('did:plc:alice');
		expect(first.recipientDid).toBe('did:plc:alice');
		expect(first.installationId).toMatch(/^[0-9a-f-]{36}$/i);
		expect(first.capability).toMatch(/^[A-Za-z0-9_-]{43}$/);
		expect(first).not.toEqual(second);
	});
});
