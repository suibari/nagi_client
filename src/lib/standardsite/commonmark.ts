import type { Facet } from '$lib/api/types';
import { parseRichText, type Block, type InlineRun, type Mark } from '$lib/atproto/markdown';

/**
 * Nagi の本文（独自 Markdown + facet）を、standard.site の他のリーダーが同じ見た目で
 * 描ける GFM へ書き出す。
 *
 * Nagi の記法は CommonMark と次の点が違うので、元の文字列をそのまま載せるとずれる。
 * - 段落内の改行をそのまま改行として表示する（CommonMark ではスペースになる）
 * - リンク・メンション・タグは facet で持ち、本文には記法が無い
 * - `<b>` や `+ 項目`、行頭の `####` などは Nagi では文字のまま
 *
 * そこで Nagi のパーサで一度ブロックに分け、そこから組み立て直す。文字はすべて
 * エスケープするので、Nagi で記法として解釈されなかった文字は外でも文字のまま出る。
 */
export function toCommonMark(text: string, facets: Facet[], origin: string): string {
	const blocks = parseRichText(text, facets, undefined, { absoluteOrigin: origin });
	return blocks
		.map(block)
		.filter((value) => value !== '')
		.join('\n\n')
		.concat('\n');
}

function block(value: Block): string {
	switch (value.type) {
		case 'h1':
		case 'h2':
		case 'h3':
			return `${'#'.repeat(Number(value.type[1]))} ${inline(value.runs).replace(/\\\n/g, ' ')}`;
		case 'quote':
			return inline(value.runs)
				.split('\n')
				.map((line) => `> ${line}`)
				.join('\n');
		case 'ul':
			return value.items.map((item) => `- ${listItem(item)}`).join('\n');
		case 'ol':
			return value.items
				.map((item, index) => `${value.start + index}. ${listItem(item)}`)
				.join('\n');
		case 'code': {
			const longest = Math.max(
				2,
				...[...value.text.matchAll(/`+/g)].map((match) => match[0].length),
			);
			const fence = '`'.repeat(longest + 1);
			return `${fence}${value.lang ?? ''}\n${value.text}\n${fence}`;
		}
		case 'rule':
			return '---';
		case 'image':
			return `![${escapeText(value.alt)}](${destination(value.url)})`;
		default:
			return inline(value.runs);
	}
}

/** リストの項目は1行。続き行に見える字下げを作らないよう、改行は空白にする。 */
const listItem = (runs: InlineRun[]) => inline(runs).replace(/\\\n/g, ' ');

/** 同じリンク先の連続した run を1つの [label](url) にまとめて書く。 */
function inline(runs: InlineRun[]): string {
	let out = '';
	for (let index = 0; index < runs.length;) {
		const href = runs[index].href;
		let end = index + 1;
		while (end < runs.length && runs[end].href === href) end++;
		const label = runs
			.slice(index, end)
			.map((run) => decorated(run.text, run.marks))
			.join('');
		out += href ? `[${label}](${destination(href)})` : label;
		index = end;
	}
	return hardBreaks(out);
}

/** 段落内の改行は CommonMark のハード改行（行末の `\`）にする。各行の頭は記法に見えないよう守る。 */
const hardBreaks = (value: string) => value.split('\n').map(guardLineStart).join('\\\n');

const MARK_DELIMITERS: Record<Exclude<Mark, 'code'>, string> = {
	bold: '**',
	italic: '*',
	strike: '~~',
};

function decorated(text: string, marks: readonly Mark[]): string {
	const leading = /^\s*/.exec(text)?.[0] ?? '';
	const trailing = /\s*$/.exec(text.slice(leading.length))?.[0] ?? '';
	const core = text.slice(leading.length, text.length - trailing.length);
	if (!core) return escapeText(text);
	let body = marks.includes('code') ? codeSpan(core) : escapeText(core);
	for (const mark of ['strike', 'italic', 'bold'] as const) {
		if (marks.includes(mark)) body = `${MARK_DELIMITERS[mark]}${body}${MARK_DELIMITERS[mark]}`;
	}
	return `${escapeText(leading)}${body}${escapeText(trailing)}`;
}

function codeSpan(text: string): string {
	const flat = text.replace(/\n/g, ' ');
	const longest = Math.max(0, ...[...flat.matchAll(/`+/g)].map((match) => match[0].length));
	const fence = '`'.repeat(longest + 1);
	const pad = flat.startsWith('`') || flat.endsWith('`') ? ' ' : '';
	return `${fence}${pad}${flat}${pad}${fence}`;
}

/**
 * インラインで意味を持つ ASCII 記号を `\` でエスケープする。`!` は直後の `[` を
 * エスケープすれば画像にならないので触らない。`#` は行頭だけなので guardLineStart で扱う。
 */
const escapeText = (text: string) => text.replace(/[\\`*_[\]<>~|&]/g, (char) => `\\${char}`);

/**
 * 行頭でだけブロック記法になる文字（`#` `-` `+` `=` `1.`）と、
 * 字下げ（4つ以上でコードブロックになる）を無害にする。`>` は escapeText 済み。
 */
function guardLineStart(line: string): string {
	const indent = /^[ \t]+/.exec(line)?.[0] ?? '';
	const rest = line
		.slice(indent.length)
		.replace(/^([-+=#])/, '\\$1')
		.replace(/^(\d+)([.)])/, '$1\\$2');
	return '&#32;'.repeat(indent.length) + rest;
}

/** リンク先に括弧や空白が入っていても壊れないよう、山括弧で囲む。 */
const destination = (url: string) =>
	/[\s()<>]/.test(url) ? `<${url.replace(/[<>\s]/g, encodeURIComponent)}>` : url;
