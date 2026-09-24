import { describe, expect, it } from 'vitest';
import { annotateMarkdownSource, extractTitle, parseRichText, stripMarkdown } from './markdown';
import { parsePostText } from './facets';

const flatten = (runs: Array<{ text: string }>) => runs.map((run) => run.text).join('');

describe('extractTitle', () => {
	it('takes the h1 when the body starts with one', () => {
		expect(extractTitle('# ねこの話\n\n本文')).toBe('ねこの話');
	});

	it('strips inline marks from the title', () => {
		expect(extractTitle('# **ねこ**の話')).toBe('ねこの話');
	});

	it('returns undefined when the first block is not an h1', () => {
		expect(extractTitle('本文\n\n# あとから見出し')).toBeUndefined();
		expect(extractTitle('## h2 はタイトルにしない')).toBeUndefined();
		expect(extractTitle('')).toBeUndefined();
	});

	it('requires a space after the marker', () => {
		expect(extractTitle('#タグ っぽい行')).toBeUndefined();
	});
});

describe('stripMarkdown', () => {
	it('drops markers and collapses whitespace into one line', () => {
		expect(stripMarkdown('# 見出し\n\n**太字**と`コード`\n\n- 箇条1\n- 箇条2')).toBe(
			'見出し 太字とコード 箇条1 箇条2',
		);
	});

	it('keeps the label of a named link', () => {
		const parsed = parsePostText('[ねこ](https://example.com/neko) を見た');
		expect(stripMarkdown(parsed.text)).toBe('ねこ を見た');
	});
});

describe('parseRichText', () => {
	it('splits headings, paragraphs, quotes and lists into blocks', () => {
		const blocks = parseRichText('# 見出し\n\n段落\n\n> 引用\n\n- a\n- b\n\n1. x\n2. y');
		expect(blocks.map((block) => block.type)).toEqual(['h1', 'p', 'quote', 'ul', 'ol']);
		const ol = blocks.find((block) => block.type === 'ol');
		expect(ol && 'start' in ol && ol.start).toBe(1);
		const ul = blocks.find((block) => block.type === 'ul');
		expect(ul && 'items' in ul && ul.items.map(flatten)).toEqual(['a', 'b']);
	});

	it('keeps all three supported heading levels distinct', () => {
		expect(parseRichText('# h1\n## h2\n### h3').map((block) => block.type)).toEqual([
			'h1',
			'h2',
			'h3',
		]);
	});

	it('carries inline marks on the runs', () => {
		const [block] = parseRichText('**ふとい**と*ななめ*と~~とりけし~~と`コード`');
		const runs = 'runs' in block ? block.runs : [];
		expect(runs.filter((run) => run.marks.includes('bold')).map((run) => run.text)).toEqual([
			'ふとい',
		]);
		expect(runs.filter((run) => run.marks.includes('italic')).map((run) => run.text)).toEqual([
			'ななめ',
		]);
		expect(runs.filter((run) => run.marks.includes('strike')).map((run) => run.text)).toEqual([
			'とりけし',
		]);
		expect(runs.filter((run) => run.marks.includes('code')).map((run) => run.text)).toEqual([
			'コード',
		]);
		// 記法マーカーは本文から落ちる。
		expect(flatten(runs)).toBe('ふといとななめととりけしとコード');
	});

	it('turns a link facet into an href run', () => {
		const parsed = parsePostText('見て https://example.com/a');
		const [block] = parseRichText(parsed.text, parsed.facets);
		const runs = 'runs' in block ? block.runs : [];
		const linked = runs.find((run) => run.href);
		expect(linked?.text).toBe('https://example.com/a');
		expect(linked?.href).toBe('https://example.com/a');
		expect(linked?.external).toBe(true);
	});

	it('links a mention to an internal profile path', () => {
		const source = '@alice.test さん';
		const parsed = parsePostText(source, [
			{ start: 0, end: '@alice.test'.length, did: 'did:plc:alice', handle: 'alice.test' },
		]);
		const [block] = parseRichText(parsed.text, parsed.facets);
		const runs = 'runs' in block ? block.runs : [];
		const linked = runs.find((run) => run.href);
		expect(linked?.href).toBe(`/profile/${encodeURIComponent('did:plc:alice')}`);
		expect(linked?.external).toBe(false);
	});

	it('refuses to link a facet whose uri is not http(s)', () => {
		// javascript: を href にしないことは、他人の投稿を描画するうえでの前提。
		const [block] = parseRichText('あぶない', [
			{
				index: { byteStart: 0, byteEnd: 12 },
				features: [{ $type: 'app.bsky.richtext.facet#link', uri: 'javascript:alert(1)' }],
			},
		]);
		const runs = 'runs' in block ? block.runs : [];
		expect(runs.every((run) => !run.href)).toBe(true);
	});

	it('marks the content warning range on the runs', () => {
		const [block] = parseRichText('まえ 隠す あと', [], { start: 3, end: 5 });
		const runs = 'runs' in block ? block.runs : [];
		expect(
			runs
				.filter((run) => run.contentWarning)
				.map((run) => run.text)
				.join(''),
		).toBe('隠す');
	});

	it('turns blank lines between blocks into a gap instead of paragraph text', () => {
		const blocks = parseRichText('やること\n- 洗濯\n- 買い物\n\n終わったら散歩\n\n\n# 次');
		expect(blocks.map((block) => [block.type, block.gap])).toEqual([
			['p', undefined],
			['ul', undefined],
			['p', 1],
			['h1', 2],
		]);
		const paragraph = blocks[2];
		expect('runs' in paragraph && flatten(paragraph.runs)).toBe('終わったら散歩');
	});

	it('keeps blank lines inside a paragraph as text', () => {
		const [block] = parseRichText('一行目\n\n三行目');
		expect(block.gap).toBeUndefined();
		expect('runs' in block && flatten(block.runs)).toBe('一行目\n\n三行目');
	});

	it('does not add a gap before the first block', () => {
		expect(parseRichText('\n\n- a')[0].gap).toBeUndefined();
	});
});

describe('annotateMarkdownSource', () => {
	it('keeps syntax characters in place and marks the rest', () => {
		const source = '## 見出し\n**太字**と~~消し~~\n- 項目';
		const { lines, marks } = annotateMarkdownSource(source);
		expect(lines).toEqual(['h2', 'p', 'ul']);
		const at = (text: string) => marks[source.indexOf(text)];
		expect(at('## ')).toBeNull();
		expect(at('見出し')).toEqual([]);
		expect(at('**')).toBeNull();
		expect(at('太字')).toEqual(['bold']);
		expect(at('消し')).toEqual(['strike']);
		expect(at('- ')).toBeNull();
		expect(at('項目')).toEqual([]);
	});

	it('leaves blank lines between blocks without a block kind', () => {
		expect(annotateMarkdownSource('a\n\n- b').lines).toEqual(['p', undefined, 'ul']);
	});
});
