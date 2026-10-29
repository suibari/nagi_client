import { describe, expect, it } from 'vitest';
import {
	activityBackgroundPercent,
	buildDiaryGraph,
	buildDiaryGraphForDate,
	buildDiaryGraphForMonth,
	buildMonthGrid,
	diaryActivityIntensity,
	diaryMonthLabels,
	isMonthKey,
	monthLastDate,
	shiftMonth,
} from './calendar';

describe('buildDiaryGraph', () => {
	it('keeps the current week at the right edge across a year boundary', () => {
		const graph = buildDiaryGraph(new Date(2026, 0, 1, 8));
		expect(graph.weeks).toHaveLength(53);
		expect(graph.weeks.every((week) => week.length === 7)).toBe(true);
		expect(graph.weeks.at(-1)?.[0].date).toBe('2025-12-28');
		expect(graph.to).toBe('2026-01-01');
		expect(graph.weeks.at(-1)?.[4].future).toBe(false);
		expect(graph.weeks.at(-1)?.[5].future).toBe(true);
	});

	it('includes leap day and places month labels only once', () => {
		const graph = buildDiaryGraph(new Date(2024, 2, 2, 8));
		expect(graph.weeks.flat().some((day) => day.date === '2024-02-29')).toBe(true);
		const months = diaryMonthLabels(graph.weeks).map((label) => label.date.slice(0, 7));
		expect(new Set(months).size).toBe(months.length);
	});
});

it('keeps linear post-count intensity', () => {
	expect(diaryActivityIntensity(7, 18)).toBeCloseTo(7 / 18);
	expect(diaryActivityIntensity(18, 18)).toBe(1);
	expect(diaryActivityIntensity(undefined, 18)).toBeUndefined();
});

describe('buildDiaryGraphForDate', () => {
	const today = new Date(2026, 8, 25, 12);
	it('includes an old diary linked from the chronicle', () => {
		const graph = buildDiaryGraphForDate('2020-02-29', today);
		expect(graph.to).toBe('2020-02-29');
		expect(graph.weeks.flat()).toContainEqual({ date: '2020-02-29', future: false });
	});
	it('keeps the current range for recent, missing, invalid, or future dates', () => {
		for (const date of [undefined, '2026-09-01', 'invalid', '2020-02-30', '2030-01-01']) {
			expect(buildDiaryGraphForDate(date, today)).toEqual(buildDiaryGraph(today));
		}
	});
});

describe('month helpers', () => {
	it('shifts across year boundaries', () => {
		expect(shiftMonth('2026-12', 1)).toBe('2027-01');
		expect(shiftMonth('2026-01', -1)).toBe('2025-12');
	});
	it('finds the last day, including leap years', () => {
		expect(monthLastDate('2028-02')).toBe('2028-02-29');
		expect(monthLastDate('2026-02')).toBe('2026-02-28');
		expect(monthLastDate('2026-10')).toBe('2026-10-31');
	});
	it('validates month keys', () => {
		expect(isMonthKey('2026-10')).toBe(true);
		expect(isMonthKey('2026-13')).toBe(false);
		expect(isMonthKey('2026-10-01')).toBe(false);
		expect(isMonthKey(null)).toBe(false);
	});
});

describe('buildMonthGrid', () => {
	const today = new Date(2026, 9, 29, 12);
	it('starts on Sunday and pads with neighbouring months', () => {
		const weeks = buildMonthGrid('2026-10', today);
		expect(weeks[0][0]).toEqual({ date: '2026-09-27', inMonth: false, future: false });
		expect(weeks[0][4]).toEqual({ date: '2026-10-01', inMonth: true, future: false });
		expect(weeks.at(-1)?.at(-1)).toEqual({ date: '2026-10-31', inMonth: true, future: true });
		expect(buildMonthGrid('2026-11', today)[0][0].date).toBe('2026-11-01');
		expect(weeks.flat().find((day) => day.date === '2026-10-30')?.future).toBe(true);
		expect(weeks.every((week) => week.length === 7)).toBe(true);
	});
	it('covers leap day', () => {
		const days = buildMonthGrid('2028-02', today)
			.flat()
			.filter((day) => day.inMonth);
		expect(days).toHaveLength(29);
		expect(days.at(-1)?.date).toBe('2028-02-29');
	});
});

describe('buildDiaryGraphForMonth', () => {
	const today = new Date(2026, 9, 29, 12);
	it('keeps the current year for recent months', () => {
		expect(buildDiaryGraphForMonth('2026-10', today)).toEqual(buildDiaryGraph(today));
		expect(buildDiaryGraphForMonth('2025-11', today)).toEqual(buildDiaryGraph(today));
	});
	it('ends at the month end for older months so the whole month is fetched', () => {
		const graph = buildDiaryGraphForMonth('2025-10', today);
		expect(graph.to).toBe('2025-10-31');
		expect(graph.from <= '2025-10-01').toBe(true);
	});
});

describe('activityBackgroundPercent', () => {
	it.each([
		[0, 20],
		[1, 40],
		[4, 40],
		[5, 60],
		[9, 60],
		[10, 80],
		[19, 80],
		[20, 100],
		[200, 100],
		[undefined, 60],
		[-1, 60],
		[NaN, 60],
	])('keeps a fixed scale for %s posts', (count, percent) => {
		expect(activityBackgroundPercent(count)).toBe(percent);
	});
});
