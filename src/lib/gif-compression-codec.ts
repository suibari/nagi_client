import { decode, decodeFrames, encode } from 'modern-gif';
import {
	GIF_COMPRESSION_STAGES,
	MAX_GIF_COMPRESSION_ATTEMPTS,
	MAX_DECODED_GIF_PIXELS,
	hasTransparentPixel,
	initialGifCompressionStageIndex,
	nextSmallerGifCompressionStageIndex,
	resizeRgba,
	scaledGifDimensions,
} from './gif-compression-core';

export type GifCompressionProgress = { attempt: number; total: number };

export async function compressGifBuffer(
	buffer: ArrayBuffer,
	maxSize: number,
	onProgress?: (progress: GifCompressionProgress) => void,
) {
	const gif = decode(buffer);
	const decodedPixels = gif.width * gif.height * gif.frames.length;
	if (!Number.isSafeInteger(decodedPixels) || decodedPixels > MAX_DECODED_GIF_PIXELS) {
		throw new Error('GIF is too large to process safely');
	}
	const frames = decodeFrames(buffer, { gif });
	let stageIndex = initialGifCompressionStageIndex(buffer.byteLength, maxSize);

	for (let attempt = 1; attempt <= MAX_GIF_COMPRESSION_ATTEMPTS; attempt += 1) {
		onProgress?.({ attempt, total: MAX_GIF_COMPRESSION_ATTEMPTS });
		const stage = GIF_COMPRESSION_STAGES[stageIndex];
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
		// 待ち時間を優先し、2MB以下になった時点で追加の高画質化試行は行わない。
		if (output.byteLength <= maxSize) return output;
		if (attempt === MAX_GIF_COMPRESSION_ATTEMPTS) return null;

		const nextIndex = nextSmallerGifCompressionStageIndex(stageIndex, output.byteLength, maxSize);
		if (nextIndex === null) return null;
		// 最終試行は最小設定へ飛び、従来の到達可能範囲を維持する。
		stageIndex =
			attempt === MAX_GIF_COMPRESSION_ATTEMPTS - 1 ? GIF_COMPRESSION_STAGES.length - 1 : nextIndex;
	}
	return null;
}
