import type { BluemojiFacetFormats, EmojiView, Facet } from '$lib/api/types';
import { cardLineUrl, httpUrl, IMAGE_LINE } from './facets';
import { decorateSiblingUrl } from '$lib/sso/links';
import { isInternalUrl, toInternalPath } from '$lib/utils/url';

export type Mark = 'bold' | 'italic' | 'strike' | 'code';
export type InlineRun = {
	text: string;
	marks: Mark[];
	href?: string;
	external?: boolean;
	contentWarning?: boolean;
	contentWarningStart?: boolean;
	bluemoji?: EmojiView;
};
/** gap は直前のブロックとの間にあった空行の数（無ければ省略）。 */
export type Block = { gap?: number } & (
	| { type: 'p' | 'h1' | 'h2' | 'h3' | 'quote'; runs: InlineRun[] }
	| { type: 'ul'; items: InlineRun[][] }
	| { type: 'ol'; items: InlineRun[][]; start: number }
	/** フェンス（``` / ~~~）で囲んだコード。中身は記法もリンクも解釈しない。 */
	| { type: 'code'; text: string; lang?: string }
	/** 水平線。data-block^='h' の見出し用 CSS に掛からないよう hr ではなく rule と呼ぶ。 */
	| { type: 'rule' }
	/**
	 * 1行だけの画像（`![alt](https://…)`）。描画側が投稿の添付画像と照合して出すので、
	 * ここでは URL を検証せず受け取るだけにする。
	 */
	| { type: 'image'; alt: string; url: string }
	/**
	 * URL だけの行（記事本文のリンクカード位置）。parseRichText に cardLines を渡したときだけ作る。
	 * url はカードの照合キー。カードが無いときに段落として出せるよう runs も持つ。
	 */
	| { type: 'card'; url: string; runs: InlineRun[] }
);

type FacetRange = {
	start: number;
	end: number;
	href?: string;
	external: boolean;
	bluemoji?: EmojiView;
};
/** 元テキストの文字位置を保持したブロック本文。map[i] は text[i] の元位置（-1 は挿入した改行）。 */
type Piece = { text: string; map: number[] };

const decoder = new TextDecoder();
const ESCAPABLE = new Set(['\\', '*', '_', '~', '`', '#', '>', '-', '[', ']', '(', ')', '|']);
const isSpace = (value: string | undefined) => value === undefined || /\s/.test(value);
const isWord = (value: string | undefined) => value !== undefined && /[\p{L}\p{N}]/u.test(value);

/**
 * facet のバイト範囲を文字インデックスへ変換する。RichText が持っていた検証をそのまま踏襲し、
 * 重なり・範囲外を捨て、http(s) 以外の URI はリンクにしない（javascript: の実行を防ぐ）。
 */
