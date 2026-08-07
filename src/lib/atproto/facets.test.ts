import { describe, expect, it } from 'vitest';
import type { EmojiView } from '$lib/api/types';
import {
	httpUrl,
	parsePostText,
	restorePostEditState,
	validChannelSelections,
	type ChannelSelection,
	type MentionSelection,
} from './facets';

/** facet の index は UTF-8 バイト。テストの意図を「何バイト目か」で書けるようにする。 */
const bytes = (value: string) => new TextEncoder().encode(value).length;

const emoji: EmojiView = {
	uri: 'at://did:plc:emoji/blue.moji.collection.item/neko',
	cid: 'bafyneko',
	did: 'did:plc:emoji',
	name: ':neko:',
	url: '/api/emoji-asset/did%3Aplc%3Aemoji/neko/bafyneko',
	mediaType: 'image/png',
};

describe('httpUrl', () => {
	it('normalizes http(s) URLs and rejects everything else', () => {
		expect(httpUrl('https://example.com/a')).toBe('https://example.com/a');
		// URL の正規化でオリジンだけの URL には末尾スラッシュが付く。
		expect(httpUrl('https://example.com')).toBe('https://example.com/');
		expect(httpUrl('javascript:alert(1)')).toBeUndefined();
		expect(httpUrl('ftp://example.com')).toBeUndefined();
		expect(httpUrl('example.com')).toBeUndefined();
	});
});

describe('parsePostText: links', () => {
	it('facets a raw URL at the right byte offset after multibyte text', () => {
		const { text, facets, urls } = parsePostText('こんにちは https://example.com/a');
		expect(text).toBe('こんにちは https://example.com/a');
		expect(facets).toHaveLength(1);
		// 'こんにちは ' は 3バイト×5 + 半角空白。
		expect(facets[0].index).toEqual({
			byteStart: 16,
			byteEnd: 16 + bytes('https://example.com/a'),
		});
		expect(facets[0].features[0]).toEqual({
			$type: 'app.bsky.richtext.facet#link',
			uri: 'https://example.com/a',
		});
		expect(urls).toEqual(['https://example.com/a']);
	});

	it('keeps trailing punctuation out of the link', () => {
		const { text, facets } = parsePostText('見て https://example.com/a。');
		expect(text).toBe('見て https://example.com/a。');
		expect(facets[0].index.byteEnd).toBe(bytes('見て ') + bytes('https://example.com/a'));
	});

	it('drops an unbalanced closing paren from a raw URL', () => {
		const { facets } = parsePostText('(https://example.com/a)');
		expect(facets[0].features[0]).toEqual({
			$type: 'app.bsky.richtext.facet#link',
			uri: 'https://example.com/a',
		});
	});

	it('replaces markdown links with the label and facets it', () => {
		const { text, facets, urls } = parsePostText('[ねこ](https://example.com/neko) を見た');
		// 本文からは記法が消え、ラベルだけが残る。
		expect(text).toBe('ねこ を見た');
		expect(facets).toHaveLength(1);
		expect(facets[0].index).toEqual({ byteStart: 0, byteEnd: bytes('ねこ') });
		expect(facets[0].features[0]).toEqual({
			$type: 'app.bsky.richtext.facet#link',
			uri: 'https://example.com/neko',
		});
		expect(urls).toEqual(['https://example.com/neko']);
	});

	it('leaves a markdown link with a non-http target as plain text', () => {
		const { text, facets } = parsePostText('[x](javascript:alert(1))');
		expect(text).toBe('[x](javascript:alert(1))');
		expect(facets).toHaveLength(0);
	});

	it('lists each distinct URL once', () => {
		const { urls } = parsePostText('https://example.com/a と https://example.com/a と https://example.com/b');
		expect(urls).toEqual(['https://example.com/a', 'https://example.com/b']);
	});
});

describe('parsePostText: tags', () => {
	it('facets a hashtag and keeps the original case in the tag value', () => {
		const { text, facets } = parsePostText('#Nagi たのしい');
		expect(text).toBe('#Nagi たのしい');
		expect(facets[0].index).toEqual({ byteStart: 0, byteEnd: bytes('#Nagi') });
		expect(facets[0].features[0]).toEqual({ $type: 'app.bsky.richtext.facet#tag', tag: 'Nagi' });
	});

	it('accepts the fullwidth marker', () => {
		const { facets } = parsePostText('＃猫');
		expect(facets[0].features[0]).toEqual({ $type: 'app.bsky.richtext.facet#tag', tag: '猫' });
		expect(facets[0].index).toEqual({ byteStart: 0, byteEnd: bytes('＃猫') });
	});

	it('excludes trailing punctuation from the facet range but keeps it in the text', () => {
		const { text, facets } = parsePostText('#猫。');
		expect(text).toBe('#猫。');
		expect(facets[0].features[0]).toEqual({ $type: 'app.bsky.richtext.facet#tag', tag: '猫' });
		expect(facets[0].index.byteEnd).toBe(bytes('#猫'));
	});

	it('does not facet digit-only tags', () => {
		const { text, facets } = parsePostText('#123');
		expect(text).toBe('#123');
		expect(facets).toHaveLength(0);
	});

	it('requires the marker to start a word', () => {
		const { facets } = parsePostText('a#tag');
		expect(facets).toHaveLength(0);
	});
});

