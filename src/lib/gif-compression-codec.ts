import { decode, decodeFrames, encode } from 'modern-gif';
import {
	GIF_COMPRESSION_STAGES,
	MAX_DECODED_GIF_PIXELS,
	hasTransparentPixel,
	resizeRgba,
	scaledGifDimensions,
} from './gif-compression-core';

export async function compressGifBuffer(buffer: ArrayBuffer, maxSize: number) {
	const gif = decode(buffer);
	const decodedPixels = gif.width * gif.height * gif.frames.length;
	if (!Number.isSafeInteger(decodedPixels) || decodedPixels > MAX_DECODED_GIF_PIXELS) {
		throw new Error('GIF is too large to process safely');
	}
	const frames = decodeFrames(buffer, { gif });

	for (const stage of GIF_COMPRESSION_STAGES) {
		const dimensions = scaledGifDimensions(gif.width, gif.height, stage.scale);
		const output = await encode({
			width: dimensions.width,
			height: dimensions.height,
			version: '89a',
			looped: gif.looped,
			loopCount: gif.loopCount,
			maxColors: stage.maxColors,
			frames: frames.map((frame) => {
				const data = resizeRgba(
					frame.data,
					gif.width,
					gif.height,
					dimensions.width,
					dimensions.height,
				);
				return {
					data,
					delay: frame.delay,
					transparent: hasTransparentPixel(data),
				};
			}),
		});
		if (output.byteLength <= maxSize) return output;
	}
	return null;
}
