import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$lib/oauth/session.svelte', () => ({ session: {} }));
vi.mock('$lib/api/appview', () => ({ APPVIEW_URL: '', searchEmojis: vi.fn() }));
vi.mock('./pds', () => ({ listRecords: vi.fn(), resolvePdsUrl: vi.fn() }));
const heicTo = vi.hoisted(() => vi.fn());
vi.mock('heic-to/csp', () => ({ heicTo }));

import { emojiFileType, processEmojiImage, MAX_EMOJI_INPUT_SIZE } from './bluemoji';

const bitmap = () => ({ width: 640, height: 480, close: vi.fn() });
let decoded: ReturnType<typeof bitmap>;
let canvas: {
	width: number;
	height: number;
	getContext: ReturnType<typeof vi.fn>;
	toBlob: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
	vi.clearAllMocks();
	decoded = bitmap();
	vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue(decoded));
	canvas = {
		width: 0,
		height: 0,
		getContext: vi.fn(() => ({ drawImage: vi.fn() })),
		toBlob: vi.fn((callback, type) => callback(new Blob(['encoded'], { type }))),
	};
	vi.stubGlobal('document', { createElement: vi.fn(() => canvas) });
});
afterEach(() => vi.unstubAllGlobals());

describe('photo emoji input', () => {
	it.each([
		['photo.JPG', '', 'image/jpeg'],
		['photo.HEIF', 'application/octet-stream', 'image/heif'],
		['photo.heic', '', 'image/heic'],
	])('recognizes %s without a specific MIME type', (name, type, expected) => {
		expect(emojiFileType(new File(['photo'], name, { type }))).toBe(expected);
	});
	it('does not reinterpret an explicitly unsupported type from its extension', () => {
		expect(emojiFileType(new File(['text'], 'photo.jpg', { type: 'text/plain' }))).toBeUndefined();
	});
	it.each([32, 640])(
		'always converts JPEG to PNG, including small images (%i px)',
		async (size) => {
			decoded.width = size;
			decoded.height = size / 2;
			const output = await processEmojiImage(
				new File(['jpeg'], 'photo.jpg', { type: 'image/jpeg' }),
			);
			expect(output.type).toBe('image/png');
			expect(canvas.width).toBe(Math.min(size, 128));
			expect(canvas.height).toBe(Math.min(size, 128) / 2);
			expect(decoded.close).toHaveBeenCalledOnce();
			expect(heicTo).not.toHaveBeenCalled();
		},
	);
	it('uses native HEIC decoding when available', async () => {
		expect(
			(await processEmojiImage(new File(['heic'], 'photo.heic', { type: 'image/heic' }))).type,
		).toBe('image/png');
		expect(heicTo).not.toHaveBeenCalled();
	});
	it('falls back to the HEIC decoder and shares the result between preview and upload', async () => {
		vi.mocked(createImageBitmap).mockRejectedValue(new Error('unsupported'));
		vi.mocked(heicTo).mockResolvedValue(decoded as unknown as ImageBitmap);
		const file = new File(['heic'], 'photo.heif', { type: 'image/heif' });
		const [preview, upload] = await Promise.all([processEmojiImage(file), processEmojiImage(file)]);
		expect(preview).toBe(upload);
		expect(upload.type).toBe('image/png');
		expect(heicTo).toHaveBeenCalledExactlyOnceWith({ blob: file, type: 'bitmap' });
	});
	it('reports broken HEIC and permits retry after failure', async () => {
		vi.mocked(createImageBitmap).mockRejectedValue(new Error('unsupported'));
		vi.mocked(heicTo).mockRejectedValue(new Error('broken'));
		const file = new File(['broken'], 'photo.heic', { type: 'image/heic' });
		await expect(processEmojiImage(file)).rejects.toMatchObject({ code: 'compress' });
		vi.mocked(heicTo).mockResolvedValue(decoded as unknown as ImageBitmap);
		expect((await processEmojiImage(file)).type).toBe('image/png');
	});
	it('rejects oversized input before decoding', async () => {
		const file = new File([new Uint8Array(MAX_EMOJI_INPUT_SIZE + 1)], 'photo.heic', {
			type: 'image/heic',
		});
		await expect(processEmojiImage(file)).rejects.toMatchObject({ code: 'input-size' });
		expect(createImageBitmap).not.toHaveBeenCalled();
		expect(heicTo).not.toHaveBeenCalled();
	});
	it.each(['image/png', 'image/webp', 'image/gif'])(
		'preserves existing small %s uploads',
		async (type) => {
			decoded.width = decoded.height = 64;
			const file = new File(['original'], 'emoji', { type });
			expect(await processEmojiImage(file)).toBe(file);
		},
	);
	it('preserves APNG without decoding', async () => {
		const file = new File(['animation'], 'emoji.apng', { type: 'image/apng' });
		const output = await processEmojiImage(file);
		expect(output.type).toBe('image/apng');
		expect(await output.text()).toBe('animation');
		expect(createImageBitmap).not.toHaveBeenCalled();
	});
});
