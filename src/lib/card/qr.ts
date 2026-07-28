import encodeQR from '@paulmillr/qr';

/**
 * QR のモジュール行列。true が黒。
 *
 * QR は共有画像（render.ts の Canvas）にしか出さない。画面上ではカードを押せば
 * プロフィールへ行けるので、DOM 側に QR を置いても飾り以上の意味がない。
 */
export type QrMatrix = boolean[][];

/**
 * 中央に Nagi アイコンを重ねるぶんだけ復元力が要るので、誤り訂正は最高レベルにする。
 * これでコード面積の約30%まで欠損を許容できる。
 */
const ECC = 'high' as const;

export function qrMatrix(text: string): QrMatrix {
	return encodeQR(text, 'raw', { ecc: ECC });
}
