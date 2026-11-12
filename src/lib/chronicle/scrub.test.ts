import { describe, expect, it } from 'vitest';
import { scrubProgress, scrubScrollY, scrubTicks, scrubYearAt, visibleTickYears } from './scrub';

const range = { start: 100, end: 1100 };

describe('chronicle scrubber math', () => {
	it('スクロール量と進み具合を往復できる', () => {
		expect(scrubProgress(100, range)).toBe(0);
		expect(scrubProgress(600, range)).toBe(0.5);
		expect(scrubProgress(5000, range)).toBe(1);
		expect(scrubProgress(0, range)).toBe(0);
		expect(scrubScrollY(0.25, range)).toBe(350);
	});

	it('丸めで端に1px届かなくても端に着いたとみなす', () => {
		expect(scrubProgress(1318, { start: 0, end: 1318.36 })).toBe(1);
		expect(scrubProgress(100.6, range)).toBe(0);
	});

	it('範囲が潰れていたら先頭として扱う', () => {
		expect(scrubProgress(300, { start: 100, end: 100 })).toBe(0);
		expect(scrubScrollY(1, { start: 100, end: 50 })).toBe(100);
	});

	it('読んでいる年は直前の目盛りの年', () => {
		const ticks = scrubTicks(
			[
				{ year: '2024', top: 100 },
				{ year: '2025', top: 400 },
				{ year: '2026', top: 900 },
			],
			range,
		);
		expect(scrubYearAt(ticks, 0)).toBe('2024');
		expect(scrubYearAt(ticks, 0.299)).toBe('2024');
		expect(scrubYearAt(ticks, 0.3)).toBe('2025');
		expect(scrubYearAt(ticks, 1)).toBe('2026');
		expect(scrubYearAt([], 0.5)).toBeUndefined();
	});

	it('重なるラベルは間引くが、最初と最新の年は残す', () => {
		const ticks = [
			{ year: '2022', at: 0 },
			{ year: '2023', at: 0.02 },
			{ year: '2024', at: 0.5 },
			{ year: '2025', at: 0.98 },
			{ year: '2026', at: 1 },
		];
		expect([...visibleTickYears(ticks, 400, 24)]).toEqual(['2022', '2024', '2026']);
	});
});
