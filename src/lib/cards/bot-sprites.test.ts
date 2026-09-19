import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * botたんの立ち絵は、表情を差し替えても**寸法が変わってはいけない**。
 *
 * 以前は sitting が 228x320、petted が 384x384 で、同じ CSS 幅を当てると
 * 切り替えた瞬間にキャラが縮み、接地位置も跳ねていた。2枚は同じキャンバスに
 * 同じ足元位置で描いてある前提なので、その前提が崩れたらここで落とす。
 */
const SPRITES = ['static/bot_assist_sitting.png', 'static/bot_assist_petted.png'];

/** PNG の IHDR から幅と高さを読む（デコード不要）。 */
function pngSize(path: string) {
	const bytes = readFileSync(path);
	expect(bytes.subarray(1, 4).toString('latin1'), `${path} が PNG ではない`).toBe('PNG');
	return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

describe('botたんの立ち絵', () => {
	it('表情ちがいで寸法が揃っている', () => {
		const [sitting, petted] = SPRITES.map(pngSize);
		expect(petted).toEqual(sitting);
	});

	it('縦長のまま（正方形に伸ばされていない）', () => {
		const { width, height } = pngSize(SPRITES[0]);
		expect(height).toBeGreaterThan(width);
	});
});
