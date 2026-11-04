import { describe, expect, it } from 'vitest';
import {
	annotateMarkdownSource,
	articleCardUrls,
	articleEmbedLines,
	extractTitle,
	parseRichText,
	stripMarkdown,
} from './markdown';
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

describe('article blocks', () => {
	const image = '![猫](https://nagi.suibari.com/api/blob/did:plc:a/bafkrei)';

	it('parses fenced code without interpreting its contents', () => {
		expect(parseRichText('before\n```js\n**not bold**\n\n#x\n```\nafter')).toEqual([
			{ type: 'p', runs: [{ text: 'before', marks: [], href: undefined, external: undefined }] },
			{ type: 'code', text: '**not bold**\n\n#x', lang: 'js' },
			{ type: 'p', runs: [{ text: 'after', marks: [], href: undefined, external: undefined }] },
		]);
		// 閉じフェンスが無ければ最後までコード。
		expect(parseRichText('```\na\nb')).toEqual([{ type: 'code', text: 'a\nb' }]);
	});

	it('parses thematic breaks and single-line images', () => {
		expect(parseRichText(`a\n---\n${image}\n* * *`).map((block) => block.type)).toEqual([
			'p',
			'rule',
			'image',
			'rule',
		]);
		expect(parseRichText(image)[0]).toEqual({
			type: 'image',
			alt: '猫',
			url: 'https://nagi.suibari.com/api/blob/did:plc:a/bafkrei',
		});
		// 行の途中の画像記法や http(s) 以外は画像にしない。
		expect(parseRichText('x ![a](https://e.com/a.png)')[0].type).toBe('p');
		expect(parseRichText('![a](javascript:alert(1))')[0].type).toBe('p');
	});

	it('keeps image syntax raw instead of turning it into a named link', () => {
		const parsed = parsePostText(`text\n${image}`);
		expect(parsed.text).toBe(`text\n${image}`);
		expect(parsed.facets).toEqual([]);
		expect(parsed.cardUrls).toEqual([]);
	});

	it('annotates code, rule and image lines for the composer', () => {
		const { lines, marks } = annotateMarkdownSource('```\nx\n```\n---\n![a](https://e.com/a)');
		expect(lines).toEqual(['code', 'code', 'code', 'rule', 'image']);
		expect(marks[4]).toEqual(['code']);
		expect(marks[0]).toBeNull();
	});

	it('leaves images and rules out of plain text', () => {
		expect(stripMarkdown(`# T\n\n${image}\n---\n\`\`\`\ncode\n\`\`\``)).toBe('T code');
	});
});

describe('article link card lines', () => {
	const url = 'https://example.com/a';
	const source = `前の段落\n${url}\n後ろの段落\n\n文中の ${url} はリンクのまま`;

	it('splits a URL-only line into a card block only when cardLines is on', () => {
		const parsed = parsePostText(source);
		expect(
			parseRichText(parsed.text, parsed.facets, undefined, { cardLines: true }).map(
				(block) => block.type,
			),
		).toEqual(['p', 'card', 'p']);
		const card = parseRichText(parsed.text, parsed.facets, undefined, { cardLines: true })[1];
		expect(card).toMatchObject({ type: 'card', url });
		// カードが無いときは段落として出せるよう、行のリンクも runs に残す。
		expect(card.type === 'card' && card.runs[0]).toMatchObject({ text: url, href: url });
		// 既定（タイムラインなど）では段落の区切り方を変えない。
		expect(parseRichText(parsed.text, parsed.facets).map((block) => block.type)).toEqual(['p']);
	});

	it('lists card URLs in body order without duplicates or URLs inside sentences and code', () => {
		expect(
			articleCardUrls(
				`${url}\n本文 https://example.com/inline\n  https://example.com/b  \n${url}\n\`\`\`\nhttps://example.com/code\n\`\`\``,
			),
		).toEqual([url, 'https://example.com/b']);
	});

	it('does not treat a URL followed by punctuation as a card line', () => {
		expect(articleCardUrls('https://example.com/a。')).toEqual([]);
		expect(articleCardUrls('<https://example.com/a>')).toEqual([]);
	});
});

describe('article embed lines', () => {
	it('returns card and image lines with their line ends, skipping code blocks', () => {
		const image = '![図](https://nagi.suibari.com/api/blob/did:plc:a/bafy)';
		const source = `前\nhttps://example.com/a\n${image}\n\`\`\`\nhttps://example.com/code\n\`\`\``;
		const lines = articleEmbedLines(source);
		expect(lines).toEqual([
			{ type: 'card', end: source.indexOf('\n', 2), url: 'https://example.com/a' },
			{
				type: 'image',
				end: source.indexOf(image) + image.length,
				url: 'https://nagi.suibari.com/api/blob/did:plc:a/bafy',
			},
		]);
		expect(source.slice(0, lines[0].end).endsWith('https://example.com/a')).toBe(true);
	});
});
