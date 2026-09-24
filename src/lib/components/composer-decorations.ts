import {
	EditorSelection,
	EditorState,
	StateEffect,
	type Extension,
	type Range,
} from '@codemirror/state';
import {
	Decoration,
	EditorView,
	ViewPlugin,
	WidgetType,
	type DecorationSet,
	type ViewUpdate,
} from '@codemirror/view';
import type { ChannelSelection, EmojiSelection, MentionSelection } from '$lib/atproto/facets';
import { highlightComposerText } from '$lib/post/composer-highlight';

export type ComposerSelections = {
	mentions: MentionSelection[];
	channels: ChannelSelection[];
	emojis: EmojiSelection[];
};

/** メンション等の選択範囲だけが変わったとき、装飾を組み直させる。 */
export const refreshDecorations = StateEffect.define<null>();

/** 箇条書きの `- ` を、投稿と同じ「•」に見せる。 */
class BulletWidget extends WidgetType {
	eq() {
		return true;
	}

	toDOM() {
		const bullet = document.createElement('span');
		bullet.className = 'md-bullet';
		bullet.textContent = '•';
		return bullet;
	}
}

const bullet = Decoration.replace({ widget: new BulletWidget() });
const hidden = Decoration.replace({});
const listMarker = Decoration.mark({ class: 'md-list-marker' });
const marks = new Map<string, Decoration>();
const markFor = (className: string) => {
	let mark = marks.get(className);
	if (!mark) marks.set(className, (mark = Decoration.mark({ class: className })));
	return mark;
};

// markdown.ts のブロック判定と同じマーカー。行の種別はそちらで判定済みなので、ここでは長さだけを取る。
const BULLET_MARKER = /^[-*][ \t]+/;
const QUOTE_MARKER = /^>[ \t]?/;
const ORDERED_MARKER = /^\d{1,9}[.)][ \t]+/;
// 本文を書く前の `- ` だけの行。投稿では箇条書きにならないが、入力中は先に「•」を見せる。
const PENDING_BULLET = /^[-*][ \t]+$/;

function build(view: EditorView, selections: ComposerSelections) {
	const doc = view.state.doc;
	const lines = highlightComposerText(
		doc.toString(),
		selections.mentions,
		selections.channels,
		selections.emojis,
	);
	const decorations: Range<Decoration>[] = [];
	const atomic: Range<Decoration>[] = [];
	lines.forEach((line, index) => {
		const { from, text } = doc.line(index + 1);
		const kind = (!line.kind || line.kind === 'p') && PENDING_BULLET.test(text) ? 'ul' : line.kind;
		if (kind) decorations.push(Decoration.line({ attributes: { 'data-block': kind } }).range(from));

		// 箇条書きと引用のマーカーは投稿でも表示されないので、入力欄でも隠して「•」や罫線にする。
		// ひとかたまりで消せるよう atomic にし、Backspace 1 回で普通の行へ戻せるようにする。
		let hiddenLength = 0;
		const marker =
			kind === 'ul'
				? BULLET_MARKER.exec(text)
				: kind === 'quote'
					? QUOTE_MARKER.exec(text)
					: undefined;
		if (marker) {
			const range = (kind === 'ul' ? bullet : hidden).range(from, from + marker[0].length);
			decorations.push(range);
			atomic.push(range);
			hiddenLength = marker[0].length;
		}
		const ordered = kind === 'ol' ? ORDERED_MARKER.exec(text) : undefined;
		if (ordered) decorations.push(listMarker.range(from, from + ordered[0].length));

		let offset = 0;
		for (const segment of line.segments) {
			const start = Math.max(offset, hiddenLength);
			const end = offset + segment.text.length;
			if (segment.className && end > start)
				decorations.push(markFor(segment.className).range(from + start, from + end));
			offset = end;
		}
	});
	return { decorations: Decoration.set(decorations, true), atomic: Decoration.set(atomic, true) };
}

/** 隠している行頭マーカー（`- ` や `> `）の長さ。隠していない行は 0。 */
function hiddenMarkerLength(text: string) {
	return (BULLET_MARKER.exec(text) ?? QUOTE_MARKER.exec(text))?.[0].length ?? 0;
}

/**
 * キャレットを隠したマーカーの手前に置かない。Home やクリックで行頭へ行っても本文の先頭へ寄せ、
 * そこで Backspace を押すとマーカーごと消えて普通の行へ戻る（note と同じ操作感）。
 * 本文の先頭から ← で出るときは、前の行の末尾へ移す。
 */
const keepCaretAfterMarker = EditorState.transactionFilter.of((transaction) => {
	if (!transaction.selection) return transaction;
	const doc = transaction.newDoc;
	const previous = transaction.docChanged ? undefined : transaction.startState.selection.main.head;
	let moved = false;
	const fix = (position: number) => {
		const line = doc.lineAt(position);
		const markerEnd = line.from + hiddenMarkerLength(line.text);
		if (position >= markerEnd) return position;
		moved = true;
		if (previous === markerEnd && line.number > 1) return line.from - 1;
		return markerEnd;
	};
	const ranges = transaction.selection.ranges.map((range) =>
		EditorSelection.range(fix(range.anchor), fix(range.head)),
	);
	if (!moved) return transaction;
	return [
		transaction,
		{
			selection: EditorSelection.create(ranges, transaction.selection.mainIndex),
			sequential: true,
		},
	];
});

/**
 * 入力欄の装飾。投稿時と同じ規則（highlightComposerText）で判定し、見出しの大きさや
 * 箇条書きの「•」まで投稿後の見た目に寄せる。記法の文字は `**` や `## ` のように薄く残す。
 */
export function composerDecorations(selections: () => ComposerSelections): Extension {
	const plugin = ViewPlugin.fromClass(
		class {
			decorations: DecorationSet;
			atomic: DecorationSet;

			constructor(view: EditorView) {
				({ decorations: this.decorations, atomic: this.atomic } = build(view, selections()));
			}

			update(update: ViewUpdate) {
				const refreshed = update.transactions.some((transaction) =>
					transaction.effects.some((effect) => effect.is(refreshDecorations)),
				);
				if (update.docChanged || refreshed)
					({ decorations: this.decorations, atomic: this.atomic } = build(
						update.view,
						selections(),
					));
			}
		},
		{
			decorations: (value) => value.decorations,
			provide: (plugin) =>
				EditorView.atomicRanges.of((view) => view.plugin(plugin)?.atomic ?? Decoration.none),
		},
	);
	return [plugin, keepCaretAfterMarker];
}
