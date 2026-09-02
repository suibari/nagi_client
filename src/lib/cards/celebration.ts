import type { CardRarity, DrawCardResult } from '$lib/api/types';

export const CARD_MILESTONE_STEP = 10;

export type ConfettiLevel = 'r' | 'sr' | 'ur' | 'aar' | 'milestone';

export type CardRevealEffect = {
	/** カード裏を見せて期待を溜める時間。 */
	chargeMs: number;
	/** タメ中に順番に通過する演出色。 */
	stages: CardRarity[];
	/** 1色ぶんを見せる時間。Nは昇格色を持たないので0。 */
	stageMs: number;
	/** Vibration API に渡す「振動、休止、振動…」のミリ秒列。 */
	vibration: number[];
	blackout: boolean;
};

/**
 * 抽選演出のレアリティ別契約。
 * 強さの調整箇所をダイアログのタイマー・CSS・振動処理へ分散させない。
 */
export const CARD_REVEAL_EFFECTS: Record<CardRarity, CardRevealEffect> = {
	N: { chargeMs: 900, stages: [], stageMs: 0, vibration: [35], blackout: false },
	R: {
		chargeMs: 2_000,
		stages: ['R'],
		stageMs: 2_000,
		vibration: [30, 320, 45, 300, 65, 260, 90],
		blackout: false,
	},
	SR: {
		chargeMs: 4_000,
		stages: ['R', 'SR'],
		stageMs: 2_000,
		vibration: [25, 380, 35, 360, 50, 320, 70, 280, 100, 240, 140],
		blackout: false,
	},
	UR: {
		chargeMs: 6_000,
		stages: ['R', 'SR', 'UR'],
		stageMs: 2_000,
		vibration: [25, 460, 35, 440, 50, 400, 70, 360, 95, 320, 130, 260, 180],
		blackout: false,
	},
	AAR: {
		// 4色×2秒の昇格後、CRT収束と完全暗転に2.5秒を使う。
		chargeMs: 10_500,
		stages: ['R', 'SR', 'UR', 'AAR'],
		stageMs: 2_000,
		vibration: [25, 500, 35, 500, 50, 480, 70, 460, 95, 440, 130, 400, 180, 340, 250],
		blackout: true,
	},
};

export function cardRevealEffect(rarity: CardRarity): CardRevealEffect {
	return CARD_REVEAL_EFFECTS[rarity];
}

/**
 * 1枚引く直前の所持数から、今回初めて越えた10%刻みの節目を返す。
 * 冪等な当日再取得や重複カードでは、お祝いを再発火させない。
 */
export function reachedCardMilestone(
	ownedBefore: number | undefined,
	total: number | undefined,
	draw: Pick<DrawCardResult, 'alreadyDrawn' | 'isNew'>,
): number | undefined {
	if (draw.alreadyDrawn || !draw.isNew || ownedBefore === undefined || !total || total < 1) {
		return undefined;
	}
	const boundedBefore = Math.max(0, Math.min(ownedBefore, total));
	const after = Math.min(boundedBefore + 1, total);
	const beforeStep = Math.floor((boundedBefore * 10) / total) * CARD_MILESTONE_STEP;
	const afterStep = Math.floor((after * 10) / total) * CARD_MILESTONE_STEP;
	return afterStep > beforeStep ? Math.min(afterStep, 100) : undefined;
}

export function cardCompletionPercent(owned: number, total: number): number {
	if (total < 1) return 0;
	return Math.round((Math.max(0, Math.min(owned, total)) / total) * 100);
}

export function nextCardMilestone(owned: number, total: number): number | undefined {
	const percent = cardCompletionPercent(owned, total);
	if (percent >= 100) return undefined;
	return Math.min(100, (Math.floor(percent / CARD_MILESTONE_STEP) + 1) * CARD_MILESTONE_STEP);
}

/** Nは追加演出なし。R以上はレア度ごとの粒量を Confetti 側で段階化する。 */
export function rarityConfettiLevel(rarity: CardRarity): ConfettiLevel | undefined {
	if (rarity === 'R') return 'r';
	if (rarity === 'SR') return 'sr';
	if (rarity === 'UR') return 'ur';
	if (rarity === 'AAR') return 'aar';
	return undefined;
}
