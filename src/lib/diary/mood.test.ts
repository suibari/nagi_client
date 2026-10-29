import { describe, expect, it } from 'vitest';
import type { DiaryMoodView } from '$lib/api/types';
import {
	clampMoodZoom,
	formatValence,
	moodColor,
	moodColorMix,
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

describe('moodColorMix', () => {
	it('puts the scale stops at -5, -2.5, 0, +2.5, +5', () => {
		expect(moodColorMix(-5)).toEqual({ from: 1, to: 2, percent: 0 });
		expect(moodColorMix(0)).toEqual({ from: 3, to: 4, percent: 0 });
		expect(moodColorMix(5)).toEqual({ from: 4, to: 5, percent: 100 });
	});
	it('interpolates between neighbouring stops', () => {
		expect(moodColorMix(1.25)).toEqual({ from: 3, to: 4, percent: 50 });
		expect(moodColorMix(-3.75)).toEqual({ from: 1, to: 2, percent: 50 });
	});
	it('clamps out-of-range values', () => {
		expect(moodColorMix(-9)).toEqual(moodColorMix(-5));
		expect(moodColorMix(9)).toEqual(moodColorMix(5));
	});
	it('builds a color-mix expression', () => {
		expect(moodColor(0)).toBe('color-mix(in srgb, var(--mood-scale-3), var(--mood-scale-4) 0%)');
	});
});
