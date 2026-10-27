import type { CardRarity, DonatedCard } from '$lib/api/types';

/** 吸い込み演出の1枚ぶん。 */
export type FlightStep = {
	volume: number;
	id: number;
	rarity: CardRarity;
	/** この1枚が着いたときに足す Ƶ。 */
	zenny: number;
	/** 演出の開始からの遅れ。 */
	delayMs: number;
	durationMs: number;
};

const FIRST_INTERVAL_MS = 420;
const MIN_INTERVAL_MS = 70;
/** 1枚ごとに間隔を縮める割合。最初はゆっくり、だんだん加速する。 */
const ACCELERATION = 0.86;
/** 飛ぶ時間。レアほど少しだけ長く見せる。 */
const DURATION_MS: Record<CardRarity, number> = {
	N: 520,
	R: 600,
	SR: 720,
	UR: 820,
	AAR: 900,
};

/**
 * 置いたカードを1枚ずつに展開して、飛ばす順と時刻を決める。
 * 枚数が多いと何十秒も待たせることになるので、間隔を等比で縮めて最後は一気に流す。
 */
export function donateFlightPlan(donated: DonatedCard[]): FlightStep[] {
	const steps: FlightStep[] = [];
	let at = 0;
	let interval = FIRST_INTERVAL_MS;
	for (const card of donated) {
		const each = card.quantity > 0 ? card.zenny / card.quantity : 0;
		for (let i = 0; i < card.quantity; i += 1) {
			steps.push({
				volume: card.volume,
				id: card.id,
				rarity: card.rarity,
				zenny: each,
				delayMs: Math.round(at),
				durationMs: DURATION_MS[card.rarity],
			});
			at += interval;
			interval = Math.max(MIN_INTERVAL_MS, interval * ACCELERATION);
		}
	}
	return steps;
}

/** 1枚が Ƶ 欄に着いたときの振動。N は軽く、SR 以上ははっきり分かるように。 */
export function donateVibration(rarity: CardRarity): number[] {
	switch (rarity) {
		case 'N':
			return [12];
		case 'R':
			return [22];
		case 'SR':
			return [30, 40, 30];
		case 'UR':
			return [40, 50, 60];
		case 'AAR':
			return [60, 60, 90];
	}
}

/**
 * ヘルプに出すレート。AppView の ZENNY_PER_CARD / CARD_SHELF_AAR_PRICE（shared-configs）の写し。
 * 値はボードの price / zenny が正で、ここは説明にしか使わない。
 */
export const ZENNY_RATES: { rarity: CardRarity; zenny: number }[] = [
	{ rarity: 'N', zenny: 1 },
	{ rarity: 'R', zenny: 3 },
	{ rarity: 'SR', zenny: 10 },
	{ rarity: 'UR', zenny: 30 },
	{ rarity: 'AAR', zenny: 100 },
];
export const BOT_AAR_PRICE = 600;
export const KEEP_PER_CARD = 3;
export const WELCOME_ZENNY = 30;
