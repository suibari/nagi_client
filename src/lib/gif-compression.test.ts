import { decode, decodeFrames, encode } from 'modern-gif';
import { describe, expect, it } from 'vitest';
import { compressGifBuffer } from './gif-compression-codec';
import {
	GIF_COMPRESSION_STAGES,
	hasTransparentPixel,
	resizeRgba,
	scaledGifDimensions,
} from './gif-compression-core';

describe('GIF compression stages', () => {
	it('orders stages from full-size color reduction to stronger resizing', () => {
		expect(GIF_COMPRESSION_STAGES).toHaveLength(8);
		expect(GIF_COMPRESSION_STAGES[0]).toEqual({ scale: 1, maxColors: 255 });
		expect(GIF_COMPRESSION_STAGES.at(-1)).toEqual({ scale: 0.25, maxColors: 16 });
		expect(
			GIF_COMPRESSION_STAGES.every(
				(stage, index) => index === 0 || stage.scale <= GIF_COMPRESSION_STAGES[index - 1].scale,
			),
		).toBe(true);
	});

	it('never reduces dimensions below one pixel', () => {
		expect(scaledGifDimensions(2, 1, 0.25)).toEqual({ width: 1, height: 1 });
	});

	it('resizes RGBA pixels and preserves alpha information', () => {
		const source = new Uint8ClampedArray([
			255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 255, 255, 0,
		]);
		const resized = resizeRgba(source, 2, 2, 1, 1);

		expect([...resized]).toEqual([128, 128, 128, 191]);
		expect(hasTransparentPixel(resized)).toBe(true);
		expect(hasTransparentPixel(new Uint8ClampedArray([0, 0, 0, 255]))).toBe(false);
	});

	it('keeps animation timing and looping through a real encode/decode cycle', async () => {
		const red = new Uint8ClampedArray(8 * 8 * 4);
		const blue = new Uint8ClampedArray(8 * 8 * 4);
		for (let index = 0; index < red.length; index += 4) {
			red[index] = 255;
			red[index + 3] = 255;
			blue[index + 2] = 255;
			blue[index + 3] = 255;
		}
		red[3] = 0;
		const source = await encode({
			width: 8,
			height: 8,
			version: '89a',
			looped: true,
			loopCount: 0,
			frames: [
				{ data: red, delay: 80 },
				{ data: blue, delay: 120 },
			],
		});
		const output = await compressGifBuffer(source, source.byteLength);

		expect(output).not.toBeNull();
		const gif = decode(output!);
		const frames = decodeFrames(output!, { gif });
		expect(gif.looped).toBe(true);
		expect(gif.loopCount).toBe(0);
		expect(frames).toHaveLength(2);
		expect(frames.map((frame) => frame.delay)).toEqual([80, 120]);
		expect(frames[0].data[3]).toBe(0);
	});
});
