export type GifCompressionStage = {
	scale: number;
	maxColors: number;
};

// フレームを間引かず、色数と寸法だけを品質の高い順に段階調整する。
export const GIF_COMPRESSION_STAGES: readonly GifCompressionStage[] = [
	{ scale: 1, maxColors: 255 },
	{ scale: 0.85, maxColors: 192 },
	{ scale: 0.7, maxColors: 128 },
	{ scale: 0.55, maxColors: 96 },
	{ scale: 0.4, maxColors: 64 },
	{ scale: 0.25, maxColors: 16 },
];

export const MAX_GIF_COMPRESSION_ATTEMPTS = 4;

/** 入力と上限の比から、最初から成功しやすい縮小率を選ぶ。 */
export function initialGifCompressionStageIndex(inputSize: number, maxSize: number) {
	const targetScale = Math.min(1, Math.sqrt(maxSize / inputSize) * 0.9);
	const index = GIF_COMPRESSION_STAGES.findIndex((stage) => stage.scale <= targetScale);
	return index === -1 ? GIF_COMPRESSION_STAGES.length - 1 : index;
}

/** 直前の出力サイズを使い、効果が足りない設定を飛ばして次の縮小率を選ぶ。 */
export function nextSmallerGifCompressionStageIndex(
	currentIndex: number,
	outputSize: number,
	maxSize: number,
) {
	if (currentIndex >= GIF_COMPRESSION_STAGES.length - 1) return null;
	const currentScale = GIF_COMPRESSION_STAGES[currentIndex].scale;
	const targetScale = currentScale * Math.sqrt(maxSize / outputSize) * 0.9;
	const nextIndex = GIF_COMPRESSION_STAGES.findIndex(
		(stage, index) => index > currentIndex && stage.scale <= targetScale,
	);
	return nextIndex === -1 ? currentIndex + 1 : nextIndex;
}

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
			for (let channel = 0; channel < 3; channel += 1) {
				const top =
					source[(y0 * sourceWidth + x0) * 4 + channel] * (1 - xWeight) +
					source[(y0 * sourceWidth + x1) * 4 + channel] * xWeight;
				const bottom =
					source[(y1 * sourceWidth + x0) * 4 + channel] * (1 - xWeight) +
					source[(y1 * sourceWidth + x1) * 4 + channel] * xWeight;
				output[destination + channel] = Math.round(top * (1 - yWeight) + bottom * yWeight);
			}
			// GIFの透過は二値なので、alphaは補間せず最近傍の0/255を維持する。
			const alphaSource =
				(Math.min(sourceHeight - 1, Math.round(sourceY)) * sourceWidth +
					Math.min(sourceWidth - 1, Math.round(sourceX))) *
				4;
			output[destination + 3] = source[alphaSource + 3] < 128 ? 0 : 255;
		}
	}
	return output;
}
