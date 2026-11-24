import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PostAssets, PostDraft } from '$lib/atproto/records';

const mocks = vi.hoisted(() => ({
	enabled: true,
	hasScope: vi.fn(async () => true),
	crosspost: vi.fn(),
	attach: vi.fn(),
	gates: vi.fn(),
}));

vi.mock('$lib/i18n/i18n.svelte', () => ({
	m: {
		crosspostPermissionMissing: () => 'permission',
		crosspostSeeMore: () => 'もっと見る',
		crosspostFailed: () => 'failed',
		crosspostLinkFailed: () => 'link',
		bskyGatesFailed: () => 'gates',
	},
}));
vi.mock('$lib/bsky/agent', () => ({ applyBskyGates: mocks.gates }));
vi.mock('./preferences', () => ({
	getCrosspostEnabled: () => mocks.enabled,
	hasCrosspostScope: mocks.hasScope,
}));
vi.mock('$lib/atproto/records', () => ({ attachCrosspost: mocks.attach }));
vi.mock('./bluesky', () => ({ crosspostToBluesky: mocks.crosspost }));

const { crosspostAfterPost } = await import('./after-post');

const draft = { text: 'hi' } as PostDraft;
const assets = { images: [], cards: [] } as PostAssets;
const uri = 'at://did:plc:me/com.suibari.nagi.post/3mpost';
const saved = { uri, cid: 'nagi-cid' };
const ref = {
	root: { uri: 'r', cid: 'r' },
	tail: { uri: 't', cid: 't' },
	threadRoot: { uri: 'r', cid: 'r' },
};
const run = () => crosspostAfterPost(draft, assets, {}, saved);

beforeEach(() => {
	mocks.enabled = true;
	mocks.hasScope.mockReset().mockResolvedValue(true);
	mocks.crosspost.mockReset().mockResolvedValue({ ref, posts: [ref.root, ref.tail] });
	mocks.attach.mockReset().mockResolvedValue(undefined);
	mocks.gates.mockReset().mockResolvedValue(undefined);
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

	it('links the rest of a long post to its Nagi thread page and marks the saved post', async () => {
		await run();
		expect(mocks.crosspost).toHaveBeenCalledWith(
			draft,
			assets,
			{},
			{
				url: 'https://nagi.suibari.com/thread/did:plc:me/3mpost',
				label: 'もっと見る',
				post: saved,
			},
		);
	});

	it('adds nothing for the default reply and quote settings', async () => {
		await run();
		expect(mocks.gates).not.toHaveBeenCalled();
	});

	it('applies reply and quote settings to the copy, limiting replies only on a thread root', async () => {
		const gates = { reply: 'following' as const, allowQuote: false };
		expect(await crosspostAfterPost(draft, assets, {}, saved, gates)).toBeUndefined();
		expect(mocks.gates).toHaveBeenCalledWith({ replyRoot: 'r', posts: ['r', 't'] }, gates);
		const reply = { root: { uri: 'x', cid: 'x' }, parent: { uri: 'y', cid: 'y' } };
		await crosspostAfterPost(draft, assets, { reply }, saved, gates);
		expect(mocks.gates).toHaveBeenLastCalledWith(
			{ replyRoot: undefined, posts: ['r', 't'] },
			gates,
		);
	});

	it('keeps the posts and warns when the settings cannot be applied', async () => {
		mocks.gates.mockRejectedValue(new Error('down'));
		expect(
			await crosspostAfterPost(draft, assets, {}, saved, { reply: 'nobody', allowQuote: true }),
		).toBe('gates');
		expect(mocks.attach).toHaveBeenCalled();
	});

	it('keeps both posts and warns when linking fails', async () => {
		mocks.attach.mockRejectedValue(new Error('InvalidSwap'));
		expect(await run()).toBe('link');
	});
});
