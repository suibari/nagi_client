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

const { createBluemojiItem } = await import('./bluemoji');

type Write = { collection: string; value: Record<string, unknown> };
const itemOf = () => {
	const calls = applyWrites.mock.calls as unknown as [{ writes: Write[] }][];
	return calls[0][0].writes.find((write) => write.collection === 'blue.moji.collection.item')!.value;
};

describe('createBluemojiItem', () => {
	beforeEach(() => applyWrites.mockClear());

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
		const calls = applyWrites.mock.calls as unknown as [{ writes: { rkey: string }[] }][];
		expect(calls[0][0].writes.map((write) => write.rkey)).toEqual(['nagi_fixed', 'nagi_fixed']);
	});

	it('leaves uploaded emoji unlabeled', async () => {
		await createBluemojiItem('blobcat', new Blob(['png'], { type: 'image/png' }));
		expect(itemOf()).not.toHaveProperty('labels');
	});
});