function facetRanges(text: string, facets: Facet[], absoluteOrigin?: string): FacetRange[] {
	const bytes = new TextEncoder().encode(text);
	const ranges: FacetRange[] = [];
	let offset = 0;
	for (const facet of [...facets].sort((a, b) => a.index.byteStart - b.index.byteStart)) {
		const bluemoji = facet.features.find((item) => {
			if (typeof item !== 'object' || item === null) return false;
			return (item as { $type?: unknown }).$type === 'com.suibari.nagi.richtext#bluemoji';
		}) as
			| {
					ref?: { uri?: unknown; cid?: unknown };
					did?: unknown;
					name?: unknown;
					alt?: unknown;
					mediaType?: unknown;
			  }
			| undefined;
		const feature = facet.features.find((item) => {
			if (typeof item !== 'object' || item === null) return false;
			const candidate = item as { $type?: unknown; uri?: unknown; did?: unknown; tag?: unknown };
			return (
				(candidate.$type === 'app.bsky.richtext.facet#link' && typeof candidate.uri === 'string') ||
				(candidate.$type === 'app.bsky.richtext.facet#mention' &&
					typeof candidate.did === 'string') ||
				(candidate.$type === 'app.bsky.richtext.facet#tag' && typeof candidate.tag === 'string')
			);
		}) as { $type: string; uri?: string; did?: string; tag?: string } | undefined;
		const start = facet.index.byteStart;
		const end = facet.index.byteEnd;
		const validBluemoji =
			typeof bluemoji?.ref?.uri === 'string' &&
			typeof bluemoji.ref.cid === 'string' &&
			typeof bluemoji.did === 'string' &&
			typeof bluemoji.name === 'string' &&
			typeof bluemoji.mediaType === 'string';
		if ((!feature && !validBluemoji) || start < offset || end <= start || end > bytes.length)
			continue;
		if (absoluteOrigin) {
			// 外へ書き出す用。閲覧者ごとの装飾も内部パス化もせず、公開オリジンの絶対 URL にする。
			const href =
				feature?.$type === 'app.bsky.richtext.facet#mention' && feature.did
					? `${absoluteOrigin}/profile/${encodeURIComponent(feature.did)}`
					: feature?.$type === 'app.bsky.richtext.facet#tag' && feature.tag
						? `${absoluteOrigin}/search?tag=${encodeURIComponent(feature.tag.toLowerCase())}`
						: feature?.uri
							? httpUrl(feature.uri)
							: undefined;
			// カスタム絵文字は書き出し先で描けないので、元の文字列（:name:）のまま残す。
			if (!href) continue;
			ranges.push({
				start: decoder.decode(bytes.slice(0, start)).length,
				end: decoder.decode(bytes.slice(0, end)).length,
				href,
				external: true,
			});
			offset = end;
			continue;
		}
		const rawHref =
			feature?.$type === 'app.bsky.richtext.facet#mention' && feature.did
				? `/profile/${encodeURIComponent(feature.did)}`
				: feature?.$type === 'app.bsky.richtext.facet#tag' && feature.tag
					? `/search?tag=${encodeURIComponent(feature.tag.toLowerCase())}`
					: feature?.uri
						? decorateSiblingUrl(httpUrl(feature.uri))
						: undefined;
		const isInternal = isInternalUrl(rawHref);
		const href = isInternal ? toInternalPath(rawHref) : rawHref;
		let emoji: EmojiView | undefined;
		if (validBluemoji) {
			const rkey = (bluemoji!.ref!.uri as string).split('/').pop();
			const official = facet.features.find(
				(item) =>
					typeof item === 'object' &&
					item !== null &&
					(item as { $type?: unknown }).$type === 'blue.moji.richtext.facet',
			) as { formats?: BluemojiFacetFormats } | undefined;
			if (rkey)
				emoji = {
					uri: bluemoji!.ref!.uri as string,
					cid: bluemoji!.ref!.cid as string,
					did: bluemoji!.did as string,
					name: bluemoji!.name as string,
					alt: typeof bluemoji!.alt === 'string' ? bluemoji!.alt : undefined,
					mediaType: bluemoji!.mediaType as EmojiView['mediaType'],
					url: `/api/emoji-asset/${encodeURIComponent(bluemoji!.did as string)}/${encodeURIComponent(rkey)}/${encodeURIComponent(bluemoji!.ref!.cid as string)}`,
					...(official?.formats ? { formats: official.formats } : {}),
				};
		}
		ranges.push({
			start: decoder.decode(bytes.slice(0, start)).length,
			end: decoder.decode(bytes.slice(0, end)).length,
			href,
			external: feature?.$type === 'app.bsky.richtext.facet#link' && !isInternal,
			...(emoji ? { bluemoji: emoji } : {}),
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
	ranges: FacetRange[],
	contentWarning?: { start: number; end: number },
) {
	// marks 配列の参照を共有し、同一装飾かつ同一リンクの連続文字を 1 つの run にまとめる
	const list = [...marks];
	for (let i = from; i < to; i++) {
		const source = piece.map[i];
		const range =
			source >= 0 ? ranges.find((item) => source >= item.start && source < item.end) : undefined;
		const last = out[out.length - 1];
		const warning = Boolean(
			contentWarning && source >= contentWarning.start && source < contentWarning.end,
		);
		if (range?.bluemoji && source === range.start) {
			let next = i + 1;
			while (next < to && piece.map[next] >= range.start && piece.map[next] < range.end) next++;
			out.push({
				text: piece.text.slice(i, next),
				marks: list,
				bluemoji: range.bluemoji,
				...(warning ? { contentWarning: true } : {}),
			});
			i = next - 1;
			continue;
		}
		if (
			last &&
			!last.bluemoji &&
			last.marks === list &&
			last.href === range?.href &&
			Boolean(last.contentWarning) === warning
		)
			last.text += piece.text[i];
		else
			out.push({
				text: piece.text[i],
				marks: list,
				href: range?.href,
				external: range?.external,
				...(warning
					? { contentWarning: true, contentWarningStart: source === contentWarning?.start }
					: {}),
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

/** 表示される文字の範囲（piece 上の位置）と、その範囲に掛かる装飾を受け取る。 */
type EmitRange = (from: number, to: number, marks: Set<Mark>) => void;

function scanInline(piece: Piece, from: number, to: number, marks: Set<Mark>, emit: EmitRange) {
	const { text } = piece;
	let plain = from;
	const flush = (end: number) => {
		if (end > plain) emit(plain, end, marks);
	};
	let i = from;
	while (i < to) {
		const char = text[i];
		if (char === '\\' && i + 1 < to && ESCAPABLE.has(text[i + 1])) {
			flush(i);
			emit(i + 1, i + 2, marks);
			i += 2;
			plain = i;
			continue;
		}
		if (char === '`' && !marks.has('code')) {
			const close = findClosing(text, i + 1, to, '`');
			if (close !== -1) {
				flush(i);
				// コード内では他の記法を解釈しない
				emit(i + 1, close, new Set<Mark>([...marks, 'code']));
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
					scanInline(piece, i + delim[0].length, close, new Set<Mark>([...marks, delim[1]]), emit);
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

function inlineRuns(
	piece: Piece,
	ranges: FacetRange[],
	contentWarning?: { start: number; end: number },
): InlineRun[] {
	const out: InlineRun[] = [];
	scanInline(piece, 0, piece.text.length, new Set(), (from, to, marks) =>
		pushRuns(out, piece, from, to, marks, ranges, contentWarning),
	);
	// エスケープ等で分断された、装飾もリンクも同じ run を最後にまとめる
	return out.reduce<InlineRun[]>((merged, run) => {
		const last = merged[merged.length - 1];
		if (
			last &&
			!last.bluemoji &&
			!run.bluemoji &&
			last.href === run.href &&
			Boolean(last.contentWarning) === Boolean(run.contentWarning) &&
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
const FENCE = /^ {0,3}(`{3,}|~{3,})[ \t]*([^`\s]*)[ \t]*$/;
const RULE = /^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/;
export { IMAGE_LINE };

/** 段落を打ち切って新しいブロックを始める行か。 */
const startsBlock = (text: string) =>
	HEADING.test(text) ||
	QUOTE.test(text) ||
	RULE.test(text) ||
	BULLET.test(text) ||
	ORDERED.test(text) ||
	FENCE.test(text) ||
	IMAGE_LINE.test(text);

type LineRange = { start: number; end: number };
/**
 * 行単位で切り出したブロック。body / items は記法マーカーを除いた本文の範囲。
 * gap は直前のブロックとの間にあった空行の数で、表示ではその行数ぶんの余白にする。
 */
type SourceBlock = { gap: number } & (
	| { type: 'p' | 'h1' | 'h2' | 'h3' | 'quote'; body: LineRange[] }
	| { type: 'ul'; items: LineRange[] }
	| { type: 'ol'; items: LineRange[]; start: number }
	/** fences は開き・閉じのフェンス行（閉じが無ければ開きだけ）。 */
	| { type: 'code'; body: LineRange[]; fences: LineRange[]; lang?: string }
	| { type: 'rule'; line: LineRange }
	/** alt は ![ と ] の間の範囲。 */
	| { type: 'image'; line: LineRange; alt: LineRange; url: string }
	| { type: 'card'; line: LineRange; url: string }
);

const isBlank = (line: string) => !line.trim();

function splitBlocks(source: string, cardLines = false): SourceBlock[] {
	const lines: LineRange[] = [];
	for (let offset = 0; offset <= source.length;) {
		const next = source.indexOf('\n', offset);
		const end = next === -1 ? source.length : next;
		lines.push({ start: offset, end });
		if (next === -1) break;
		offset = next + 1;
	}

	const blocks: SourceBlock[] = [];
	// ブロックの境目にある空行は段落へ含めず、次のブロックの gap として数える。
	// 段落に含めると pre-wrap の空行とブロック間の余白が二重になり、
	// 箇条書きの直後だけ間が大きく空いてしまう。
	let gap = 0;
	for (let index = 0; index < lines.length;) {
		const line = lines[index];
		const raw = source.slice(line.start, line.end);

		if (isBlank(raw)) {
			gap++;
			index++;
			continue;
		}

		const fence = FENCE.exec(raw);
		if (fence) {
			// CommonMark と同じく、閉じフェンスが無ければ文書の終わりまでをコードにする。
			const marker = fence[1];
			const close = new RegExp(
				`^ {0,3}${marker[0] === '`' ? '`' : '~'}{${marker.length},}[ \\t]*$`,
			);
			const body: LineRange[] = [];
			const fences: LineRange[] = [line];
			index++;
			while (index < lines.length) {
				const current = lines[index];
				index++;
				if (close.test(source.slice(current.start, current.end))) {
					fences.push(current);
					break;
				}
				body.push(current);
			}
			blocks.push({ type: 'code', body, fences, ...(fence[2] ? { lang: fence[2] } : {}), gap });
			gap = 0;
			continue;
		}

		if (RULE.test(raw)) {
			blocks.push({ type: 'rule', line, gap });
			gap = 0;
			index++;
			continue;
		}

		const image = IMAGE_LINE.exec(raw);
		if (image) {
			blocks.push({
				type: 'image',
				line,
				alt: { start: line.start + 2, end: line.start + 2 + image[1].length },
				url: image[2],
				gap,
			});
			gap = 0;
			index++;
			continue;
		}

		const card = cardLines ? cardLineUrl(raw) : undefined;
		if (card) {
			blocks.push({ type: 'card', line, url: card, gap });
			gap = 0;
			index++;
			continue;
		}

		const heading = HEADING.exec(raw);
		if (heading) {
			blocks.push({
				type: `h${heading[1].length}` as 'h1' | 'h2' | 'h3',
				body: [{ start: line.start + heading[0].length, end: line.end }],
				gap,
			});
			gap = 0;
			index++;
			continue;
		}

		if (QUOTE.test(raw)) {
			const body: LineRange[] = [];
			while (index < lines.length) {
				const current = lines[index];
				const marker = QUOTE.exec(source.slice(current.start, current.end));
				if (!marker) break;
				body.push({ start: current.start + marker[0].length, end: current.end });
				index++;
			}
			blocks.push({ type: 'quote', body, gap });
			gap = 0;
			continue;
		}

		const bullet = BULLET.exec(raw);
		const ordered = ORDERED.exec(raw);
		if (bullet || ordered) {
			const items: LineRange[] = [];
			const pattern = bullet ? BULLET : ORDERED;
			while (index < lines.length) {
				const current = lines[index];
				const marker = pattern.exec(source.slice(current.start, current.end));
				if (!marker) break;
				items.push({ start: current.start + marker[0].length, end: current.end });
				index++;
			}
			if (ordered) blocks.push({ type: 'ol', items, start: Number(ordered[1]), gap });
			else blocks.push({ type: 'ul', items, gap });
			gap = 0;
			continue;
		}

		// それ以外はブロック記法が現れるまでを 1 段落にまとめ、改行は pre-wrap に任せる
		const body: LineRange[] = [];
		while (index < lines.length) {
			const current = lines[index];
			const text = source.slice(current.start, current.end);
			if (body.length && (startsBlock(text) || (cardLines && cardLineUrl(text)))) break;
			body.push(current);
			index++;
		}
		// 段落末尾の空行は次のブロックとの間の余白として扱う
		let trailing = 0;
		while (body.length > 1 && isBlank(source.slice(body.at(-1)!.start, body.at(-1)!.end))) {
			body.pop();
			trailing++;
		}
		blocks.push({ type: 'p', body, gap });
		gap = trailing;
	}
	return blocks;
}

export function parseRichText(
	source: string,
	facets: Facet[] = [],
	contentWarning?: { start: number; end: number },
	options: {
		/** 指定すると、リンクをこのオリジン基準の装飾なし絶対 URL で返す（commonmark 書き出し用）。 */
		absoluteOrigin?: string;
		/**
		 * URL だけの行を card ブロックにする（記事本文用）。
		 * 通常の投稿では段落の区切り方を変えないよう、既定では切り出さない。
		 */
		cardLines?: boolean;
	} = {},
): Block[] {
	const ranges = facetRanges(source, facets, options.absoluteOrigin);
	const runs = (list: LineRange[]) => inlineRuns(toPiece(source, list), ranges, contentWarning);

	const blocks: Block[] = [];
	// 表示されないブロック（中身が空の段落など）の余白は、次に表示するブロックへ持ち越す
	let carried = 0;
	for (const block of splitBlocks(source, options.cardLines)) {
		const gap = carried + block.gap;
		const parsed: Block =
			block.type === 'ul'
				? { type: 'ul', items: block.items.map((item) => runs([item])) }
				: block.type === 'ol'
					? { type: 'ol', items: block.items.map((item) => runs([item])), start: block.start }
					: block.type === 'code'
						? {
								type: 'code',
								text: block.body.map((line) => source.slice(line.start, line.end)).join('\n'),
								...(block.lang ? { lang: block.lang } : {}),
							}
						: block.type === 'rule'
							? { type: 'rule' }
							: block.type === 'image'
								? {
										type: 'image',
										alt: source.slice(block.alt.start, block.alt.end),
										url: block.url,
									}
								: block.type === 'card'
									? { type: 'card', url: block.url, runs: runs([block.line]) }
									: { type: block.type, runs: runs(block.body) };
		if ('runs' in parsed ? !parsed.runs.length : 'items' in parsed && !parsed.items.length) {
			carried = gap;
			continue;
		}
		carried = 0;
		// 先頭のブロックの前の空行は余白にしない
		if (gap && blocks.length) parsed.gap = gap;
		blocks.push(parsed);
	}

	let foundWarning = false;
	for (const block of blocks) {
		const lists = 'runs' in block ? [block.runs] : 'items' in block ? block.items : [];
		for (const list of lists) {
			for (const run of list) {
				if (!run.contentWarning) continue;
				run.contentWarningStart = !foundWarning;
				foundWarning = true;
			}
		}
	}
	return blocks;
}

/**
 * 入力欄をその場で装飾するための注釈。parseRichText と同じ規則で解析し、記法の文字を
 * 消さずに位置を残す。
 * - lines: 各行のブロック種別（ブロックの境目の空行は undefined）
 * - marks: 各文字に掛かる装飾。null は表示で消える記法の文字（`**` や `## ` など）
 */
export type MarkdownSourceAnnotation = {
	lines: Array<Block['type'] | undefined>;
	marks: Array<Mark[] | null>;
};

export function annotateMarkdownSource(source: string): MarkdownSourceAnnotation {
	const marks: Array<Mark[] | null> = new Array(source.length).fill(null);
	const lineOf: number[] = [];
	let lineCount = 1;
	for (let i = 0; i < source.length; i++) {
		lineOf.push(lineCount - 1);
		if (source[i] === '\n') lineCount++;
	}
	const lines: Array<Block['type'] | undefined> = new Array(lineCount).fill(undefined);
	for (const block of splitBlocks(source)) {
		if (block.type === 'code') {
			// フェンス行は記法、中身はコードとして色を付ける。
			for (const range of [...block.fences, ...block.body])
				lines[lineOf[range.start] ?? lineCount - 1] = 'code';
			for (const range of block.body)
				for (let i = range.start; i < range.end; i++) marks[i] = ['code'];
			continue;
		}
		if (block.type === 'rule' || block.type === 'image') {
			lines[lineOf[block.line.start] ?? lineCount - 1] = block.type;
			if (block.type === 'image')
				for (let i = block.alt.start; i < block.alt.end; i++) marks[i] = [];
			continue;
		}
		const groups =
			'body' in block
				? [block.body]
				: 'items' in block
					? block.items.map((item) => [item])
					: [[block.line]];
		for (const group of groups) {
			for (const range of group) lines[lineOf[range.start] ?? lineCount - 1] = block.type;
			const piece = toPiece(source, group);
			scanInline(piece, 0, piece.text.length, new Set(), (from, to, active) => {
				const list = [...active];
				for (let i = from; i < to; i++) if (piece.map[i] >= 0) marks[piece.map[i]] = list;
			});
		}
	}
	return { lines, marks };
}

/**
 * 本文の先頭が `# 見出し` ならタイトルとして取り出す。
 * standard.site の document.title は必須なので、これが無いときは投稿側で入力を促す。
 */
export function extractTitle(source: string): string | undefined {
	const first = parseRichText(source)[0];
	if (!first || first.type !== 'h1') return undefined;
	const title = first.runs
		.map((run) => run.text)
		.join('')
		.trim();
	return title || undefined;
}

/**
 * 記事本文で、行の位置にリンクカードを置く URL（URL だけの行）を本文順に返す。
 * コードブロックの中の URL は含めない。
 */
export function articleCardUrls(source: string): string[] {
	const urls: string[] = [];
	for (const block of articleEmbedLines(source))
		if (block.type === 'card' && !urls.includes(block.url)) urls.push(block.url);
	return urls;
}

/**
 * 記事本文で、行の位置に埋め込みを出す行（URL だけの行と `![alt](url)` の行）を本文順に返す。
 * start / end はその行の先頭・末尾の文字位置。入力欄で行の下にカードや画像を重ねて見せるのに使う。
 * コードブロックの中の行は含めない。
 */
export function articleEmbedLines(
	source: string,
): Array<{ type: 'card' | 'image'; start: number; end: number; url: string }> {
	const lines: Array<{ type: 'card' | 'image'; start: number; end: number; url: string }> = [];
	for (const block of splitBlocks(source, true))
		if (block.type === 'card' || block.type === 'image')
			lines.push({
				type: block.type,
				start: block.line.start,
				end: block.line.end,
				url: block.url,
			});
	return lines;
}

/** 通知の 1 行プレビュー向けに、記法マーカーを落とした素のテキストを返す。 */
export function stripMarkdown(source: string): string {
	const flatten = (runs: InlineRun[]) => runs.map((run) => run.text).join('');
	return parseRichText(source)
		.map((block) =>
			'runs' in block
				? flatten(block.runs)
				: 'items' in block
					? block.items.map(flatten).join(' ')
					: block.type === 'code'
						? block.text
						: '',
		)
		.join(' ')
		.replace(/\s+/g, ' ')
		.trim();
}
