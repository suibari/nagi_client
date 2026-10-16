import { describe, expect, it, vi } from 'vitest';
import type { PostView, ThreadView } from '$lib/api/types';
import { BotReplyChecks, collapsibleBotReplies, itemPosts } from './bot-reply-collapse';

const post = (uri: string, isBot = false, parent?: PostView, root = parent): PostView => ({
	uri,
	cid: uri,
	author: { did: isBot ? 'bot' : uri, handle: uri },
	text: uri,
	createdAt: '',
	indexedAt: '',
	reactions: [],
	isBot,
	isAffirmation: false,
	...(parent && root
		? {
				reply: {
					parent: { uri: parent.uri, cid: parent.cid },
					root: { uri: root.uri, cid: root.cid },
				},
			}
		: {}),
});
const root = post('other');
const bot = post('reply', true, root);
const human = post('human', false, bot, root);

describe('bot reply collapse policy', () => {
	it('collapses only direct bot replies to another user, including for guests', () => {
		expect([...collapsibleBotReplies([root, bot], 'viewer')]).toEqual([bot.uri]);
		expect([...collapsibleBotReplies([root, bot])]).toEqual([bot.uri]);
		expect(collapsibleBotReplies([root, bot], root.author.did).size).toBe(0);
		expect(collapsibleBotReplies([post('bot-root', true)]).size).toBe(0);
		const botRoot = post('bot-root', true);
		expect(collapsibleBotReplies([botRoot, post('bot-reply', true, botRoot)]).size).toBe(0);
	});
	it('keeps human replies and their bot parent visible, including optimistic replies', () => {
		expect(collapsibleBotReplies([root, bot, { ...human, optimisticState: 'sending' }]).size).toBe(
			0,
		);
		expect(
			collapsibleBotReplies([root, bot, human, post('nested-bot', true, human, root)]).size,
		).toBe(0);
		expect([...collapsibleBotReplies([root, bot, { ...human, deleted: true }])]).toEqual([bot.uri]);
	});
	it('requires the root before confirming a collapse, but can identify missing-root candidates', () => {
		expect(collapsibleBotReplies([bot]).size).toBe(0);
		expect([...collapsibleBotReplies([bot], undefined, true)]).toEqual([bot.uri]);
		expect(collapsibleBotReplies([root, { ...bot, deleted: true }]).size).toBe(0);
	});
	it('uses grouped bubbles or legacy parent/item/bot reply without losing human replies', () => {
		expect(itemPosts({ ...root, botReply: bot }).map((post) => post.uri)).toEqual([
			root.uri,
			bot.uri,
		]);
		expect(itemPosts({ ...human, replyParent: bot }).map((post) => post.uri)).toEqual([
			bot.uri,
			human.uri,
		]);
		expect(
			itemPosts({
				...root,
				conversation: {
					root,
					threadRootUri: root.uri,
					bubbles: [{ post: bot, depth: 1 }],
					hiddenCount: 0,
					totalCount: 2,
				},
			}),
		).toEqual([root, bot]);
	});
});

describe('shared thread checks', () => {
	const thread: ThreadView = { post: root, replies: [bot] };
	it('deduplicates concurrent checks and reuses a short-lived result', async () => {
		const fetcher = vi.fn(async () => ({ thread }));
		const checks = new BotReplyChecks(fetcher);
		const first = checks.get('viewer', root.uri, 'same');
		expect(checks.get('viewer', root.uri, 'same')).toBe(first);
		await first;
		await checks.get('viewer', root.uri, 'same');
		expect(fetcher).toHaveBeenCalledTimes(1);
		await checks.get('viewer', root.uri, 'updated');
		expect(fetcher).toHaveBeenCalledTimes(2);
	});
	it('rechecks after expiry, invalidation, or a viewer change', async () => {
		const now = vi.spyOn(Date, 'now').mockReturnValue(100);
		try {
			const fetcher = vi.fn(async () => ({ thread }));
			const checks = new BotReplyChecks(fetcher);
			await checks.get('viewer', root.uri, 'same');
			now.mockReturnValue(3101);
			await checks.get('viewer', root.uri, 'same');
			checks.clear();
			await checks.get('viewer', root.uri, 'same');
			await checks.get('other', root.uri, 'same');
			expect(fetcher).toHaveBeenCalledTimes(4);
		} finally {
			now.mockRestore();
		}
	});
	it('fails open and does not restore invalidated in-flight entries', async () => {
		const failed = new BotReplyChecks(vi.fn().mockRejectedValue(new Error('offline')));
		expect(await failed.get(undefined, root.uri, 'same')).toBeUndefined();
		let resolve!: (value: { thread: ThreadView }) => void;
		const fetcher = vi.fn(
			() =>
				new Promise<{ thread: ThreadView }>((done) => {
					resolve = done;
				}),
		);
		const checks = new BotReplyChecks(fetcher);
		const pending = checks.get('viewer', root.uri, 'same');
		checks.clear();
		resolve({ thread });
		await pending;
		const next = checks.get('viewer', root.uri, 'same');
		expect(fetcher).toHaveBeenCalledTimes(2);
		resolve({ thread });
		await next;
	});
});
