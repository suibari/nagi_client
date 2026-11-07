import { describe, expect, it } from 'vitest';
import type { PostView } from '$lib/api/types';
import { isReplyToViewer } from './reply-to-viewer';

const VIEWER = 'did:plc:viewer';
const APPVIEW = 'did:web:appview';

const post = (
	did: string,
	rkey: string,
	parent?: PostView,
	extra: Partial<PostView> = {},
): PostView => ({
	uri: `at://${did}/com.suibari.nagi.post/${rkey}`,
	cid: rkey,
	author: { did, handle: did },
	text: rkey,
	createdAt: '',
	indexedAt: '',
	reactions: [],
	isBot: false,
	isAffirmation: false,
	...(parent
		? {
				reply: {
					parent: { uri: parent.uri, cid: parent.cid },
					root: parent.reply?.root ?? { uri: parent.uri, cid: parent.cid },
				},
			}
		: {}),
	...extra,
});

const mine = post(VIEWER, 'mine');
const fromOther = post('did:plc:other', 'reply', mine);

describe('isReplyToViewer', () => {
	it('marks another person replying to the viewer', () => {
		expect(isReplyToViewer(fromOther, VIEWER, [mine, fromOther])).toBe(true);
	});

	it('reads the parent author from the URI when the parent is not on the card', () => {
		expect(isReplyToViewer(fromOther, VIEWER, [fromOther])).toBe(true);
	});

	it('uses the known parent author for kossori posts stored under the AppView DID', () => {
		const kossoriMine = { ...post(APPVIEW, 'k'), author: { did: VIEWER, handle: VIEWER } };
		const reply = post('did:plc:other', 'r', kossoriMine);
		expect(isReplyToViewer(reply, VIEWER, [kossoriMine, reply])).toBe(true);
		// 親が手元に無いと URI からは作者が分からないので、出さないほうへ倒れる。
		expect(isReplyToViewer(reply, VIEWER, [reply])).toBe(false);
	});

	it('ignores replies to someone else', () => {
		const other = post('did:plc:other', 'root');
		const reply = post('did:plc:third', 'r', other);
		expect(isReplyToViewer(reply, VIEWER, [other, reply])).toBe(false);
	});

	it('ignores the viewer replying to themselves, bot replies, top-level and deleted posts', () => {
		expect(isReplyToViewer(post(VIEWER, 'self', mine), VIEWER, [mine])).toBe(false);
		expect(isReplyToViewer(post('did:plc:bot', 'b', mine, { isBot: true }), VIEWER, [mine])).toBe(
			false,
		);
		expect(isReplyToViewer(post('did:plc:other', 'top'), VIEWER, [])).toBe(false);
		expect(isReplyToViewer({ ...fromOther, deleted: true }, VIEWER, [mine])).toBe(false);
	});

	it('shows nothing to guests', () => {
		expect(isReplyToViewer(fromOther, undefined, [mine, fromOther])).toBe(false);
	});
});
