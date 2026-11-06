import type { DiaryMoodView } from '$lib/api/types';

export type MoodDay = {
	date: string;
	/** 投稿時刻の昇順。 */
	points: DiaryMoodView[];
	q1: number;
	median: number;
	q3: number;
};

/** 線形補間の分位点。sorted は昇順で、空でないこと。 */
export function quantile(sorted: number[], q: number): number {
	const position = (sorted.length - 1) * q;
	const lower = Math.floor(position);
	const upper = Math.ceil(position);
	return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}

/**
 * 日ごとに「中央50%の帯」と中央値を出す。平均ではなく幅で見せるのは、同じ日に
 * 明るい投稿と落ち込んだ投稿が混ざるのが普通だから（平均すると 0 付近に潰れる）。
 */
export function summarizeMoodDays(moods: DiaryMoodView[]): Map<string, MoodDay> {
	const byDate = new Map<string, DiaryMoodView[]>();
	for (const mood of moods) {
		const list = byDate.get(mood.date);
		if (list) list.push(mood);
		else byDate.set(mood.date, [mood]);
	}
	const days = new Map<string, MoodDay>();
	for (const [date, points] of byDate) {
		points.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
		const values = points.map((point) => point.valence).sort((a, b) => a - b);
		days.set(date, {
			date,
			points,
			q1: quantile(values, 0.25),
			median: quantile(values, 0.5),
			q3: quantile(values, 0.75),
		});
	}
	return days;
}

/**
 * 点を1つ差し替える。next が無ければ取り除く（AIの値に戻したら中立だった、など）。
 * 投稿の日付は変わらないので、日ごとの並びは summarizeMoodDays に任せる。
 */
export function replaceMood(
	moods: DiaryMoodView[],
	uri: string,
	next: DiaryMoodView | undefined,
): DiaryMoodView[] {
	return next
		? moods.map((mood) => (mood.uri === uri ? next : mood))
		: moods.filter((mood) => mood.uri !== uri);
}

/** 本人が選べる値。0 は中立（グラフに載らない）なので選ばせない。 */
export const MOOD_EDIT_VALUES = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5] as const;

/** 1日あたりの横幅（px）。いちばん小さい段で1年がおおむね1画面に収まる。 */
export const MOOD_ZOOM_LEVELS = [3, 6, 10, 16, 24] as const;
export const MOOD_DEFAULT_ZOOM = 2;

export function clampMoodZoom(level: number): number {
	return Math.min(MOOD_ZOOM_LEVELS.length - 1, Math.max(0, Math.round(level)));
}

export const formatValence = (value: number) => (value > 0 ? `+${value}` : String(value));

/**
 * 中央値の色。感情グラフの帯と同じ5段の色（-5 → +5 を 0/.25/.5/.75/1 に置いた
 * --mood-scale-1..5）の間を線形に混ぜる。CSS では
 * `color-mix(in srgb, var(--mood-scale-{from}), var(--mood-scale-{to}) {percent}%)` にする。
 */
export function moodColorMix(median: number): { from: number; to: number; percent: number } {
	const t = Math.min(1, Math.max(0, (median + 5) / 10)) * 4;
	const from = Math.min(3, Math.floor(t));
	const percent = Math.round((t - from) * 100);
	return { from: from + 1, to: from + 2, percent };
}

export function moodColor(median: number): string {
	const { from, to, percent } = moodColorMix(median);
	return `color-mix(in srgb, var(--mood-scale-${from}), var(--mood-scale-${to}) ${percent}%)`;
}

/** 日記の1日は前日22時の直後〜当日22時（`DiaryMoodView.date` と同じ区切り）。 */
export const MOOD_DAY_START_HOUR = 22;
const MINUTE = 60_000;

/** その瞬間の、timeZone の UTC からのずれ（ミリ秒）。 */
function timeZoneOffsetMs(instant: number, timeZone: string): number {
	const parts = new Intl.DateTimeFormat('en-US', {
		timeZone,
		hourCycle: 'h23',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	}).formatToParts(new Date(instant));
	const get = (type: string) => Number(parts.find((part) => part.type === type)?.value);
	const wall = Date.UTC(
		get('year'),
		get('month') - 1,
		get('day'),
		get('hour'),
		get('minute'),
		get('second'),
	);
	return wall - Math.floor(instant / 1000) * 1000;
}

/** timeZone の壁時計で date の hour 時ちょうどの瞬間。夏時間の切り替わりも2回測って合わせる。 */
function zonedHour(date: string, hour: number, timeZone: string): number {
	const [year, month, day] = date.split('-').map(Number);
	const naive = Date.UTC(year, month - 1, day, hour);
	const first = naive - timeZoneOffsetMs(naive, timeZone);
	return naive - timeZoneOffsetMs(first, timeZone);
}

/** 不正なタイムゾーン名なら端末のタイムゾーンに戻す。 */
function validTimeZone(timeZone: string | undefined): string | undefined {
	if (!timeZone) return undefined;
	try {
		new Intl.DateTimeFormat('en-US', { timeZone });
		return timeZone;
	} catch {
		return undefined;
	}
}

