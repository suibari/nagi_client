import { describe, expect, it } from 'vitest';
import type { DiaryMoodView } from '$lib/api/types';
import {
	clampMoodZoom,
	formatValence,
	moodColor,
	moodClockFromPage,
	moodDayFrame,
	moodDayOffset,
	moodDayRange,
	moodDayTicks,
	moodTimeLabel,
	moodGradient,
	moodSegmentStops,
	moodTimelineStops,
	moodColorMix,
	MOOD_EDIT_VALUES,
	MOOD_ZOOM_LEVELS,
	quantile,
	replaceMood,
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

describe('moodTimelineStops', () => {
	// ローカル時刻で書く（日記の22時区切りは端末のタイムゾーン）。
	const at = (date: string, time: string) => new Date(`${date}T${time}`).toISOString();
	const mood = (time: string, valence: number) => ({
		createdAt: time,
		valence,
	});
	const DATE = '2026-11-05';
	const offsetOf = (hour: number) => (hour + 2) / 24; // 前日22時が 0

	it('spans 22:00 the previous day to 22:00', () => {
		expect(moodDayOffset(DATE, at('2026-11-04', '22:00:00'))).toBe(0);
		expect(moodDayOffset(DATE, at(DATE, '10:00:00'))).toBeCloseTo(0.5);
		expect(moodDayOffset(DATE, at(DATE, '22:00:00'))).toBe(1);
	});

	it('returns nothing without posts', () => {
		expect(moodTimelineStops(DATE, [])).toEqual([]);
	});

	it('extends the first and last mood to both ends', () => {
		const stops = moodTimelineStops(DATE, [mood(at(DATE, '12:00:00'), 3)]);
		expect(stops).toEqual([
			{ offset: 0, valence: 3 },
			{ offset: offsetOf(12), valence: 3 },
			{ offset: 1, valence: 3 },
		]);
	});

	it('drops steeply between close posts and then holds the mood', () => {
		const stops = moodTimelineStops(DATE, [
			mood(at(DATE, '00:00:00'), 5),
			mood(at(DATE, '01:00:00'), -5),
			mood(at(DATE, '18:00:00'), -5),
		]);
		// 0:00 → 1:00 は 20 分刻みで +5 → -5 に落ちる。
		const fall = stops.filter((s) => s.offset >= offsetOf(0) && s.offset <= offsetOf(1));
		expect(fall.map((s) => Math.round(s.valence * 100) / 100)).toEqual([5, 1.67, -1.67, -5]);
		// 1:00 → 18:00 は -5 のまま（中間点を置かない）。
		const hold = stops.filter((s) => s.offset > offsetOf(1) && s.offset < offsetOf(18));
		expect(hold).toEqual([]);
		expect(stops.at(-1)).toEqual({ offset: 1, valence: -5 });
		expect(stops[0]).toEqual({ offset: 0, valence: 5 });
	});

	it('changes gradually over a long gap', () => {
		const stops = moodTimelineStops(DATE, [
			mood(at(DATE, '00:00:00'), 5),
			mood(at(DATE, '18:00:00'), -5),
		]);
		const middle = stops.find((s) => Math.abs(s.offset - offsetOf(9)) < 1e-9);
		expect(middle?.valence).toBeCloseTo(0);
		// 18 時間を 20 分刻み → 中間点 53 個 + 両端の投稿 + 0 と 1。
		expect(stops).toHaveLength(53 + 2 + 2);
	});

	it('averages posts within the same minute', () => {
		const stops = moodTimelineStops(DATE, [
			mood(at(DATE, '12:00:10'), 4),
			mood(at(DATE, '12:00:50'), -2),
		]);
		expect(stops.map((s) => s.valence)).toEqual([1, 1, 1]);
	});
});

describe('moodDayRange with the AppView time zone', () => {
	it('cuts the day at 22:00 in the given zone, not the device zone', () => {
		// AppView の moodDiaryDate と同じ境界（2026-08-01T13:00Z は Tokyo の 8/1 22:00）。
		expect(moodDayRange('2026-08-01', { timeZone: 'Asia/Tokyo' })).toEqual({
			start: Date.parse('2026-07-31T13:00:00.000Z'),
			end: Date.parse('2026-08-01T13:00:00.000Z'),
		});
		expect(
			moodDayOffset('2026-08-01', '2026-08-01T01:00:00.000Z', { timeZone: 'Asia/Tokyo' }),
		).toBeCloseTo(0.5);
	});

	it('follows daylight saving changes', () => {
		// 2026-11-01 は New York の夏時間終了日。22時 EDT → 22時 EST の 25 時間。
		expect(moodDayRange('2026-11-01', { timeZone: 'America/New_York' })).toEqual({
			start: Date.parse('2026-11-01T02:00:00.000Z'),
			end: Date.parse('2026-11-02T03:00:00.000Z'),
		});
	});

	it('falls back to the device zone for an unknown zone', () => {
		expect(moodDayRange('2026-08-01', { timeZone: 'Not/AZone' })).toEqual(
			moodDayRange('2026-08-01'),
		);
	});

	it('cuts a morning start hour at the next day (AppView と同じ決め方)', () => {
		// 2時区切りの 8/1 は 8/1 02:00〜8/2 02:00（JST）。
		expect(moodDayRange('2026-08-01', { timeZone: 'Asia/Tokyo', startHour: 2 })).toEqual({
			start: Date.parse('2026-07-31T17:00:00.000Z'),
			end: Date.parse('2026-08-01T17:00:00.000Z'),
		});
	});

	it('prefers the per-day window from the AppView', () => {
		// 設定が変わった日は 28 時間（8/1 22:00 〜 8/3 02:00 JST）。
		const clock = moodClockFromPage({
			moodTimezone: 'Asia/Tokyo',
			moodDayStartHour: 2,
			moodDayWindows: [
				{
					date: '2026-08-02',
					start: '2026-08-01T13:00:00.000Z',
					end: '2026-08-02T17:00:00.000Z',
					timezone: 'Asia/Tokyo',
					startHour: 2,
				},
			],
		});
		expect(moodDayRange('2026-08-02', clock)).toEqual({
			start: Date.parse('2026-08-01T13:00:00.000Z'),
			end: Date.parse('2026-08-02T17:00:00.000Z'),
		});
		// 窓の無い日は moodTimezone と moodDayStartHour で計算する。
		expect(moodDayRange('2026-08-05', clock)).toEqual({
			start: Date.parse('2026-08-04T17:00:00.000Z'),
			end: Date.parse('2026-08-05T17:00:00.000Z'),
		});
		expect(moodDayFrame('2026-08-02', clock).timeZone).toBe('Asia/Tokyo');
	});

	it('falls back to 22:00 when an old AppView sends no start hour', () => {
		const clock = moodClockFromPage({ moodTimezone: 'Asia/Tokyo' });
		expect(moodDayRange('2026-08-01', clock)).toEqual({
			start: Date.parse('2026-07-31T13:00:00.000Z'),
			end: Date.parse('2026-08-01T13:00:00.000Z'),
		});
	});

	it('places hour ticks inside the day in its own zone', () => {
		// 22時区切りは 0・6・12・18時がそれぞれ 2/24, 8/24, 14/24, 20/24。
		const ticks = moodDayTicks('2026-08-01', { timeZone: 'Asia/Tokyo' });
		expect(ticks.map((tick) => tick.hour)).toEqual([0, 6, 12, 18]);
		expect(ticks[0].offset).toBeCloseTo(2 / 24);
		expect(ticks[3].offset).toBeCloseTo(20 / 24);
		// 2時区切りは 6・12・18・0時の順。
		const night = moodDayTicks('2026-08-01', { timeZone: 'Asia/Tokyo', startHour: 2 });
		expect(night.map((tick) => tick.hour)).toEqual([6, 12, 18, 0]);
		expect(night[0].offset).toBeCloseTo(4 / 24);
		// 0時区切りは両端の0時を出さない。
		const midnight = moodDayTicks('2026-08-01', { timeZone: 'Asia/Tokyo', startHour: 0 });
		expect(midnight.map((tick) => tick.hour)).toEqual([6, 12, 18]);
	});

	it('shows post times in the same zone', () => {
		expect(moodTimeLabel('2026-08-01T01:00:00.000Z', 'en-GB', 'Asia/Tokyo')).toBe('10:00');
		expect(moodTimeLabel('2026-08-01T01:00:00.000Z', 'en-GB', 'America/New_York')).toBe('21:00');
	});
});

describe('moodGradient', () => {
	it('is a solid color for one stop and a gradient otherwise', () => {
		expect(moodGradient([])).toBe('none');
		expect(moodGradient([{ offset: 0, valence: 5 }])).toBe(moodColor(5));
		expect(
			moodGradient(
				[
					{ offset: 0, valence: -5 },
					{ offset: 1, valence: 5 },
				],
				'to bottom',
			),
		).toBe(`linear-gradient(to bottom, ${moodColor(-5)} 0%, ${moodColor(5)} 100%)`);
	});

	it('interpolates a segment through the scale', () => {
		expect(moodSegmentStops(2, 2)).toEqual([{ offset: 0, valence: 2 }]);
		expect(moodSegmentStops(-4, 4, 2).map((s) => s.valence)).toEqual([-4, 0, 4]);
	});
});

describe('replaceMood', () => {
	const a = point('2026-09-20', '2026-09-20T01:00:00.000Z', 3);
	const b = point('2026-09-20', '2026-09-20T02:00:00.000Z', -2);

	it('swaps in the edited point and the day summary follows it', () => {
		const next = replaceMood([a, b], a.uri, { ...a, valence: -4, edited: true });
		expect(next.map((mood) => [mood.valence, mood.edited])).toEqual([
			[-4, true],
			[-2, undefined],
		]);
		expect(summarizeMoodDays(next).get('2026-09-20')?.median).toBe(-3);
	});

	it('drops the point when reverting leaves it off the graph', () => {
		expect(replaceMood([a, b], a.uri, undefined)).toEqual([b]);
	});

	it('never offers 0, which would mean neutral', () => {
		expect(MOOD_EDIT_VALUES).not.toContain(0);
		expect(MOOD_EDIT_VALUES).toHaveLength(10);
	});
});
