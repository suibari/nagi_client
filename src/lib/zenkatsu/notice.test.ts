import { describe, expect, it } from 'vitest';
import { playDay } from './notice';

describe('playDay', () => {
	it('switches at 4 AM in Japan', () => {
		expect(playDay(Date.parse('2026-09-18T18:59:59Z'))).toBe('2026-09-18');
		expect(playDay(Date.parse('2026-09-18T19:00:00Z'))).toBe('2026-09-19');
	});
});
