/** 保存・共有用 PNG は日本の一般的な名刺（91 × 55 mm）と同じ比率にする。 */
import { CARD_PADDING, QR_SIZE } from './design';

export * from './design';

// 1 mm あたり14px。整数寸法のまま 91:55 の比率を保つ。
export const CARD_WIDTH = 91 * 14;
export const CARD_HEIGHT = 55 * 14;

export const QR_X = CARD_WIDTH - CARD_PADDING - QR_SIZE;
export const QR_Y = CARD_HEIGHT - CARD_PADDING - QR_SIZE - 88;
export const TAGLINE_MAX_WIDTH = CARD_WIDTH - CARD_PADDING - QR_SIZE - CARD_PADDING - 32;
