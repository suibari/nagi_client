import { describe, expect, it } from 'vitest';
import { diaryDayRange, getDiaryDateKey } from './date';

describe('3行日記の日付', () => {
	it('正午より前は前日の日記として数える', () => {
		expect(getDiaryDateKey(new Date(2026, 10, 3, 11, 59))).toBe('2026-11-02');
		expect(getDiaryDateKey(new Date(2026, 10, 3, 12, 0))).toBe('2026-11-03');
		expect(getDiaryDateKey(new Date(2026, 10, 4, 1, 0))).toBe('2026-11-03');
	});

	it('範囲は正午から翌日の正午まで', () => {
		const { from, to } = diaryDayRange(new Date(2026, 10, 4, 1, 0));
		expect(from).toEqual(new Date(2026, 10, 3, 12, 0));
		expect(to).toEqual(new Date(2026, 10, 4, 12, 0));
	});
});
