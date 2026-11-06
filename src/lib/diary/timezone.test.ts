import { describe, expect, it } from 'vitest';
import type { DiaryDayPreferences } from '$lib/api/types';
import { timezoneToReport } from './timezone';

const prefs = (extra: Partial<DiaryDayPreferences> = {}): DiaryDayPreferences => ({
	startHour: 22,
	current: { timezone: 'Asia/Tokyo', startHour: 22 },
	...extra,
});

describe('timezoneToReport', () => {
	it('sends a new or changed zone', () => {
		expect(timezoneToReport(prefs(), 'Europe/London')).toBe('Europe/London');
		expect(timezoneToReport(prefs({ detectedTimezone: 'Asia/Tokyo' }), 'Europe/London')).toBe(
			'Europe/London',
		);
	});

	it('does not resend the same zone', () => {
		expect(timezoneToReport(prefs({ detectedTimezone: 'Europe/London' }), 'Europe/London')).toBe(
			undefined,
		);
	});

	it('stays quiet while a zone is chosen by hand', () => {
		expect(timezoneToReport(prefs({ manualTimezone: 'Asia/Tokyo' }), 'Europe/London')).toBe(
			undefined,
		);
	});

	it('does not send to an old AppView or a hidden zone', () => {
		expect(timezoneToReport(undefined, 'Europe/London')).toBe(undefined);
		expect(timezoneToReport(prefs(), 'UTC')).toBe(undefined);
		expect(timezoneToReport(prefs(), 'Etc/GMT-9')).toBe(undefined);
		expect(timezoneToReport(prefs(), undefined)).toBe(undefined);
	});
});
