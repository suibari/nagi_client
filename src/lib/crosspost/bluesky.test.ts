import { describe, expect, it } from 'vitest';
import type { Facet } from '$lib/atproto/facets';
import { parsePostText } from '$lib/atproto/facets';
import type { PostAssets, PostDraft } from '$lib/atproto/records';
import { prepareCrosspostContent, splitForBluesky } from './bluesky';

const bytes = (value: string) => new TextEncoder().encode(value).length;
const graphemeCount = (value: string) =>
	[...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(value)].length;

const link = (byteStart: number, byteEnd: number, uri: string): Facet => ({
	index: { byteStart, byteEnd },
	features: [{ $type: 'app.bsky.richtext.facet#link', uri }],
});

const draft = (text = ''): PostDraft => ({
	text,
	facets: [],
	langs: ['ja'],
	createdAt: '2026-08-09T00:00:00.000Z',
	attachments: [],
	linkCards: [],
});

const emptyAssets = (): PostAssets => ({ images: [], cards: [] });

describe('splitForBluesky', () => {
	it('returns a single chunk when the text fits', () => {
		expect(splitForBluesky('みじかい投稿')).toEqual([{ text: 'みじかい投稿', facets: [] }]);
	});

	it('returns no chunks for whitespace-only text', () => {
		expect(splitForBluesky('   \n  ')).toEqual([]);
	});

	it('keeps every chunk within the 300 grapheme limit', () => {
		const chunks = splitForBluesky('あ'.repeat(700));
		expect(chunks.length).toBeGreaterThan(1);
		for (const chunk of chunks) expect(graphemeCount(chunk.text)).toBeLessThanOrEqual(300);
		expect(chunks.map((chunk) => chunk.text).join('')).toBe('あ'.repeat(700));
	});

	it('keeps every chunk within the 3000 byte limit even under 300 graphemes', () => {
		// ZWJ 連結絵文字は1グラフェムで25バイト。200個ならグラフェム上限には遠いが
		// 5000バイトあるので、バイト上限のほうが先に効く。
		const family = '👨‍👩‍👧‍👦';
		expect(graphemeCount(family)).toBe(1);
		const chunks = splitForBluesky(family.repeat(200));
		expect(chunks.length).toBeGreaterThan(1);
		for (const chunk of chunks) {
			expect(bytes(chunk.text)).toBeLessThanOrEqual(3000);
			expect(graphemeCount(chunk.text)).toBeLessThan(300);
		}
	});

	it('prefers breaking at a newline', () => {
		const head = 'あ'.repeat(280);
		const tail = 'い'.repeat(100);
		const [first] = splitForBluesky(`${head}\n${tail}`);
		expect(first.text).toBe(head);
	});

	it('falls back to a space when there is no newline', () => {
		const head = 'あ'.repeat(280);
		const tail = 'い'.repeat(100);
		const [first] = splitForBluesky(`${head} ${tail}`);
		expect(first.text).toBe(head);
	});

	it('does not split inside a facet', () => {
		// 区切り候補の位置が URL の内側に来るケース。URL を割らずに手前で切る。
		const url = `https://example.com/${'a'.repeat(60)}`;
		const head = 'あ'.repeat(260);
		const source = `${head} ${url} しっぽ`;
		const facets = [link(bytes(`${head} `), bytes(`${head} `) + bytes(url), url)];
		const chunks = splitForBluesky(source, facets);
		expect(chunks.length).toBeGreaterThan(1);
		for (const chunk of chunks) {
			// URL が途中で切れていたら、断片だけが現れる。
			if (chunk.text.includes('https://')) expect(chunk.text).toContain(url);
		}
	});

	it('rebases facet offsets onto the chunk that contains them', () => {
		const head = 'あ'.repeat(290);
		const url = 'https://example.com/a';
		const parsed = parsePostText(`${head}\n${url}`);
		const chunks = splitForBluesky(parsed.text, parsed.facets);
		expect(chunks).toHaveLength(2);
		expect(chunks[0].facets).toEqual([]);
		expect(chunks[1].text).toBe(url);
		// 2つ目のチャンクの先頭からの相対位置になっている。
		expect(chunks[1].facets[0].index).toEqual({ byteStart: 0, byteEnd: bytes(url) });
	});

	it('drops facets that no chunk fully contains', () => {
		// 1チャンクに収まらない長さの facet は、切った時点で意味を失うので落とす。
		const url = `https://example.com/${'a'.repeat(400)}`;
		const chunks = splitForBluesky(url, [link(0, bytes(url), url)]);
		expect(chunks.length).toBeGreaterThan(1);
		for (const chunk of chunks) expect(chunk.facets).toEqual([]);
	});

	it('trims whitespace at the chunk boundaries', () => {
		const head = 'あ'.repeat(280);
		const tail = 'い'.repeat(100);
		const chunks = splitForBluesky(`${head}\n${tail}`);
		for (const chunk of chunks) expect(chunk.text).toBe(chunk.text.trim());
	});
});

describe('prepareCrosspostContent', () => {
	it('creates an empty-text chunk for a link-card-only post', () => {
		const assets: PostAssets = {
			images: [],
			cards: [
				{
					uri: 'https://example.com/article',
					title: 'Example article',
					description: 'Description',
				},
			],
		};

		expect(prepareCrosspostContent(draft(), assets)).toEqual({
			chunks: [{ text: '', facets: [] }],
			embed: {
				$type: 'app.bsky.embed.external',
				external: {
					uri: 'https://example.com/article',
					title: 'Example article',
					description: 'Description',
				},
			},
		});
	});

	it('creates an empty-text chunk for an image-only post', () => {
		const image = {
			image: { ref: 'blob-ref' },
			alt: 'alt text',
			aspectRatio: { width: 1200, height: 800 },
		};
		const assets: PostAssets = { images: [image], cards: [] };

		expect(prepareCrosspostContent(draft(), assets)).toEqual({
			chunks: [{ text: '', facets: [] }],
			embed: { $type: 'app.bsky.embed.images', images: [image] },
		});
	});

	it('does not create a chunk when both text and embeds are absent', () => {
		expect(prepareCrosspostContent(draft(), emptyAssets())).toEqual({
			chunks: [],
			embed: undefined,
		});
	});

	it('keeps normal text and its link card together', () => {
		const assets: PostAssets = {
			images: [],
			cards: [{ uri: 'https://example.com', title: 'Example' }],
		};

		const result = prepareCrosspostContent(draft('本文あり'), assets);
		expect(result.chunks).toEqual([{ text: '本文あり', facets: [] }]);
		expect(result.embed?.$type).toBe('app.bsky.embed.external');
	});
});
