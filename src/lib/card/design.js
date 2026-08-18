/**
 * 共有用プロフィールカード（Canvas PNG / OGP）の固定デザイン値。
 * 両レンダラーは描画APIが異なるため、座標・寸法・色だけは必ずここを正とする。
 */
export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 630;
export const CARD_PADDING = 64;
export const AVATAR_SIZE = 224;
export const CONTENT_COLUMN_X = CARD_PADDING + AVATAR_SIZE + 40;
/** 写真に撮っても読み取れるよう、約49モジュールで1セル約4pxを確保する。 */
export const QR_SIZE = 200;
export const QR_X = CARD_WIDTH - CARD_PADDING - QR_SIZE;
/** 右下のブランドロゴとクワイエットゾーンが重ならない位置。 */
export const QR_Y = CARD_HEIGHT - CARD_PADDING - QR_SIZE - 88;
export const QR_QUIET_MODULES = 4;
export const QR_CONTAINER_RADIUS = 16;
export const QR_ICON_SIZE = QR_SIZE * 0.26;
export const QR_ICON_PADDING = 6;
export const QR_ICON_RADIUS = 10;
/** 透明余白を除いた suibari_logo.png の比率（737:158）。 */
export const BRAND_LOGO_WIDTH = 280;
export const BRAND_LOGO_HEIGHT = (BRAND_LOGO_WIDTH * 158) / 737;
export const TAGLINE_TOP = 316;
export const TAGLINE_FONT_SIZE = 30;
export const TAGLINE_LINE_HEIGHT = 42;
export const TAGLINE_MAX_LINES = 5;
export const TAGLINE_MAX_WIDTH = CARD_WIDTH - CARD_PADDING - QR_SIZE - CARD_PADDING - 32;
/** tokens.css のライトテーマ相当。共有画像は閲覧者のテーマに左右されない。 */
export const CARD_COLOR = {
    bg: '#ffffff',
    glow: '#dffbfc',
    text: '#2f3542',
    textStrong: '#202632',
    textMuted: '#747d8c',
    line: '#d5e5e7',
    accent: '#00ced1',
    accentStrong: '#007b7e',
    accentSoft: '#c9f7f7',
    decorative: '#ff9ff3',
};
