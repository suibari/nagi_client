import type { Facet } from '$lib/api/types';
import { httpUrl } from './facets';

export type Mark = 'bold' | 'italic' | 'strike' | 'code';
export type InlineRun = { text: string; marks: Mark[]; href?: string; external?: boolean };
export type Block =
	| { type: 'p' | 'h1' | 'h2' | 'h3' | 'quote'; runs: InlineRun[] }
	| { type: 'ul'; items: InlineRun[][] }
	| { type: 'ol'; items: InlineRun[][]; start: number };

type LinkRange = { start: number; end: number; href?: string; external: boolean };
/** 元テキストの文字位置を保持したブロック本文。map[i] は text[i] の元位置（-1 は挿入した改行）。 */
type Piece = { text: string; map: number[] };

const decoder = new TextDecoder();
const ESCAPABLE = new Set(['\\', '*', '_', '~', '`', '#', '>', '-', '[', ']', '(', ')']);
const isSpace = (value: string | undefined) => value === undefined || /\s/.test(value);
const isWord = (value: string | undefined) => value !== undefined && /[\p{L}\p{N}]/u.test(value);

/**
 * facet のバイト範囲を文字インデックスへ変換する。RichText が持っていた検証をそのまま踏襲し、
 * 重なり・範囲外を捨て、http(s) 以外の URI はリンクにしない（javascript: の実行を防ぐ）。
 */
function linkRanges(text: string, facets: Facet[]): LinkRange[] {
	const bytes = new TextEncoder().encode(text);
	const ranges: LinkRange[] = [];
	let offset = 0;
	for (const facet of [...facets].sort((a, b) => a.index.byteStart - b.index.byteStart)) {
		const feature = facet.features.find((item) => {
			if (typeof item !== 'object' || item === null) return false;
			const candidate = item as { $type?: unknown; uri?: unknown; did?: unknown };
			return (
				(candidate.$type === 'app.bsky.richtext.facet#link' && typeof candidate.uri === 'string') ||
				(candidate.$type === 'app.bsky.richtext.facet#mention' && typeof candidate.did === 'string')
			);
		}) as { $type: string; uri?: string; did?: string } | undefined;
		const start = facet.index.byteStart;
		const end = facet.index.byteEnd;
		if (!feature || start < offset || end <= start || end > bytes.length) continue;
		const href =
			feature.$type === 'app.bsky.richtext.facet#mention' && feature.did
				? `/profile/${encodeURIComponent(feature.did)}`
				: feature.uri
					? httpUrl(feature.uri)
					: undefined;
		ranges.push({
			start: decoder.decode(bytes.slice(0, start)).length,
			end: decoder.decode(bytes.slice(0, end)).length,
			href,
			external: feature.$type === 'app.bsky.richtext.facet#link',
		});
		offset = end;
	}
	return ranges;
}

function pushRuns(
	out: InlineRun[],
	piece: Piece,
	from: number,
	to: number,
	marks: Set<Mark>,
	ranges: LinkRange[],
) {
	// marks 配列の参照を共有し、同一装飾かつ同一リンクの連続文字を 1 つの run にまとめる
	const list = [...marks];
	for (let i = from; i < to; i++) {
		const source = piece.map[i];
		const range =
			source >= 0 ? ranges.find((item) => source >= item.start && source < item.end) : undefined;
		const last = out[out.length - 1];
		if (last && last.marks === list && last.href === range?.href) last.text += piece.text[i];
		else
			out.push({
				text: piece.text[i],
				marks: list,
				href: range?.href,
				external: range?.external,
			});
	}
}

/** 閉じデリミタを探す。空の内容と、空白に隣接する（＝装飾意図でない）閉じ記号は無視する。 */
function findClosing(text: string, from: number, to: number, delim: string) {
	for (let i = from; i + delim.length <= to; i++) {
		if (text[i] === '\\') {
			i++;
			continue;
		}
		if (delim === '*' && text.startsWith('**', i)) {
			i++;
			continue;
		}
		if (!text.startsWith(delim, i) || i === from) continue;
		if (isSpace(text[i - 1])) continue;
		if (delim === '_' && isWord(text[i + 1])) continue;
		return i;
	}
	return -1;
}

function scanInline(
	piece: Piece,
	from: number,
	to: number,
	marks: Set<Mark>,
	ranges: LinkRange[],
	out: InlineRun[],
) {
	const { text } = piece;
	let plain = from;
	const flush = (end: number) => {
		if (end > plain) pushRuns(out, piece, plain, end, marks, ranges);
	};
	let i = from;
	while (i < to) {
		const char = text[i];
		if (char === '\\' && i + 1 < to && ESCAPABLE.has(text[i + 1])) {
			flush(i);
			pushRuns(out, piece, i + 1, i + 2, marks, ranges);
			i += 2;
			plain = i;
			continue;
		}
		if (char === '`' && !marks.has('code')) {
			const close = findClosing(text, i + 1, to, '`');
			if (close !== -1) {
				flush(i);
				// コード内では他の記法を解釈しない
				pushRuns(out, piece, i + 1, close, new Set<Mark>([...marks, 'code']), ranges);
				i = close + 1;
				plain = i;
				continue;
			}
		}
		if (!marks.has('code')) {
			const delim =
				char === '*' && text[i + 1] === '*'
					? (['**', 'bold'] as const)
					: char === '~' && text[i + 1] === '~'
						? (['~~', 'strike'] as const)
						: char === '*' || char === '_'
							? ([char, 'italic'] as const)
							: undefined;
			const opens =
				delim &&
				!marks.has(delim[1]) &&
				!isSpace(text[i + delim[0].length]) &&
				(delim[0] !== '_' || !isWord(text[i - 1]));
			if (opens) {
				const close = findClosing(text, i + delim[0].length, to, delim[0]);
				if (close !== -1) {
					flush(i);
					scanInline(
						piece,
						i + delim[0].length,
						close,
						new Set<Mark>([...marks, delim[1]]),
						ranges,
						out,
					);
					i = close + delim[0].length;
					plain = i;
					continue;
				}
			}
		}
		i++;
	}
	flush(to);
}

