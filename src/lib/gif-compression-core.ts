export type GifCompressionStage = {
	scale: number;
	maxColors: number;
};

// フレームを間引かず、色数と寸法だけを品質の高い順に段階調整する。
export const GIF_COMPRESSION_STAGES: readonly GifCompressionStage[] = [
	{ scale: 1, maxColors: 255 },
	{ scale: 1, maxColors: 192 },
	{ scale: 1, maxColors: 128 },
	{ scale: 0.85, maxColors: 96 },
	{ scale: 0.7, maxColors: 64 },
	{ scale: 0.55, maxColors: 48 },
	{ scale: 0.4, maxColors: 32 },
	{ scale: 0.25, maxColors: 16 },
];

// これを超えるGIFはデコードだけで数百MBを消費し得るため、端末保護を優先して止める。
export const MAX_DECODED_GIF_PIXELS = 40_000_000;

export function scaledGifDimensions(width: number, height: number, scale: number) {
	return {
		width: Math.max(1, Math.round(width * scale)),
		height: Math.max(1, Math.round(height * scale)),
	};
}

export function hasTransparentPixel(data: Uint8ClampedArray) {
	for (let index = 3; index < data.length; index += 4) {
		if (data[index] < 255) return true;
	}
	return false;
}

/** Worker内で使うRGBAのバイリニア縮小。GIFの透過もalpha値として補間する。 */
export function resizeRgba(
	source: Uint8ClampedArray,
	sourceWidth: number,
	sourceHeight: number,
	targetWidth: number,
	targetHeight: number,
): Uint8ClampedArray<ArrayBuffer> {
	if (sourceWidth === targetWidth && sourceHeight === targetHeight) {
		return new Uint8ClampedArray(source);
	}
	const output = new Uint8ClampedArray(targetWidth * targetHeight * 4);
	const xRatio = sourceWidth / targetWidth;
	const yRatio = sourceHeight / targetHeight;

	for (let y = 0; y < targetHeight; y += 1) {
		const sourceY = Math.max(0, (y + 0.5) * yRatio - 0.5);
		const y0 = Math.min(sourceHeight - 1, Math.floor(sourceY));
		const y1 = Math.min(sourceHeight - 1, y0 + 1);
		const yWeight = sourceY - y0;
		for (let x = 0; x < targetWidth; x += 1) {
			const sourceX = Math.max(0, (x + 0.5) * xRatio - 0.5);
			const x0 = Math.min(sourceWidth - 1, Math.floor(sourceX));
			const x1 = Math.min(sourceWidth - 1, x0 + 1);
			const xWeight = sourceX - x0;
			const destination = (y * targetWidth + x) * 4;
			for (let channel = 0; channel < 4; channel += 1) {
				const top =
					source[(y0 * sourceWidth + x0) * 4 + channel] * (1 - xWeight) +
					source[(y0 * sourceWidth + x1) * 4 + channel] * xWeight;
				const bottom =
					source[(y1 * sourceWidth + x0) * 4 + channel] * (1 - xWeight) +
					source[(y1 * sourceWidth + x1) * 4 + channel] * xWeight;
				output[destination + channel] = Math.round(top * (1 - yWeight) + bottom * yWeight);
			}
		}
	}
	return output;
}
