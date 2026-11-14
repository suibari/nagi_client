export const CARD_PACK_LOGO_SRC = '/card-effects/pack-logo.webp';
export const CARD_PACK_HERO_SRC = '/bot_image_hero_trans.webp';

let preloaded = false;

/** 引く前に読んでおき、パックが絵の無い状態で出る時間を減らす。 */
export function preloadCardPack(): void {
	if (preloaded || typeof Image === 'undefined') return;
	preloaded = true;
	for (const src of [CARD_PACK_LOGO_SRC, CARD_PACK_HERO_SRC]) {
		const image = new Image();
		image.decoding = 'async';
		image.src = src;
	}
}

/** 横になぞった割合がこれ以上で指を離したら、残りの封は自動で破る（CARD-09）。 */
export const CARD_PACK_TEAR_THRESHOLD = 0.6;

/** なぞりの進み具合。右方向だけを数え、パック幅の85%で破り切る。 */
export function cardPackTearProgress(startX: number, currentX: number, width: number): number {
	if (width <= 0) return 0;
	return Math.max(0, Math.min(1, (currentX - startX) / (width * 0.85)));
}
