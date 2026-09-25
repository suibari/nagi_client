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

/** 1日あたりの横幅（px）。いちばん小さい段で1年がおおむね1画面に収まる。 */
export const MOOD_ZOOM_LEVELS = [3, 6, 10, 16, 24] as const;
export const MOOD_DEFAULT_ZOOM = 2;

export function clampMoodZoom(level: number): number {
	return Math.min(MOOD_ZOOM_LEVELS.length - 1, Math.max(0, Math.round(level)));
}

export const formatValence = (value: number) => (value > 0 ? `+${value}` : String(value));
