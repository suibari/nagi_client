import { describe, expect, it } from 'vitest';
import {
	buildDiaryGraph,
	buildDiaryGraphForDate,
	diaryActivityIntensity,
	diaryMonthLabels,
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
