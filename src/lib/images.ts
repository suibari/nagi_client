export const MAX_IMAGE_COUNT = 4;
export const MAX_IMAGE_INPUT_SIZE = 25_000_000;
export const MAX_IMAGE_BLOB_SIZE = 2_000_000;

const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export type ImageAttachment = {
	id: string;
	blob: Blob;
	previewUrl: string;
	alt: string;
	aspectRatio: { width: number; height: number };
};

export class ImageProcessingError extends Error {
	constructor(
		message: string,
		readonly code: 'type' | 'input-size' | 'gif-size' | 'compress',
	) {
		super(message);
	}
}

async function dimensions(blob: Blob) {
	const bitmap = await createImageBitmap(blob);
	const result = { width: bitmap.width, height: bitmap.height };
	bitmap.close();
	return result;
}

const canvasBlob = (canvas: HTMLCanvasElement, quality: number) =>
	new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality));

export async function processImage(file: File): Promise<ImageAttachment> {
	if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
		throw new ImageProcessingError('Unsupported image type', 'type');
	}
	if (file.size > MAX_IMAGE_INPUT_SIZE) {
		throw new ImageProcessingError('Image input is too large', 'input-size');
	}
	if (file.type === 'image/gif') {
		if (file.size > MAX_IMAGE_BLOB_SIZE) {
			throw new ImageProcessingError('GIF is too large', 'gif-size');
		}
		return {
			id: crypto.randomUUID(),
			blob: file,
			previewUrl: URL.createObjectURL(file),
			alt: '',
			aspectRatio: await dimensions(file),
		};
	}

	const bitmap = await createImageBitmap(file);
	let scale = Math.min(1, 4096 / Math.max(bitmap.width, bitmap.height));
	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d');
	if (!context) {
		bitmap.close();
		throw new ImageProcessingError('Canvas is unavailable', 'compress');
	}

	let output: Blob | null = null;
	while (scale >= 0.1 && (!output || output.size > MAX_IMAGE_BLOB_SIZE)) {
		canvas.width = Math.max(1, Math.round(bitmap.width * scale));
		canvas.height = Math.max(1, Math.round(bitmap.height * scale));
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
		for (const quality of [0.9, 0.8, 0.7, 0.6, 0.5]) {
			output = await canvasBlob(canvas, quality);
			if (output && output.size <= MAX_IMAGE_BLOB_SIZE) break;
		}
		if (!output || output.size > MAX_IMAGE_BLOB_SIZE) scale *= 0.8;
	}
	bitmap.close();
	if (!output || output.size > MAX_IMAGE_BLOB_SIZE) {
		throw new ImageProcessingError('Could not compress image', 'compress');
	}
	return {
		id: crypto.randomUUID(),
		blob: output,
		previewUrl: URL.createObjectURL(output),
		alt: '',
		aspectRatio: { width: canvas.width, height: canvas.height },
	};
}

export function releaseImage(attachment: ImageAttachment) {
	URL.revokeObjectURL(attachment.previewUrl);
}
