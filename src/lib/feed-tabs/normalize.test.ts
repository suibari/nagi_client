import { describe, expect, it } from 'vitest';
import { normalizeFeedTabs } from './normalize';
import { DEFAULT_FEED_TABS } from './types';

describe('normalizeFeedTabs', () => {
	it('keeps hashtag tabs as lowercase tags without the leading #', () => {
		expect(
			normalizeFeedTabs([
				{ id: 'tag_1', kind: 'hashtag', query: ' ＃Nagi ' },
				{ id: 'q_1', kind: 'search', query: ' Hello World ' },
			]),
		).toEqual([
			{ id: 'tag_1', kind: 'hashtag', query: 'nagi' },
			{ id: 'q_1', kind: 'search', query: 'Hello World' },
		]);
	});

	it('keeps Bluesky feed tabs that point at a feed generator, once per feed', () => {
		const uri = 'at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/whats-hot';
		expect(
			normalizeFeedTabs([
				{ id: 'bsky_1', kind: 'bsky', uri, label: 'Discover' },
				{ id: 'bsky_2', kind: 'bsky', uri },
				{ id: 'bsky_3', kind: 'bsky', uri: 'at://did:plc:a/app.bsky.graph.list/1' },
				{ id: 'bsky_4', kind: 'bsky' },
			]),
		).toEqual([{ id: 'bsky_1', kind: 'bsky', uri, label: 'Discover' }]);
	});

	it('keeps the Bluesky Following tab, pointed at by source instead of uri', () => {
		expect(
			normalizeFeedTabs([
				{ id: 'bsky_f', kind: 'bsky', source: 'following' },
				{ id: 'bsky_g', kind: 'bsky', source: 'following' },
				{ id: 'bsky_h', kind: 'bsky', source: 'home' },
				{
					id: 'bsky_i',
					kind: 'bsky',
					source: 'following',
					uri: 'at://did:plc:a/app.bsky.feed.generator/x',
				},
			]),
		).toEqual([{ id: 'bsky_f', kind: 'bsky', source: 'following' }]);
	});

	it('turns the retired channel and tag-search tabs into hashtag tabs', () => {
		expect(
			normalizeFeedTabs([
				{ id: 'home', kind: 'list', source: 'home' },
				{
					id: 'ch_1',
					kind: 'channel',
					uri: 'at://did:plc:a/com.suibari.nagi.channel/1',
					label: 'Nagi',
				},
				// 名前のスナップショットが無いチャンネルはタグにできないので落とす。
				{ id: 'ch_2', kind: 'channel', uri: 'at://did:plc:a/com.suibari.nagi.channel/2' },
				{ id: 'q_1', kind: 'search', query: 'nagi', queryKind: 'tag' },
				{ id: 'q_2', kind: 'search', query: 'さんぽ', queryKind: 'keyword' },
			]),
		).toEqual([
			{ id: 'home', kind: 'list', source: 'home' },
			{ id: 'ch_1', kind: 'hashtag', query: 'nagi' },
			// 変換後に同じタグになったタブは先の1枚だけ残る。
			{ id: 'q_2', kind: 'search', query: 'さんぽ' },
		]);
	});

	it('falls back to the defaults when nothing usable is left', () => {
		expect(normalizeFeedTabs([{ id: 'ch_1', kind: 'channel', uri: 'at://x' }])).toEqual(
			DEFAULT_FEED_TABS,
		);
	});
});
