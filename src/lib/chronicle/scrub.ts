/** 年表スクラバー（CHRON-04）の位置計算。DOMから測った値だけを受け取る純関数にする。 */

export type ScrubRange = { start: number; end: number };
export type ScrubTick = { year: string; at: number };
export type ScrubMonth = { month: string; at: number };

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * スクロール量を 0〜1 の進み具合へ。範囲が潰れているときは先頭扱い。
 * scrollY は整数に丸められ、範囲は小数で測るので、端から1px以内は端に着いたとみなす。
 * そうしないと末尾にいても最新の年（目盛りが1に貼り付く）へ届かない。
 */
export function scrubProgress(scrollY: number, range: ScrubRange): number {
	if (range.end <= range.start || scrollY <= range.start + 1) return 0;
	if (scrollY >= range.end - 1) return 1;
	return clamp01((scrollY - range.start) / (range.end - range.start));
}

/** 進み具合をスクロール量へ戻す。 */
export const scrubScrollY = (progress: number, range: ScrubRange): number =>
	range.start + clamp01(progress) * Math.max(0, range.end - range.start);

/** 年見出しのページ上の位置から目盛りを作る。 */
export const scrubTicks = (
	headings: { year: string; top: number }[],
	range: ScrubRange,
): ScrubTick[] => headings.map(({ year, top }) => ({ year, at: scrubProgress(top, range) }));

/** その進み具合で読んでいる年。最初の目盛りより手前なら最初の年。 */
export function scrubYearAt(ticks: ScrubTick[], progress: number): string | undefined {
	let year = ticks[0]?.year;
	for (const tick of ticks) if (tick.at <= progress + 1e-6) year = tick.year;
	return year;
}

/**
 * 目盛りのラベルが重ならないよう、表示する年を選ぶ。最初と最新の年は必ず残し、
 * 間の年は直前に残したラベルから minGap（レール上のpx）以上離れたものだけ残す。
 */
export function visibleTickYears(ticks: ScrubTick[], trackPx: number, minGap: number): Set<string> {
	const keep = new Set<string>();
	if (!ticks.length) return keep;
	const last = ticks[ticks.length - 1];
	let prev = -Infinity;
	for (const tick of ticks) {
		const px = tick.at * trackPx;
		const isEdge = tick === ticks[0] || tick === last;
		if (isEdge || (px - prev >= minGap && last.at * trackPx - px >= minGap)) {
			keep.add(tick.year);
			prev = px;
		}
	}
	return keep;
}

export const scrubMonthTicks = (
	anchors: { month: string; top: number }[],
	range: ScrubRange,
): ScrubMonth[] => anchors.map(({ month, top }) => ({ month, at: scrubProgress(top, range) }));

export function scrubMonthAt(
	months: ScrubMonth[],
	years: ScrubTick[],
	progress: number,
): string | undefined {
	if (progress >= 1) return months.at(-1)?.month;
	const year = scrubYearAt(years, progress);
	const candidates = months.filter((tick) => !year || tick.month.startsWith(year));
	let month = candidates[0]?.month ?? months[0]?.month;
	for (const tick of candidates) if (tick.at <= progress + 1e-6) month = tick.month;
	return month;
}

export function adjacentScrubMonth(
	months: ScrubMonth[],
	current: string,
	direction: -1 | 1,
): ScrubMonth | undefined {
	const index = months.findIndex((tick) => tick.month === current);
	return months[Math.max(0, Math.min(months.length - 1, index + direction))];
}

export const scrubMonthNumber = (month: string): number => {
	const [year, value] = month.split('-').map(Number);
	return year * 12 + value - 1;
};

export function visibleTickMonths(
	months: ScrubMonth[],
	years: ScrubTick[],
	trackPx: number,
	minGap: number,
): Set<string> {
	const labeledYears = visibleTickYears(years, trackPx, minGap);
	const occupied = years
		.filter((tick) => labeledYears.has(tick.year))
		.map((tick) => tick.at * trackPx);
	const keep = new Set<string>();
	for (const tick of months) {
		const px = tick.at * trackPx;
		if (occupied.every((other) => Math.abs(other - px) >= minGap)) {
			keep.add(tick.month);
			occupied.push(px);
		}
	}
	return keep;
}
