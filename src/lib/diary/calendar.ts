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
