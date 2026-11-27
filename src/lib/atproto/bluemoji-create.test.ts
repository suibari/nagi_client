import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readable } from 'svelte/store';

const applyWrites = vi.fn(async () => ({ data: {} }));
const uploadBlob = vi.fn(async () => ({ data: { blob: { $type: 'blob', ref: 'cid' } } }));
vi.mock('@atproto/api', () => ({
	Agent: class {
		com = { atproto: { repo: { applyWrites, uploadBlob } } };
	},
}));
vi.mock('$lib/oauth/session.svelte', () => ({ session: readable({ did: 'did:plc:me' }) }));
vi.mock('$lib/api/appview', () => ({ APPVIEW_URL: '', searchEmojis: vi.fn() }));
vi.mock('./pds', () => ({ listRecords: vi.fn(), resolvePdsUrl: vi.fn() }));

const { createBluemojiItem, listMyBluemoji, invalidateMyBluemojiCache } =
	await import('./bluemoji');
const { listRecords, resolvePdsUrl } = await import('./pds');

type Write = { collection: string; value: Record<string, unknown> };
const itemOf = () => {
	const calls = applyWrites.mock.calls as unknown as [{ writes: Write[] }][];
	return calls[0][0].writes.find((write) => write.collection === 'blue.moji.collection.item')!
		.value;
};

describe('createBluemojiItem', () => {
	beforeEach(() => {
		applyWrites.mockClear();
		uploadBlob.mockClear();
	});

	it('labels emoji drawn by bot-tan as ai-generated', async () => {
		await createBluemojiItem(
			'sorena',
			new Blob(['png'], { type: 'image/png' }),
			'それな',
			'nagi_fixed',
			{ aiGenerated: true },
		);
		expect(itemOf().labels).toEqual({
			$type: 'com.atproto.label.defs#selfLabels',
			values: [{ val: 'ai-generated' }],
		});
		expect(itemOf().alt).toBe('それな');
		expect(itemOf().formats).toEqual({
			$type: 'blue.moji.collection.item#formats_v1',
			png_128: { $type: 'blob', ref: 'cid' },
		});
		const calls = applyWrites.mock.calls as unknown as [{ writes: { rkey: string }[] }][];
		expect(calls[0][0].writes.map((write) => write.rkey)).toEqual(['nagi_fixed', 'nagi_fixed']);
	});

	it('leaves uploaded emoji unlabeled', async () => {
		await createBluemojiItem('blobcat', new Blob(['png'], { type: 'image/png' }));
		expect(itemOf()).not.toHaveProperty('labels');
	});
});

it.each([
	['image/apng', 'apng_128'],
	['application/lottie+zip', 'lottie'],
])('uploads %s as a v1 blob even for small files', async (type, slot) => {
	applyWrites.mockClear();
	const blob = new Blob(['animation'], { type });
	await createBluemojiItem('test', blob);
	expect(uploadBlob).toHaveBeenCalledWith(blob, { encoding: type });
	expect(itemOf().formats).toEqual({
		$type: 'blue.moji.collection.item#formats_v1',
		[slot]: { $type: 'blob', ref: 'cid' },
	});
});

it('rejects an oversized PNG before uploading it', async () => {
	uploadBlob.mockClear();
	const blob = new Blob([new Uint8Array(128_001)], { type: 'image/png' });
	await expect(createBluemojiItem('test', blob)).rejects.toMatchObject({ code: 'compress' });
	expect(uploadBlob).not.toHaveBeenCalled();
});

it('lists legacy inline images and v1 blobs from the same PDS', async () => {
	invalidateMyBluemojiCache();
	vi.mocked(resolvePdsUrl).mockResolvedValue('https://pds.example');
	const item = (name: string, format: 'v0' | 'v1', assets: object) => ({
		uri: `at://did:plc:me/blue.moji.collection.item/${name}`,
		cid: `record-${name}`,
		value: {
			$type: 'blue.moji.collection.item',
			name: `:${name}:`,
			createdAt: '2026-11-27T00:00:00.000Z',
			formats: { $type: `blue.moji.collection.item#formats_${format}`, ...assets },
		},
	});
	const gif = { ref: { $link: 'bafygif' }, mimeType: 'image/gif', size: 262_144 };
	const apng = { ref: { $link: 'bafyapng' }, mimeType: 'image/apng', size: 128_000 };
	vi.mocked(listRecords).mockResolvedValue({
		records: [
			item('legacy', 'v0', { apng_128: { $bytes: 'YQ==' } }),
			item('oldgif', 'v0', { gif_128: gif }),
			item('current', 'v1', { apng_128: apng }),
			item('oversize', 'v1', { apng_128: { ...apng, size: 128_001 } }),
		],
	});
	expect(await listMyBluemoji()).toMatchObject([
		{ name: ':legacy:', url: 'data:image/apng;base64,YQ==' },
		{
			name: ':oldgif:',
			url: 'https://pds.example/xrpc/com.atproto.sync.getBlob?did=did%3Aplc%3Ame&cid=bafygif',
		},
		{
			name: ':current:',
			url: 'https://pds.example/xrpc/com.atproto.sync.getBlob?did=did%3Aplc%3Ame&cid=bafyapng',
		},
	]);
});
