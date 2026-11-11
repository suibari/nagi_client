import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PostAssets, PostDraft } from '$lib/atproto/records';

const mocks = vi.hoisted(() => ({
	enabled: true,
	hasScope: vi.fn(async () => true),
	crosspost: vi.fn(),
	attach: vi.fn(),
}));

vi.mock('$lib/i18n/i18n.svelte', () => ({
	m: {
		crosspostPermissionMissing: () => 'permission',
		crosspostPartial: () => 'partial',
		crosspostFailed: () => 'failed',
		crosspostLinkFailed: () => 'link',
	},
}));
vi.mock('./preferences', () => ({
	getCrosspostEnabled: () => mocks.enabled,
	hasCrosspostScope: mocks.hasScope,
}));
vi.mock('$lib/atproto/records', () => ({ attachCrosspost: mocks.attach }));
vi.mock('./bluesky', () => {
	class CrosspostPartialError extends Error {
		constructor(
			readonly posts: unknown[],
			_cause?: unknown,
		) {
			super('partial');
		}
	}
	return { CrosspostPartialError, crosspostToBluesky: mocks.crosspost };
});

const { crosspostAfterPost } = await import('./after-post');
const { CrosspostPartialError } = await import('./bluesky');

const draft = { text: 'hi' } as PostDraft;
const assets = { images: [], cards: [] } as PostAssets;
const uri = 'at://did:plc:me/com.suibari.nagi.post/3mpost';
const ref = {
	root: { uri: 'r', cid: 'r' },
	tail: { uri: 't', cid: 't' },
	threadRoot: { uri: 'r', cid: 'r' },
};
const run = () => crosspostAfterPost(draft, assets, {}, uri);

beforeEach(() => {
	mocks.enabled = true;
	mocks.hasScope.mockReset().mockResolvedValue(true);
	mocks.crosspost.mockReset().mockResolvedValue({ ref });
	mocks.attach.mockReset().mockResolvedValue(undefined);
});

describe('crosspostAfterPost', () => {
	it('links the Bluesky copy to the saved Nagi post', async () => {
		expect(await run()).toBeUndefined();
		expect(mocks.attach).toHaveBeenCalledWith(uri, ref);
	});

	it('warns without posting when the create permission is missing or unknown', async () => {
		mocks.hasScope.mockRejectedValue(new Error('offline'));
		expect(await run()).toBe('permission');
		mocks.enabled = false;
		expect(await run()).toBe('permission');
		expect(mocks.crosspost).not.toHaveBeenCalled();
	});

	it('warns when no copy could be created', async () => {
		mocks.crosspost.mockRejectedValue(new Error('PDS down'));
		expect(await run()).toBe('PDS down');
		expect(mocks.attach).not.toHaveBeenCalled();
	});

	it('does not link a partial thread and says a partial copy remains', async () => {
		mocks.crosspost.mockRejectedValue(
			new CrosspostPartialError([{ uri: 'p1', cid: 'c1' }], new Error('PDS down')),
		);
		expect(await run()).toBe('partial');
		expect(mocks.attach).not.toHaveBeenCalled();
	});

	it('keeps both posts and warns when linking fails', async () => {
		mocks.attach.mockRejectedValue(new Error('InvalidSwap'));
		expect(await run()).toBe('link');
	});
});
