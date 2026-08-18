import encodeQR from '@paulmillr/qr';
import { QR_QUIET_MODULES, QR_SIZE } from './design.js';
/**
 * 中央に Nagi アイコンを重ねるぶんだけ復元力が要るので、誤り訂正は最高レベルにする。
 * これでコード面積の約30%まで欠損を許容できる。
 */
const ECC = 'high';
export function qrMatrix(text) {
    return encodeQR(text, 'raw', { ecc: ECC });
}
/** Canvas版とOGP版が同じQR内容・セル寸法・クワイエットゾーンを使うための共通データ。 */
export function qrRenderData(text, size = QR_SIZE) {
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
