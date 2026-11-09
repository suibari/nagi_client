import { describe, expect, it } from 'vitest';
import type { FeedItem, PostView } from '$lib/api/types';
import { pickShowcasePosts } from './showcase-posts';

const author = { did: 'did:plc:a', handle: 'a.example.com' };
const bot = { did: 'did:plc:bot', handle: 'bot.example.com', isBot: true };

function post(id: string, extra: Partial<PostView> = {}): PostView {
	return {
		uri: `at://did:plc:a/app/${id}`,
		cid: id,
		author,
		text: id,
		createdAt: '2026-11-01T00:00:00.000Z',
		indexedAt: '2026-11-01T00:00:00.000Z',
		reactions: [],
		isBot: false,
		isAffirmation: false,
		...extra,
	};
}
const reply = (id: string) =>
	post(`${id}-reply`, { author: bot, isBot: true, selfLabels: ['ai-generated'] });
const item = (id: string, extra: Partial<FeedItem> = {}): FeedItem => ({
	...post(id, { author: { did: `did:plc:${id}`, handle: `${id}.example.com` } }),
	botReply: reply(id),
	...extra,
});
const reactions = (count: number) =>
	Array.from({ length: count }, (_, i) => ({ emoji: String(i), reactors: [] }));

describe('pickShowcasePosts', () => {
	it('keeps only root posts that bot-tan replied to', () => {
		const picked = pickShowcasePosts([
			item('ok'),
			item('no-reply', { botReply: undefined }),
			item('is-reply', {
				reply: { root: { uri: 'x', cid: 'x' }, parent: { uri: 'x', cid: 'x' } },
			}),
		]);
		expect(picked.map((entry) => entry.post.text)).toEqual(['ok']);
	});

	it('drops anything whose content would be hidden or lacks context', () => {
		const picked = pickShowcasePosts([
			item('cw', { contentWarning: { byteStart: 0, byteEnd: 1 } }),
			item('label', { moderationLabels: ['spam'] }),
			item('self-label', { selfLabels: ['nudity'] }),
			item('kossori', { threadKossori: true }),
			item('image-cw', { images: [{ url: '/i', alt: '', contentWarning: true }] }),
			item('video-cw', { video: { playlist: 'p', thumbnail: 't', contentWarning: true } }),
			item('article', { article: true }),
			item('quote', { quote: { kind: 'post', post: post('q') } }),
			item('deleted', { deleted: true }),
		]);
		expect(picked).toEqual([]);
	});

	it('keeps bot replies even though they are labelled ai-generated', () => {
		expect(pickShowcasePosts([item('ok')])).toHaveLength(1);
	});

	it('allows images and videos without warnings', () => {
		const picked = pickShowcasePosts([
			item('image', { images: [{ url: '/i', alt: '' }] }),
			item('video', { video: { playlist: 'p', thumbnail: 't' } }),
		]);
		expect(picked.map((entry) => entry.post.text)).toEqual(['image', 'video']);
	});

	it('prefers posts with more kinds of emoji but keeps timeline order', () => {
		const picked = pickShowcasePosts(
			[
				item('a', { reactions: reactions(1) }),
				item('b'),
				item('c', { reactions: reactions(3) }),
				item('d', { reactions: reactions(2) }),
			],
			3,
		);
		expect(picked.map((entry) => entry.post.text)).toEqual(['a', 'c', 'd']);
	});

	it('shows at most one post per author, picking their most reacted one', () => {
		const same = { did: 'did:plc:a', handle: 'a.example.com' };
		const picked = pickShowcasePosts([
			item('a1', { author: same }),
			item('a2', { author: same, reactions: reactions(2) }),
			item('b1'),
		]);
		expect(picked.map((entry) => entry.post.text)).toEqual(['a2', 'b1']);
	});

	it('reads the bot reply out of grouped conversations', () => {
		const root = post('root');
		const picked = pickShowcasePosts([
			{
				...post('latest'),
				conversation: {
					threadRootUri: root.uri,
					root,
					bubbles: [{ post: reply('root'), depth: 1 }],
					hiddenCount: 0,
					totalCount: 2,
				},
			},
		]);
		expect(picked[0]?.post.text).toBe('root');
		expect(picked[0]?.botReply.isBot).toBe(true);
	});
});
