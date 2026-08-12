import { describe, expect, it } from 'vitest';
import { composerHost } from './composer-host.svelte';
import type { PostView } from '$lib/api/types';

const mockPost: PostView = {
	uri: 'at://did:plc:test/app.bsky.feed.post/123',
	cid: 'bafyreitest123',
	author: {
		did: 'did:plc:test',
		handle: 'test.bsky.social',
		displayName: 'Test User',
	},
	text: 'Hello world',
	createdAt: '2026-08-12T00:00:00.000Z',
	indexedAt: '2026-08-12T00:00:00.000Z',
	reactions: [],
	isBot: false,
	isAffirmation: false,
};

describe('ComposerHost reply/quote target state', () => {
	it('sets reply target correctly and clears it on clearReply', () => {
		composerHost.clearAllTargets();
		expect(composerHost.replyTarget).toBeUndefined();

		composerHost.openReply(mockPost);
		expect(composerHost.replyTarget).toBeDefined();
		expect(composerHost.replyTarget?.post.uri).toBe(mockPost.uri);
		expect(composerHost.replyTarget?.parent.uri).toBe(mockPost.uri);

		// 解除ボタン（×ボタン）で clearReply() を実行したときの挙動
		composerHost.clearReply();
		expect(composerHost.replyTarget).toBeUndefined();
	});

	it('sets quote target correctly and clears it on clearQuote', () => {
		composerHost.clearAllTargets();
		expect(composerHost.quoteTarget).toBeUndefined();

		composerHost.openQuote(mockPost);
		expect(composerHost.quoteTarget).toBeDefined();
		expect(composerHost.quoteTarget?.post?.uri).toBe(mockPost.uri);

		// 解除ボタン（×ボタン）で clearQuote() を実行したときの挙動
		composerHost.clearQuote();
		expect(composerHost.quoteTarget).toBeUndefined();
	});

	it('clears all targets on clearAllTargets', () => {
		composerHost.openReply(mockPost);
		expect(composerHost.replyTarget).toBeDefined();

		composerHost.clearAllTargets();
		expect(composerHost.replyTarget).toBeUndefined();
		expect(composerHost.quoteTarget).toBeUndefined();
	});
});
