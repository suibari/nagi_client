import { parseContentWarning } from '$lib/atproto/contentWarning';
import {
	parsePostText,
	type ChannelSelection,
	type EmojiSelection,
	type MentionSelection,
} from '$lib/atproto/facets';
import { annotateMarkdownSource, type Block } from '$lib/atproto/markdown';

export type HighlightSegment = { text: string; className: string };
export type HighlightLine = { kind?: Block['type']; segments: HighlightSegment[] };

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/** facet のバイト範囲を本文の文字位置へ直す。 */
function charRange(text: string, byteStart: number, byteEnd: number) {
	const bytes = encoder.encode(text);
	return {
		start: decoder.decode(bytes.slice(0, byteStart)).length,
		end: decoder.decode(bytes.slice(0, byteEnd)).length,
	};
}

function facetClass(features: readonly unknown[]) {
	const types = features.map((feature) => (feature as { $type?: unknown }).$type);
	if (types.includes('com.suibari.nagi.richtext#bluemoji')) return 'md-emoji';
	return 'md-link';
}

/**
 * 入力欄の重ね描き用に、入力文字列を行ごとの装飾付き区間へ分ける。
 *
 * 投稿時と同じ parsePostText → parseRichText の規則で判定するので、ここで装飾された
 * 文字は投稿後も同じ装飾で表示される。記法の文字（`**`、`## `、`[`〜`](URL)` など）は
 * 消さずに md-syntax として残し、入力欄の文字位置とキャレットを一致させる。
 */
export function highlightComposerText(
	source: string,
	mentions: MentionSelection[] = [],
	channels: ChannelSelection[] = [],
	emojis: EmojiSelection[] = [],
): HighlightLine[] {
	const parsed = parsePostText(source, mentions, channels, emojis);
	const { marks } = annotateMarkdownSource(parsed.text);
	const textClasses = marks.map((list) =>
		list ? list.map((mark) => `md-${mark}`) : ['md-syntax'],
	);
	for (const facet of parsed.facets) {
		const { start, end } = charRange(parsed.text, facet.index.byteStart, facet.index.byteEnd);
		const className = facetClass(facet.features);
		for (let i = start; i < end; i++) textClasses[i].push(className);
	}

	// 本文へ写らなかった入力の文字（名前付きリンクの括弧と URL）は記法として扱う
	const sourceClasses: string[][] = Array.from({ length: source.length }, () => ['md-syntax']);
	parsed.sourceIndex.forEach((from, index) => (sourceClasses[from] = textClasses[index]));

	const warning = parseContentWarning(source);
	if (warning.status === 'valid') {
		for (let i = warning.markerStart; i < warning.markerEnd + 2; i++) {
			const marker = i < warning.markerStart + 2 || i >= warning.markerEnd;
			sourceClasses[i] = marker ? ['md-syntax'] : [...sourceClasses[i], 'md-cw'];
		}
	}

	const { lines: kinds } = annotateMarkdownSource(source);
	const lines: HighlightLine[] = [];
	let offset = 0;
	for (const [index, line] of source.split('\n').entries()) {
		const segments: HighlightSegment[] = [];
		for (let i = 0; i < line.length; i++) {
			const className = sourceClasses[offset + i].join(' ');
			const last = segments.at(-1);
			if (last?.className === className) last.text += line[i];
			else segments.push({ text: line[i], className });
		}
		lines.push({ kind: kinds[index], segments });
		offset += line.length + 1;
	}
	return lines;
}
