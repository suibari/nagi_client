import { describe, expect, it } from 'vitest';
import { QR_QUIET_MODULES, QR_SIZE } from './design';
import { qrRenderData } from './qr';

describe('shared profile-card QR data', () => {
	it('keeps Canvas and OGP geometry derived from the same matrix', () => {
		const data = qrRenderData('https://nagi.suibari.com/profile/did:plc:uixgxpiqf4i63p6rgpu7ytmx');

		expect(data.modules).toBe(data.matrix.length);
		expect(data.matrix.every((row) => row.length === data.modules)).toBe(true);
		expect(data.cell * data.modules).toBeCloseTo(QR_SIZE);
		expect(data.quiet).toBeCloseTo(data.cell * QR_QUIET_MODULES);
		expect(data.path).toContain('M');
		expect(data.path.match(/M/g)).toHaveLength(data.matrix.flat().filter(Boolean).length);
	});

	it('encodes the destination URL rather than reusing a fixed QR', () => {
		const first = qrRenderData('https://nagi.suibari.com/profile/did:plc:first');
		const second = qrRenderData('https://nagi.suibari.com/profile/did:plc:second');

		expect(first.matrix).not.toEqual(second.matrix);
		expect(first.path).not.toBe(second.path);
	});
});
