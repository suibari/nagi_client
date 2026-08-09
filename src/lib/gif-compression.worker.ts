import { compressGifBuffer } from './gif-compression-codec';

type CompressionRequest = { buffer: ArrayBuffer; maxSize: number };

self.onmessage = async (event: MessageEvent<CompressionRequest>) => {
	try {
		const output = await compressGifBuffer(event.data.buffer, event.data.maxSize);
		if (!output) {
			self.postMessage({ ok: false, reason: 'Could not compress GIF below the limit' });
			return;
		}
		self.postMessage({ ok: true, buffer: output }, { transfer: [output] });
	} catch (error) {
		self.postMessage({
			ok: false,
			reason: error instanceof Error ? error.message : 'GIF compression failed',
		});
	}
};
