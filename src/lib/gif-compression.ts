const GIF_COMPRESSION_TIMEOUT_MS = 120_000;

type CompressionWorkerResponse = { ok: true; buffer: ArrayBuffer } | { ok: false; reason: string };

export async function compressGif(file: Blob, maxSize: number): Promise<Blob | null> {
	const worker = new Worker(new URL('./gif-compression.worker.ts', import.meta.url), {
		type: 'module',
	});

	return await new Promise<Blob | null>(async (resolve, reject) => {
		const finish = (result: Blob | null | Error) => {
			clearTimeout(timeout);
			worker.terminate();
			if (result instanceof Error) reject(result);
			else resolve(result);
		};
		const timeout = setTimeout(
			() => finish(new Error('GIF compression timed out')),
			GIF_COMPRESSION_TIMEOUT_MS,
		);

		worker.onerror = () => finish(new Error('GIF compression worker failed'));
		worker.onmessage = (event: MessageEvent<CompressionWorkerResponse>) => {
			const response = event.data;
			if (!response.ok) {
				finish(new Error(response.reason));
				return;
			}
			const blob = new Blob([response.buffer], { type: 'image/gif' });
			finish(blob.size <= maxSize ? blob : null);
		};

		try {
			const buffer = await file.arrayBuffer();
			worker.postMessage({ buffer, maxSize }, [buffer]);
		} catch (error) {
			finish(error instanceof Error ? error : new Error('Could not read GIF'));
		}
	});
}
