import { describe, expect, it, vi } from 'vitest';

vi.mock('$lib/oauth/session.svelte', async () => {
	const { writable } = await import('svelte/store');
	return { session: writable(undefined) };
});
vi.mock('$lib/api/appview', () => ({ ensureRecord: vi.fn() }));
vi.mock('$lib/optin/scope-optin', () => ({ sessionCovers: vi.fn() }));
vi.mock('$lib/oauth/client', () => ({
	TRILINES_COLLECTION_SCOPE: 'repo:com.suibari.trilinesat.diary',
}));
vi.mock('$lib/crosspost/bluesky', () => ({ VIA: 'Nagi' }));

const {
	TRILINES_HUB_URI,
	buildTrilinesLines,
	emptyTrilinesLines,
	newTrilinesRecord,
	trilinesEntryUrl,
	trilinesSubmittable,
} = await import('./records');

describe('newTrilinesRecord', () => {
	it('Nagi から書いた日記は Nagi への公開と TriLinesAt の全体フィードの両方に印を付ける', () => {
		const record = newTrilinesRecord([{ text: 'a' }], ['ja'], new Date('2026-11-03T00:00:00Z'));
		expect(record).toEqual({
			$type: 'com.suibari.trilinesat.diary',
			lines: [{ text: 'a' }],
			langs: ['ja'],
			createdAt: '2026-11-03T00:00:00.000Z',
			hubRef: TRILINES_HUB_URI,
			shareToNagi: true,
		});
	});
});
const { buildTrilinesShareText } = await import('./share');

describe('3行日記のレコード', () => {
	it('空の行を詰め、画像のある行だけ alt を付ける', () => {
		const lines = [
			{ text: ' 朝ごはん ', alt: '無視' },
			{ text: '', alt: '' },
			{ text: '猫', alt: ' 猫の写真 ' },
		];
		expect(buildTrilinesLines(lines, [undefined, 'blob-x', 'blob-cat'])).toEqual([
			{ text: '朝ごはん' },
			{ text: '猫', image: 'blob-cat', alt: '猫の写真' },
		]);
	});

	it('3行すべてが書かれ、どの行も50字以内なら投稿できる', () => {
		const line = (text: string) => ({ text, alt: '' });
		expect(trilinesSubmittable(emptyTrilinesLines())).toBe(false);
		expect(trilinesSubmittable([line('a'), line(' '), line('c')])).toBe(false);
		expect(trilinesSubmittable([line('a'), line('b'), line('c')])).toBe(true);
		expect(trilinesSubmittable([line('あ'.repeat(51)), line('b'), line('c')])).toBe(false);
	});

	it('TriLinesAt の日記ページを指す', () => {
		expect(trilinesEntryUrl('at://did:plc:a/com.suibari.trilinesat.diary/3abc')).toBe(
			'https://trilinesat.suibari.com/entry/did:plc:a/3abc',
		);
	});
});

describe('Bluesky への共有文', () => {
	it('リンクとハッシュタグの facet を正しいバイト位置に置く', () => {
		const { text, facets } = buildTrilinesShareText(
			['朝ごはん', '猫'],
			'at://did:plc:a/com.suibari.trilinesat.diary/3abc',
			{ template: '今日の三行日記', link: '📓TriLinesAtで見る' },
		);
		expect(text).toBe('今日の三行日記\n\n朝ごはん\n猫\n\n📓TriLinesAtで見る\n\n#TriLinesAt');
		const encoded = new TextEncoder().encode(text);
		const slice = (facet: (typeof facets)[number]) =>
			new TextDecoder().decode(encoded.slice(facet.index.byteStart, facet.index.byteEnd));
		expect(slice(facets[0])).toBe('📓TriLinesAtで見る');
		expect(slice(facets[1])).toBe('#TriLinesAt');
	});
});
