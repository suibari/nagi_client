import { describe, expect, it } from 'vitest';
import {
	scrubProgress,
	scrubScrollY,
	scrubTicks,
	scrubYearAt,
	visibleTickYears,
	scrubMonthTicks,
	scrubMonthAt,
	adjacentScrubMonth,
	scrubMonthNumber,
	visibleTickMonths,
} from './scrub';

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

describe('month navigation', () => {
	const years = [
		{ year: '2025', at: 0 },
		{ year: '2026', at: 0.5 },
	];
	const months = scrubMonthTicks(
		[
			{ month: '2025-12', top: 200 },
			{ month: '2026-02', top: 700 },
			{ month: '2026-03', top: 1200 },
			{ month: '2026-04', top: 1300 },
		],
		range,
	);
	it('本文位置で年月を選び、年見出しではその年の最初の月を返す', () => {
		expect(scrubMonthAt(months, years, 0)).toBe('2025-12');
		expect(scrubMonthAt(months, years, 0.5)).toBe('2026-02');
		expect(scrubMonthAt(months, years, 1)).toBe('2026-04');
		expect(scrubMonthAt([], [], 0)).toBeUndefined();
	});
	it('空月を飛ばし、末尾で位置が重なる月も順番に移動できる', () => {
		expect(adjacentScrubMonth(months, '2025-12', 1)?.month).toBe('2026-02');
		expect(adjacentScrubMonth(months, '2026-02', -1)?.month).toBe('2025-12');
		expect(adjacentScrubMonth(months, '2026-03', 1)?.month).toBe('2026-04');
		expect(adjacentScrubMonth(months, '2026-04', -1)?.month).toBe('2026-03');
		expect(adjacentScrubMonth(months, '2026-04', 1)?.month).toBe('2026-04');
	});
	it('1か月でも値と移動先が有効', () => {
		const single = [months[0]];
		expect(scrubMonthAt(single, [], 1)).toBe('2025-12');
		expect(adjacentScrubMonth(single, '2025-12', -1)).toBe(single[0]);
		expect(scrubMonthNumber('2026-01') - scrubMonthNumber('2025-12')).toBe(1);
	});
	it('年のラベルを避け、月ラベル同士も重ねない', () => {
		const ticks = [
			{ month: '2025-01', at: 0.01 },
			{ month: '2025-02', at: 0.2 },
			{ month: '2025-03', at: 0.21 },
			{ month: '2026-01', at: 0.51 },
		];
		expect([...visibleTickMonths(ticks, years, 400, 20)]).toEqual(['2025-02']);
	});
});
