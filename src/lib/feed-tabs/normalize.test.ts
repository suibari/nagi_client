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
