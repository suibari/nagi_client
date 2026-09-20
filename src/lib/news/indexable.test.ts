import { describe, expect, it } from 'vitest';
import type { NewsView } from '$lib/api/types';
import { collectIndexableNews, newsRkey } from './indexable';

const item = (uri: string) => ({ uri }) as NewsView;

describe('newsRkey', () => {
	it('takes the record key from an at-uri', () => {
		expect(newsRkey('at://did:plc:bot/com.suibari.nagi.news/0123456789abcdef0123456789abcdef')).toBe(
			'0123456789abcdef0123456789abcdef',
		);
	});
});

describe('collectIndexableNews', () => {
	it('follows the cursor to the end and keeps the bot actor from page one', async () => {
		const pages = [
			{
				items: [item('a'), item('b')],
				cursor: 'c1',
				hasMore: true,
				botActor: { did: 'did:plc:bot', handle: 'bot-tan.com' } as never,
			},
			{ items: [item('c')], hasMore: false },
		];
		let calls = 0;
		const all = await collectIndexableNews(async () => pages[calls++]);
		expect(all.items.map((n) => n.uri)).toEqual(['a', 'b', 'c']);
		expect(calls).toBe(2);
		expect(all.botActor?.handle).toBe('bot-tan.com');
	});

	it('stops at the cap so the build cannot grow without bound', async () => {
		const all = await collectIndexableNews(
			async () => ({ items: [item('x'), item('y')], cursor: String(Math.random()), hasMore: true }),
			3,
		);
		expect(all.items).toHaveLength(3);
	});

	it('stops when the cursor stops advancing', async () => {
		// 同じカーソルを返し続けるサーバに当たっても無限ループにしない。
		let calls = 0;
		const all = await collectIndexableNews(async () => {
			calls += 1;
			return { items: [item('same')], cursor: 'stuck', hasMore: true };
		});
		expect(calls).toBe(2);
		expect(all.items.map((n) => n.uri)).toEqual(['same', 'same']);
	});
});
