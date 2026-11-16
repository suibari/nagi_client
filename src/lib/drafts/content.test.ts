import { describe, expect, it } from 'vitest';
import type { DraftContent } from '$lib/api/types';
import { draftContentKey } from './content';

const base: DraftContent = {
	text: '本文',
	mentions: [],
	emojis: [],
	linkCards: [],
	dismissedUrls: [],
};
describe('保存応答と下書きの照合', () => {
	it('旧応答の省略メタデータを空値と同じ扱いにする', () => {
		expect(draftContentKey(base)).toBe(
			draftContentKey({ ...base, articleTitle: '', articleTags: [] }),
		);
	});
	it('保存先が捨てたタイトル・タグ・本文変更を見逃さない', () => {
		for (const extra of [
			{ articleTitle: 'タイトル' },
			{ articleTags: ['タグ'] },
			{ text: '別の本文' },
		])
			expect(draftContentKey({ ...base, ...extra })).not.toBe(draftContentKey(base));
	});
	it('参照オブジェクトのキー順に依存しない', () => {
		const mention = { start: 0, end: 2, did: 'did:plc:a', handle: 'a.test' };
		expect(draftContentKey({ ...base, mentions: [mention] })).toBe(
			draftContentKey({
				...base,
				mentions: [{ handle: mention.handle, did: mention.did, end: 2, start: 0 }],
			}),
		);
	});
	it('カードの省略と保存する文字情報の差を検出する', () => {
		const card = { uri: 'https://example.com', title: '見出し', description: '説明' };
		const withCard = { ...base, linkCards: [card] };
		expect(draftContentKey(withCard)).not.toBe(draftContentKey(base));
		expect(draftContentKey(withCard)).not.toBe(
			draftContentKey({ ...base, linkCards: [{ ...card, title: '旧見出し' }] }),
		);
	});
});
