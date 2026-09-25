import { describe, expect, it } from 'vitest';
import type { DiaryMoodView } from '$lib/api/types';
import {
	clampMoodZoom,
	formatValence,
	MOOD_ZOOM_LEVELS,
	quantile,
	summarizeMoodDays,
} from './mood';

const point = (date: string, createdAt: string, valence: number): DiaryMoodView => ({
	uri: `at://did:plc:alice/com.suibari.nagi.post/${createdAt}`,
	date,
	createdAt,
	valence,
	text: `post ${valence}`,
});

describe('summarizeMoodDays', () => {
	it('keeps the spread of a mixed day instead of flattening it to an average', () => {
		const days = summarizeMoodDays([
			point('2026-09-20', '2026-09-20T10:00:00.000Z', 3),
			point('2026-09-20', '2026-09-20T01:00:00.000Z', -3),
			point('2026-09-20', '2026-09-20T05:00:00.000Z', 2),
			point('2026-09-20', '2026-09-20T07:00:00.000Z', -2),
			point('2026-09-21', '2026-09-21T07:00:00.000Z', 4),
		]);
		const mixed = days.get('2026-09-20')!;
		expect(mixed.median).toBe(0);
		expect(mixed.q1).toBe(-2.25);
		expect(mixed.q3).toBe(2.25);
		// 点は時刻順に並べ直す。
		expect(mixed.points.map((p) => p.valence)).toEqual([-3, 2, -2, 3]);

		const single = days.get('2026-09-21')!;
		expect([single.q1, single.median, single.q3]).toEqual([4, 4, 4]);
		expect(days.has('2026-09-22')).toBe(false);
	});
});

describe('quantile', () => {
	it('interpolates between neighbours', () => {
		expect(quantile([1, 2, 3, 4], 0.5)).toBe(2.5);
		expect(quantile([-5], 0.75)).toBe(-5);
	});
});

describe('zoom', () => {
	it('clamps to the defined levels', () => {
		expect(clampMoodZoom(-1)).toBe(0);
		expect(clampMoodZoom(99)).toBe(MOOD_ZOOM_LEVELS.length - 1);
	});
});

it('formats valence with an explicit plus sign', () => {
	expect(formatValence(3)).toBe('+3');
	expect(formatValence(-2)).toBe('-2');
});