function inlineRuns(piece: Piece, ranges: LinkRange[]): InlineRun[] {
	const out: InlineRun[] = [];
	scanInline(piece, 0, piece.text.length, new Set(), ranges, out);
	// エスケープ等で分断された、装飾もリンクも同じ run を最後にまとめる
	return out.reduce<InlineRun[]>((merged, run) => {
		const last = merged[merged.length - 1];
		if (
			last &&
			last.href === run.href &&
			last.marks.length === run.marks.length &&
			last.marks.every((mark) => run.marks.includes(mark))
		)
			last.text += run.text;
		else merged.push({ ...run, marks: [...run.marks] });
		return merged;
	}, []);
}

/** 行の範囲（元テキストの文字位置）をつないで 1 つのブロック本文にする。 */
function toPiece(source: string, lines: Array<{ start: number; end: number }>): Piece {
	let text = '';
	const map: number[] = [];
	for (const [index, line] of lines.entries()) {
		if (index > 0) {
			text += '\n';
			map.push(-1);
		}
		for (let i = line.start; i < line.end; i++) {
			text += source[i];
			map.push(i);
		}
	}
	return { text, map };
}

const HEADING = /^(#{1,3})[ \t]+(?=\S)/;
const QUOTE = /^>[ \t]?/;
const BULLET = /^[-*][ \t]+(?=\S)/;
const ORDERED = /^(\d{1,9})[.)][ \t]+(?=\S)/;

export function parseRichText(source: string, facets: Facet[] = []): Block[] {
	const ranges = linkRanges(source, facets);
	const blocks: Block[] = [];
	const lines: Array<{ start: number; end: number }> = [];
	for (let offset = 0; offset <= source.length;) {
		const next = source.indexOf('\n', offset);
		const end = next === -1 ? source.length : next;
		lines.push({ start: offset, end });
		if (next === -1) break;
		offset = next + 1;
	}

	const runs = (list: Array<{ start: number; end: number }>) =>
		inlineRuns(toPiece(source, list), ranges);

	for (let index = 0; index < lines.length;) {
		const line = lines[index];
		const raw = source.slice(line.start, line.end);

		const heading = HEADING.exec(raw);
		if (heading) {
			blocks.push({
				type: `h${heading[1].length}` as 'h1' | 'h2' | 'h3',
				runs: runs([{ start: line.start + heading[0].length, end: line.end }]),
			});
			index++;
			continue;
		}

		if (QUOTE.test(raw)) {
			const body: Array<{ start: number; end: number }> = [];
			while (index < lines.length) {
				const current = lines[index];
				const marker = QUOTE.exec(source.slice(current.start, current.end));
				if (!marker) break;
				body.push({ start: current.start + marker[0].length, end: current.end });
				index++;
			}
			blocks.push({ type: 'quote', runs: runs(body) });
			continue;
		}

		const bullet = BULLET.exec(raw);
		const ordered = ORDERED.exec(raw);
		if (bullet || ordered) {
			const items: InlineRun[][] = [];
			const pattern = bullet ? BULLET : ORDERED;
			while (index < lines.length) {
				const current = lines[index];
				const marker = pattern.exec(source.slice(current.start, current.end));
				if (!marker) break;
				items.push(runs([{ start: current.start + marker[0].length, end: current.end }]));
				index++;
			}
			if (ordered) blocks.push({ type: 'ol', items, start: Number(ordered[1]) });
			else blocks.push({ type: 'ul', items });
			continue;
		}

		// それ以外はブロック記法が現れるまでを 1 段落にまとめ、改行は pre-wrap に任せる
		const body: Array<{ start: number; end: number }> = [];
		while (index < lines.length) {
			const current = lines[index];
			const text = source.slice(current.start, current.end);
			if (
				body.length &&
				(HEADING.test(text) || QUOTE.test(text) || BULLET.test(text) || ORDERED.test(text))
			)
				break;
			body.push(current);
			index++;
		}
		blocks.push({ type: 'p', runs: runs(body) });
	}

	return blocks.filter((block) => ('runs' in block ? block.runs.length : block.items.length));
}

/** 通知の 1 行プレビュー向けに、記法マーカーを落とした素のテキストを返す。 */
export function stripMarkdown(source: string): string {
	const flatten = (runs: InlineRun[]) => runs.map((run) => run.text).join('');
	return parseRichText(source)
		.map((block) => ('runs' in block ? flatten(block.runs) : block.items.map(flatten).join(' ')))
		.join(' ')
		.replace(/\s+/g, ' ')
		.trim();
}