describe('parsePostText: mentions', () => {
	const mention: MentionSelection = {
		start: 0,
		end: '@alice.test'.length,
		did: 'did:plc:alice',
		handle: 'alice.test',
	};

	it('facets a selected mention', () => {
		const { text, facets } = parsePostText('@alice.test さん', [mention]);
		expect(text).toBe('@alice.test さん');
		expect(facets[0].index).toEqual({ byteStart: 0, byteEnd: bytes('@alice.test') });
		expect(facets[0].features[0]).toEqual({
			$type: 'app.bsky.richtext.facet#mention',
			did: 'did:plc:alice',
		});
	});

	it('drops a selection whose range no longer matches the text', () => {
		// 選択後にハンドルを打ち替えた状況。位置だけで facet を作ると別人を指してしまう。
		const { facets } = parsePostText('@bob.test さん', [mention]);
		expect(facets).toHaveLength(0);
	});
});

describe('parsePostText: bluemoji', () => {
	it('emits the Nagi reference facet, and the official one only when formats exist', () => {
		const selection = { start: 0, end: emoji.name.length, emoji };
		const { text, facets } = parsePostText(':neko: だよ', [], [], [selection]);
		expect(text).toBe(':neko: だよ');
		expect(facets[0].index).toEqual({ byteStart: 0, byteEnd: bytes(':neko:') });
		expect(facets[0].features).toEqual([
			{
				$type: 'com.suibari.nagi.richtext#bluemoji',
				ref: { uri: emoji.uri, cid: emoji.cid },
				did: emoji.did,
				name: emoji.name,
				mediaType: emoji.mediaType,
			},
		]);
	});
});

describe('validChannelSelections', () => {
	const channel: ChannelSelection = {
		start: 0,
		end: '#にゃんこ'.length,
		uri: 'at://did:plc:ch/com.suibari.nagi.channel/abc',
		cid: 'bafych',
		name: 'にゃんこ',
	};

	it('keeps a selection whose text still reads as its own tag', () => {
		expect(validChannelSelections('#にゃんこ で話す', [channel])).toEqual([channel]);
		expect(validChannelSelections('＃にゃんこ で話す', [channel])).toEqual([channel]);
	});

	it('drops a selection once the tag text changed', () => {
		expect(validChannelSelections('#いぬ で話す', [channel])).toEqual([]);
	});
});

describe('restorePostEditState', () => {
	it('round-trips a named link back into markdown', () => {
		const parsed = parsePostText('[ねこ](https://example.com/neko) を見た');
		const restored = restorePostEditState(parsed.text, parsed.facets);
		expect(restored.text).toBe('[ねこ](https://example.com/neko) を見た');
	});

	it('leaves a bare URL as-is instead of wrapping it in markdown', () => {
		const parsed = parsePostText('https://example.com/a');
		const restored = restorePostEditState(parsed.text, parsed.facets);
		expect(restored.text).toBe('https://example.com/a');
	});

	it('rebuilds mention selections at character positions', () => {
		const source = 'こんにちは @alice.test';
		const mention: MentionSelection = {
			start: source.indexOf('@'),
			end: source.length,
			did: 'did:plc:alice',
			handle: 'alice.test',
		};
		const parsed = parsePostText(source, [mention]);
		const restored = restorePostEditState(parsed.text, parsed.facets);
		expect(restored.text).toBe(source);
		expect(restored.mentions).toEqual([
			{ start: 6, end: source.length, did: 'did:plc:alice', handle: 'alice.test' },
		]);
	});

	it('restores a channel tag only when the label matches the channel name exactly', () => {
		const parsed = parsePostText('#にゃんこ で話す');
		const channel = { uri: 'at://did:plc:ch/c/abc', cid: 'bafych', name: 'にゃんこ' };
		expect(restorePostEditState(parsed.text, parsed.facets, channel).channels).toEqual([
			{ start: 0, end: '#にゃんこ'.length, uri: channel.uri, cid: channel.cid, name: channel.name },
		]);
		// 表記が違えば「タグ由来の所属」と見なさない＝編集しても CH から外れない。
		expect(
			restorePostEditState(parsed.text, parsed.facets, { ...channel, name: 'ニャンコ' }).channels,
		).toEqual([]);
	});

	it('ignores facets with impossible ranges', () => {
		const restored = restorePostEditState('abc', [
			{ index: { byteStart: 2, byteEnd: 99 }, features: [{ $type: 'app.bsky.richtext.facet#tag' }] },
		]);
		expect(restored.text).toBe('abc');
	});
});
