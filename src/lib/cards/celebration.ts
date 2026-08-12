import type { CardRarity, DrawCardResult } from '$lib/api/types';

export const CARD_MILESTONE_STEP = 10;

export type ConfettiLevel = 'sr' | 'ur' | 'aar' | 'milestone';

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

/** SR以上だけ。レア度ごとの粒量は Confetti 側でこの段階に対応させる。 */
export function rarityConfettiLevel(rarity: CardRarity): ConfettiLevel | undefined {
	if (rarity === 'SR') return 'sr';
	if (rarity === 'UR') return 'ur';
	if (rarity === 'AAR') return 'aar';
	return undefined;
}
