import { describe, expect, it } from 'vitest';
import { consultRange, getDiaryDateKey } from './date';

describe('3行日記の日付', () => {
	it('正午より前は前日の日記として数える', () => {
		expect(getDiaryDateKey(new Date(2026, 10, 3, 11, 59))).toBe('2026-11-02');
		expect(getDiaryDateKey(new Date(2026, 10, 3, 12, 0))).toBe('2026-11-03');
		expect(getDiaryDateKey(new Date(2026, 10, 4, 1, 0))).toBe('2026-11-03');
	});

	it('相談の材料は日記の日付の0時から今まで（夜に書いても朝の出来事が入る）', () => {
		const night = new Date(2026, 10, 3, 21, 0);
		expect(consultRange(night)).toEqual({ from: new Date(2026, 10, 3, 0, 0), to: night });
	});

	it('日付をまたいだ深夜に書くと、日記の日付（前日）の0時から今まで', () => {
		const lateNight = new Date(2026, 10, 4, 1, 0);
		expect(consultRange(lateNight)).toEqual({
			from: new Date(2026, 10, 3, 0, 0),
			to: lateNight,
		});
	});
});