/**
 * date（YYYY-MM-DD）の日記の1日をミリ秒で返す。
 * timeZone は AppView が日付を切ったタイムゾーン（`DiaryPage.moodTimezone`）。無ければ端末の時刻で切る。
 */
export function moodDayRange(date: string, timeZone?: string): { start: number; end: number } {
	const zone = validTimeZone(timeZone);
	if (zone) {
		const previous = new Date(`${date}T12:00:00.000Z`);
		previous.setUTCDate(previous.getUTCDate() - 1);
		return {
			start: zonedHour(previous.toISOString().slice(0, 10), MOOD_DAY_START_HOUR, zone),
			end: zonedHour(date, MOOD_DAY_START_HOUR, zone),
		};
	}
	const end = new Date(`${date}T${MOOD_DAY_START_HOUR}:00:00`);
	const start = new Date(end);
	start.setDate(start.getDate() - 1);
	return { start: start.getTime(), end: end.getTime() };
}

/** その日の中での位置（0 = 前日22時、1 = 当日22時）。範囲外は端に寄せる。 */
export function moodDayOffset(date: string, iso: string, timeZone?: string): number {
	const { start, end } = moodDayRange(date, timeZone);
	return Math.min(1, Math.max(0, (new Date(iso).getTime() - start) / (end - start)));
}

/** 投稿の時刻の表示。横バーと同じタイムゾーンで出し、バー上の位置と食い違わないようにする。 */
export function moodTimeLabel(iso: string, locale: string, timeZone?: string): string {
	return new Date(iso).toLocaleTimeString(locale, {
		hour: '2-digit',
		minute: '2-digit',
		timeZone: validTimeZone(timeZone),
	});
}

export type MoodStop = { offset: number; valence: number };

/**
 * 1日の気分の流れを、グラデーションの停止点にする。
 * - 隣り合う投稿の間は、valence を時間で線形に補間する（投稿のない時間も感情は続いていたとみなす）。
 * - 最初の投稿より前・最後の投稿より後は、その投稿の気分のまま端まで伸ばす。
 * - 同じ分の投稿は平均して1点にまとめる（瞬間的な縞にしない）。
 * - 補間するのは色ではなく valence。色どうしを直接混ぜると、+5 と -5 の間が濁って
 *   スケールの途中の色（黄・緑・青）を通らないので、stepMinutes ごとに中間点を置く。
 */
export function moodTimelineStops(
	date: string,
	points: Pick<DiaryMoodView, 'createdAt' | 'valence'>[],
	options: { timeZone?: string; stepMinutes?: number } = {},
): MoodStop[] {
	const { timeZone, stepMinutes = 20 } = options;
	const { start, end } = moodDayRange(date, timeZone);
	const byMinute = new Map<number, number[]>();
	for (const point of points) {
		const time = new Date(point.createdAt).getTime();
		if (Number.isNaN(time)) continue;
		const minute = Math.floor(Math.min(end, Math.max(start, time)) / MINUTE);
		const list = byMinute.get(minute);
		if (list) list.push(point.valence);
		else byMinute.set(minute, [point.valence]);
	}
	const anchors = [...byMinute]
		.sort(([a], [b]) => a - b)
		.map(([minute, values]) => ({
			offset: (minute * MINUTE - start) / (end - start),
			valence: values.reduce((sum, value) => sum + value, 0) / values.length,
		}));
	if (!anchors.length) return [];

	const step = (stepMinutes * MINUTE) / (end - start);
	const stops: MoodStop[] = [];
	const first = anchors[0];
	if (first.offset > 0) stops.push({ offset: 0, valence: first.valence });
	anchors.forEach((anchor, index) => {
		stops.push(anchor);
		const next = anchors[index + 1];
		if (!next || next.valence === anchor.valence) return;
		const span = next.offset - anchor.offset;
		const count = Math.ceil(span / step - 1e-9);
		for (let i = 1; i < count; i++) {
			const t = i / count;
			stops.push({
				offset: anchor.offset + span * t,
				valence: anchor.valence + (next.valence - anchor.valence) * t,
			});
		}
	});
	const last = anchors[anchors.length - 1];
	if (last.offset < 1) stops.push({ offset: 1, valence: last.valence });
	return stops;
}

/** 2つの気分の間を補間した停止点（縦タイムラインの1区間ぶん）。 */
export function moodSegmentStops(from: number, to: number, steps = 8): MoodStop[] {
	if (from === to) return [{ offset: 0, valence: from }];
	return Array.from({ length: steps + 1 }, (_, i) => ({
		offset: i / steps,
		valence: from + ((to - from) * i) / steps,
	}));
}

/** 停止点を CSS の linear-gradient にする。停止点が1つなら単色。 */
export function moodGradient(stops: MoodStop[], direction = 'to right'): string {
	if (!stops.length) return 'none';
	if (stops.length === 1) return moodColor(stops[0].valence);
	const list = stops.map(
		(stop) => `${moodColor(stop.valence)} ${Math.round(stop.offset * 10000) / 100}%`,
	);
	return `linear-gradient(${direction}, ${list.join(', ')})`;
}

/** 縦タイムラインの行の id。横バーの点から該当の行へ移るのに使う。 */
export const moodPostAnchorId = (uri: string) => `mood-post-${uri}`;
