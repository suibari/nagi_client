export type DiaryGraphDay = { date: string; future: boolean };

export type DiaryGraph = {
	weeks: DiaryGraphDay[][];
	from: string;
	to: string;
};

const dateKey = (date: Date) =>
	`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const localDay = (date: Date, delta: number) =>
	new Date(date.getFullYear(), date.getMonth(), date.getDate() + delta, 12);

/** 現在週を右端に置き、その左へ52週を並べる。 */
export function buildDiaryGraph(today = new Date()): DiaryGraph {
	const normalizedToday = localDay(today, 0);
	const currentWeekStart = localDay(normalizedToday, -normalizedToday.getDay());
	const firstWeekStart = localDay(currentWeekStart, -52 * 7);
	const todayKey = dateKey(normalizedToday);
	const weeks = Array.from({ length: 53 }, (_, weekIndex) =>
		Array.from({ length: 7 }, (_, dayIndex) => {
			const day = localDay(firstWeekStart, weekIndex * 7 + dayIndex);
			const date = dateKey(day);
			return { date, future: date > todayKey };
		}),
	);
	return { weeks, from: weeks[0][0].date, to: todayKey };
}

/** 古い日記へのリンクでは、その日までの1年を表示する。 */
export function buildDiaryGraphForDate(date?: string, today = new Date()): DiaryGraph {
	const graph = buildDiaryGraph(today);
	if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || date >= graph.from) return graph;
	const target = new Date(`${date}T12:00:00`);
	if (Number.isNaN(target.getTime()) || dateKey(target) !== date) return graph;
	return buildDiaryGraph(target);
}

/** 月初を含む週へラベルを置く。左端が月途中なら、その月も左端に表示する。 */
export function diaryMonthLabels(weeks: DiaryGraphDay[][]): Array<{ week: number; date: string }> {
	const labels: Array<{ week: number; date: string }> = [];
	const seen = new Set<string>();
	for (let week = 0; week < weeks.length; week++) {
		const candidate =
			week === 0 ? weeks[week][0] : weeks[week].find((day) => day.date.endsWith('-01'));
		if (!candidate) continue;
		const month = candidate.date.slice(0, 7);
		if (seen.has(month)) continue;
		seen.add(month);
		labels.push({ week, date: candidate.date });
	}
	return labels;
}

export function diaryActivityIntensity(
	postCount: number | undefined,
	maximum: number,
): number | undefined {
	if (postCount === undefined || maximum <= 0) return undefined;
	return postCount / maximum;
}

const MONTH = /^\d{4}-\d{2}$/;

/** その日を含む月。"YYYY-MM"。 */
export const monthOf = (date: string) => date.slice(0, 7);

/** 今日の月。 */
export const currentMonth = (today = new Date()) => monthOf(dateKey(localDay(today, 0)));

export function isMonthKey(value: string | null | undefined): value is string {
	if (!value || !MONTH.test(value)) return false;
	const month = Number(value.slice(5));
	return month >= 1 && month <= 12;
}

/** 月を delta だけずらす。 */
export function shiftMonth(month: string, delta: number): string {
	const [year, mon] = month.split('-').map(Number);
	const date = new Date(year, mon - 1 + delta, 1, 12);
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/** 月の最終日 "YYYY-MM-DD"。 */
export function monthLastDate(month: string): string {
	const [year, mon] = month.split('-').map(Number);
	return dateKey(new Date(year, mon, 0, 12));
}

/**
 * 月間アクティビティで取得する1年の範囲。表示月がまるごと入るように選ぶ。
 * 今年の範囲に月初が入っていればそのまま、外れていれば月末を右端にした1年にする。
 */
export function buildDiaryGraphForMonth(month: string, today = new Date()): DiaryGraph {
	const graph = buildDiaryGraph(today);
	if (`${month}-01` >= graph.from) return graph;
	return buildDiaryGraph(new Date(`${monthLastDate(month)}T12:00:00`));
}

export type MonthGridDay = { date: string; inMonth: boolean; future: boolean };

/**
 * 月カレンダーのマス。日曜始まりで、前後の月のはみ出しを含めて7日ずつの週に切る
 * （コミットグラフと同じ曜日の並び）。
 */
export function buildMonthGrid(month: string, today = new Date()): MonthGridDay[][] {
	const [year, mon] = month.split('-').map(Number);
	const first = new Date(year, mon - 1, 1, 12);
	const last = new Date(year, mon, 0, 12);
	const start = localDay(first, -first.getDay());
	const end = localDay(last, 6 - last.getDay());
	const todayKey = dateKey(localDay(today, 0));
	const weeks: MonthGridDay[][] = [];
	for (let day = start; day <= end; day = localDay(day, 7)) {
		weeks.push(
			Array.from({ length: 7 }, (_, index) => {
				const date = dateKey(localDay(day, index));
				return { date, inMonth: monthOf(date) === month, future: date > todayKey };
			}),
		);
	}
	return weeks;
}
