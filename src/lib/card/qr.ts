import encodeQR from '@paulmillr/qr';
import { QR_QUIET_MODULES, QR_SIZE } from './design.js';

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

export type QrRenderData = {
	matrix: QrMatrix;
	modules: number;
	cell: number;
	quiet: number;
	/** SVGのviewBoxで使える、黒モジュールをまとめたパス。 */
	path: string;
};

/** Canvas版とOGP版が同じQR内容・セル寸法・クワイエットゾーンを使うための共通データ。 */
export function qrRenderData(text: string, size = QR_SIZE): QrRenderData {
	const matrix = qrMatrix(text);
	const modules = matrix.length;
	const cell = size / modules;
	const path = matrix
		.flatMap((row, y) => row.flatMap((enabled, x) => (enabled ? [`M${x} ${y}h1v1h-1z`] : [])))
		.join('');
	return {
		matrix,
		modules,
		cell,
		quiet: cell * QR_QUIET_MODULES,
		path,
	};
}
