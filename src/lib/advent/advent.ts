import type { AdventCardView } from '$lib/api/types';

/**
 * アドベントカレンダー（12/1〜12/25）の表示まわりの純粋な計算。
 * 日付の区切りは AppView と同じ JST 0:00（カードの 4:00 境界ではない）。
 */

export const ADVENT_DAYS = 25;
const JST_OFFSET_MS = 9 * 60 * 60_000;

/** JST の暦。 */
function jst(now: number) {
	const date = new Date(now + JST_OFFSET_MS);
	return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

/** その年の 12/day JST 0:00。 */
export function adventPublishAt(year: number, day: number): number {
	return Date.UTC(year, 11, day) - JST_OFFSET_MS;
}

/** いまの暦の年（JST）。1月のうちは前年のカレンダーを指す。 */
export function adventYear(now = Date.now()): number {
	const { year, month } = jst(now);
	return month === 1 ? year - 1 : year;
}

/** メニューに出す期間。12/1 0:00 〜 1/7 いっぱい（JST）。それ以外はページだけ残す。 */
export function isAdventMenuSeason(now = Date.now()): boolean {
	const { month, day } = jst(now);
	return month === 12 || (month === 1 && day <= 7);
}

/** 公開済みの最新の日（0〜25）。 */
export function adventOpenedDay(year: number, now = Date.now()): number {
	let opened = 0;
	for (let day = 1; day <= ADVENT_DAYS; day += 1)
		if (adventPublishAt(year, day) <= now) opened = day;
	return opened;
}

export function isAdventDay(value: unknown): value is number {
	return Number.isInteger(value) && (value as number) >= 1 && (value as number) <= ADVENT_DAYS;
}

/** `?day=3` の読み取り。範囲外や数字以外は無視する。 */
export function parseAdventDayParam(value: string | null): number | undefined {
	if (!value || !/^\d{1,2}$/.test(value)) return undefined;
	const day = Number(value);
	return isAdventDay(day) ? day : undefined;
}

/** 通知の reasonUri（at://did/advent/2026-12-03）から日付を取り出す。 */
export function adventDayFromReasonUri(uri: string): number | undefined {
	const match = /\/advent\/\d{4}-12-(\d{2})$/.exec(uri);
	return match ? parseAdventDayParam(String(Number(match[1]))) : undefined;
}

/**
 * ツリーの段。下から 6・5・4・4・3・2 個で 24 日、てっぺんの星が 25 日。
 * 日付は飾りを電飾でつなぐ順（段ごとに左右を折り返す）に並べる。
 */
const ROWS = [6, 5, 4, 4, 3, 2] as const;
/** 段の高さ（%）。下から。 */
const ROW_Y = [83, 70.5, 58.5, 47, 36, 25.5] as const;
/** 木の頂点と裾（%）。SVG の形と合わせる。 */
export const TREE_TOP_Y = 9;
export const TREE_BASE_Y = 91;
const TREE_HALF_WIDTH = 46;
/** 星（25日）の位置。 */
const STAR = { x: 50, y: 10 } as const;

export type AdventSlot = { day: number; x: number; y: number };

/** その高さでの木の半幅（%）。 */
export function treeHalfWidth(y: number): number {
	return ((y - TREE_TOP_Y) / (TREE_BASE_Y - TREE_TOP_Y)) * TREE_HALF_WIDTH;
}

/** 25 日ぶんの飾りの位置。x, y は木の箱に対する % 。 */
export function adventSlots(): AdventSlot[] {
	const slots: AdventSlot[] = [];
	let day = 1;
	ROWS.forEach((count, row) => {
		const y = ROW_Y[row];
		// 端の飾りが枝からはみ出さないよう、半幅の 8 割に収める。
		const half = treeHalfWidth(y) * 0.8;
		const xs = Array.from({ length: count }, (_, i) => 50 - half + (2 * half * i) / (count - 1));
		if (row % 2 === 1) xs.reverse();
		for (const x of xs) slots.push({ day: day++, x: round(x), y });
	});
	slots.push({ day: ADVENT_DAYS, ...STAR });
	return slots;
}

const round = (value: number) => Math.round(value * 100) / 100;

/** 電飾のパス（SVG の viewBox 0 0 100 100、preserveAspectRatio="none" 前提）。 */
export function garlandPath(slots: AdventSlot[]): string {
	const points = slots.filter((slot) => slot.day < ADVENT_DAYS);
	return points
		.map((slot, index) => {
			if (index === 0) return `M ${slot.x} ${slot.y}`;
			const prev = points[index - 1];
			// 同じ段は少したわませ、段をまたぐところはそのまま上る。
			const sag = prev.y === slot.y ? 2.2 : 0;
			const cx = (prev.x + slot.x) / 2;
			const cy = (prev.y + slot.y) / 2 + sag;
			return `Q ${round(cx)} ${round(cy)} ${slot.x} ${slot.y}`;
		})
		.join(' ');
}

export type AdventLocale = 'ja' | 'en';

export const adventTitle = (card: AdventCardView, locale: AdventLocale) =>
	locale === 'ja' ? card.titleJa : card.titleEn;
export const adventComment = (card: AdventCardView, locale: AdventLocale) =>
	locale === 'ja' ? card.commentJa : card.commentEn;

/**
 * カードのリンク。OGP はこの URL から引いたカードの画像になる。
 * 英語で見ている人のシェアは、画像も英語にする（lang=en）。日本語は既定なので付けない。
 */
export function adventShareUrl(origin: string, day: number, locale: AdventLocale = 'ja'): string {
	return `${origin}/advent?day=${day}${locale === 'en' ? '&lang=en' : ''}`;
}

/** カードの持ち主（自分）のときだけ、まだ開封演出を見ていない日を古い順に。 */
export function unopenedOwnDays(
	cards: AdventCardView[],
	viewerDid: string | undefined,
	openedDays: readonly number[],
): number[] {
	if (!viewerDid) return [];
	return cards
		.filter((card) => card.actor.did === viewerDid && !openedDays.includes(card.day))
		.map((card) => card.day)
		.sort((a, b) => a - b);
}
