import { ImageProcessingError, processImage } from './images';
import type { GifCompressionProgress } from './gif-compression';
import { m } from './i18n/i18n.svelte';

export function imageSelectionError(file: File, error: unknown): string {
	const name = file.name || m.postPastedImageName();
	if (!(error instanceof ImageProcessingError)) return m.imageProcessFailedNamed({ name });
	if (error.code === 'type') return m.postImageTypeError({ name });
	if (error.code === 'input-size') return m.postImageInputSizeError({ name });
	if (error.code === 'gif-size') return m.postGifSizeError({ name });
	return m.postImageCompressError({ name });
}

export async function processSelectedImage(
	file: File,
	onProgress?: (progress: GifCompressionProgress) => void,
) {
	try {
		return { image: await processImage(file, onProgress) };
	} catch (error) {
		return { error: imageSelectionError(file, error) };
	}
}
