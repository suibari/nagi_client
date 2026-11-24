import { describe, expect, it } from 'vitest';
import type { PostView, ThreadView } from '$lib/api/types';
import { LONG_POST_FIELD, loadLongPostText, longPostOf } from './longPost';

const did = 'did:plc:me';
const ref = { uri: `at://${did}/com.suibari.nagi.post/3kpost`, cid: 'cid-at-crosspost' };

describe('longPostOf', () => {
	it('reads a marker pointing at a Nagi post in the same repository', () => {
		expect(longPostOf({ text: '冒頭…もっと見る', [LONG_POST_FIELD]: ref }, did)).toEqual(ref);
	});

	it('ignores markers for another repository, another collection or a broken shape', () => {
		const other = { uri: 'at://did:plc:other/com.suibari.nagi.post/3k', cid: 'c' };
		const collection = { uri: `at://${did}/site.mochott.article/3k`, cid: 'c' };
		expect(longPostOf({ [LONG_POST_FIELD]: other }, did)).toBeUndefined();
		expect(longPostOf({ [LONG_POST_FIELD]: collection }, did)).toBeUndefined();
		expect(longPostOf({ [LONG_POST_FIELD]: { uri: ref.uri } }, did)).toBeUndefined();
		expect(longPostOf({ [LONG_POST_FIELD]: 'x' }, did)).toBeUndefined();
		expect(longPostOf({ text: 'plain' }, did)).toBeUndefined();
	});
});

describe('loadLongPostText', () => {
	const post = (overrides: Partial<PostView> = {}) =>
		({
			uri: ref.uri,
			cid: 'cid-after-link',
			author: { did },
			text: '全文',
			facets: [],
			...overrides,
		}) as unknown as PostView;
	const load = (value?: PostView) => async () => ({ thread: { post: value } as ThreadView });

	it('returns the full text even though the version moved on', async () => {
		expect(await loadLongPostText(ref, did, load(post()))).toEqual({ text: '全文', facets: [] });
	});

	it('returns nothing for a post Nagi would not show as is', async () => {
		for (const hidden of [
			{ deleted: true },
			{ kossori: true },
			{ threadKossori: true },
			{ unavailableReason: 'moderation-policy' as const },
			{ contentWarning: { byteStart: 0, byteEnd: 3 } },
			{ moderationLabels: ['spam'] },
			{ author: { did: 'did:plc:other' } as PostView['author'] },
		])
			expect(await loadLongPostText(ref, did, load(post(hidden)))).toBeUndefined();
	});

	it('passes a failed request on to the caller', async () => {
		const failing = async () => {
			throw new Error('down');
		};
		await expect(loadLongPostText(ref, did, failing)).rejects.toThrow('down');
	});
});
