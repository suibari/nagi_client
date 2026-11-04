import {
	Prec,
	RangeSet,
	RangeValue,
	StateEffect,
	StateField,
	type EditorState,
	type Range,
} from '@codemirror/state';
import { Decoration, EditorView, keymap, WidgetType, type DecorationSet } from '@codemirror/view';
import { APPVIEW_URL } from '$lib/api/appview';
import { httpUrl, IMAGE_LINE } from '$lib/atproto/facets';
import { articleEmbedLines } from '$lib/atproto/markdown';
import { blobKey, imageMarkdown, limitAlt } from '$lib/blog/inlineImages';
import { m } from '$lib/i18n/i18n.svelte';

/** 入力欄で URL 行の代わりに見せるリンクカード。LinkCardEditor が取得した内容をそのまま渡す。 */
export type ComposerEmbedCard = {
	uri: string;
	title: string;
	description?: string;
	previewUrl?: string;
	loading?: boolean;
};

/**
 * 記事の入力欄に重ねる埋め込み。cards は URL、images は blob の照合キー（DID/CID）から引く。
 * 渡されていない行（カードを × で消した URL、添付の無い画像行）は記法の文字のまま見せる。
 */
export type ComposerEmbeds = {
	cards: ComposerEmbedCard[];
	/** blobKey → プレビューの URL（手元の Object URL か AppView の URL）。 */
	images: Record<string, string>;
	disabled?: boolean;
	onremovecard?: (uri: string) => void;
};

/**
 * Android では入力欄が素の textarea になり（ComposerInput 参照）、埋め込みを重ねられない。
 * そのときはカードを従来どおり入力欄の下の一覧に出す。
 */
export const usesPlainTextarea = () =>
	typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);

export const setComposerEmbeds = StateEffect.define<ComposerEmbeds | undefined>();

const resolve = (url: string) => (url.startsWith('/') ? APPVIEW_URL + url : url);
const appViewOrigins = () => [new URL(APPVIEW_URL, 'http://localhost').origin];

class CardWidget extends WidgetType {
	constructor(
		readonly card: ComposerEmbedCard,
		readonly disabled: boolean,
		readonly onremove?: (uri: string) => void,
	) {
		super();
	}

	eq(other: CardWidget) {
		const a = this.card;
		const b = other.card;
		return (
			a.uri === b.uri &&
			a.title === b.title &&
			a.description === b.description &&
			a.previewUrl === b.previewUrl &&
			Boolean(a.loading) === Boolean(b.loading) &&
			this.disabled === other.disabled &&
			this.onremove === other.onremove
		);
	}

	toDOM() {
		const wrap = document.createElement('div');
		wrap.className = 'composer-embed composer-embed-card';
		wrap.contentEditable = 'false';
		const article = document.createElement('article');
		article.className = 'link-card-preview';
		if (this.card.loading) article.classList.add('loading');
		if (this.card.previewUrl) {
			const image = document.createElement('img');
			image.src = resolve(this.card.previewUrl);
			image.alt = '';
			article.append(image);
		}
		const body = document.createElement('span');
		const title = document.createElement('strong');
		title.textContent = this.card.title;
		body.append(title);
		if (this.card.description) {
			const description = document.createElement('span');
			description.textContent = this.card.description;
			body.append(description);
		}
		const small = document.createElement('small');
		small.textContent = this.card.loading ? m.linkCardLoading() : this.card.uri;
		body.append(small);
		article.append(body);
		if (this.onremove) {
			const remove = document.createElement('button');
			remove.type = 'button';
			remove.className = 'link-card-remove';
			remove.disabled = this.disabled;
			remove.textContent = '×';
			remove.ariaLabel = m.linkCardRemove();
			remove.title = m.linkCardRemove();
			const onremove = this.onremove;
			const uri = this.card.uri;
			// 入力欄のフォーカスとキャレットを動かさずに消す。
			remove.addEventListener('mousedown', (event) => event.preventDefault());
			remove.addEventListener('click', () => onremove(uri));
			article.append(remove);
		}
		wrap.append(article);
		return wrap;
	}

	ignoreEvent() {
		return true;
	}
}

class ImageWidget extends WidgetType {
	constructor(
		readonly url: string,
		readonly alt: string,
		readonly disabled: boolean,
	) {
		super();
	}

	eq(other: ImageWidget) {
		return this.url === other.url && this.alt === other.alt && this.disabled === other.disabled;
	}

	toDOM(view: EditorView) {
		const wrap = document.createElement('div');
		wrap.className = 'composer-embed composer-embed-image';
		wrap.contentEditable = 'false';
		const frame = document.createElement('div');
		frame.className = 'composer-embed-image-frame';
		const image = document.createElement('img');
		image.src = resolve(this.url);
		image.alt = this.alt;
		frame.append(image);

		// alt は閲覧時に見せる文字ではないので、Bluesky と同じく画像の隅の「ALT」で示して直させる。
		const badge = document.createElement('button');
		badge.type = 'button';
		badge.className = 'composer-embed-alt';
		badge.classList.toggle('filled', Boolean(this.alt));
		badge.disabled = this.disabled;
		badge.textContent = 'ALT';
		badge.ariaLabel = this.alt ? m.postImageAltEdit() : m.postImageAltAdd();
		badge.title = this.alt || m.postImageAltAdd();
		frame.append(badge);
		wrap.append(frame);

		const editor = document.createElement('div');
		editor.className = 'composer-embed-alt-editor';
		editor.hidden = true;
		const label = document.createElement('label');
		const caption = document.createElement('span');
		caption.textContent = m.postImageAltLabel();
		const input = document.createElement('input');
		input.type = 'text';
		input.maxLength = 10000;
		input.placeholder = m.postImageAltPlaceholder();
		label.append(caption, input);
		const actions = document.createElement('div');
		actions.className = 'composer-embed-alt-actions';
		const cancel = document.createElement('button');
		cancel.type = 'button';
		cancel.className = 'ghost';
		cancel.textContent = m.cancel();
		const save = document.createElement('button');
		save.type = 'button';
		save.className = 'primary';
		save.textContent = m.save();
		actions.append(cancel, save);
		editor.append(label, actions);
		wrap.append(editor);

		const close = () => {
			editor.hidden = true;
			badge.hidden = false;
			view.focus();
		};
		const commit = () => {
			// 行の位置は編集のたびに動くので、押した時点の DOM から引き直す。
			const line = view.state.doc.lineAt(view.posAtDOM(wrap));
			const match = IMAGE_LINE.exec(line.text);
			if (match) {
				const next = imageMarkdown(limitAlt(input.value), match[2]);
				if (next !== line.text)
					view.dispatch({
						changes: { from: line.from, to: line.to, insert: next },
						userEvent: 'input',
					});
			}
			close();
		};
		badge.addEventListener('click', () => {
			input.value = this.alt;
			editor.hidden = false;
			badge.hidden = true;
			input.focus();
		});
		input.addEventListener('keydown', (event) => {
			if (event.isComposing) return;
			if (event.key === 'Enter') {
				event.preventDefault();
				commit();
			} else if (event.key === 'Escape') {
				// 投稿画面ごと閉じないよう、ここで止める。
				event.preventDefault();
				event.stopPropagation();
				close();
			}
		});
		cancel.addEventListener('click', close);
		save.addEventListener('click', commit);
		return wrap;
	}

	ignoreEvent() {
		return true;
	}
}

type EmbedState = {
	embeds?: ComposerEmbeds;
	decorations: DecorationSet;
	/** カード・画像に置き換えた行。キャレットはこの中に入らず、1 つの塊として動く。 */
	blocks: RangeSet<RangeValue>;
};

const blockRange = new (class extends RangeValue {})();

function build(doc: string, embeds: ComposerEmbeds | undefined): Omit<EmbedState, 'embeds'> {
	if (!embeds) return { decorations: Decoration.none, blocks: RangeSet.empty };
	const cards = new Map(embeds.cards.map((card) => [httpUrl(card.uri) ?? card.uri, card]));
	const origins = appViewOrigins();
	const decorations: Range<Decoration>[] = [];
	const placed: Range<RangeValue>[] = [];
	for (const line of articleEmbedLines(doc)) {
		if (line.type === 'card') {
			// 閲覧時（RichText の card ブロック）と同じく、カードがある URL 行は行ごとカードにする。
			// カードの無い行（取得前・× で消した URL）は URL の文字のまま見せる。
			const card = cards.get(line.url);
			if (!card) continue;
			const widget = new CardWidget(card, Boolean(embeds.disabled), embeds.onremovecard);
			decorations.push(Decoration.replace({ widget, block: true }).range(line.start, line.end));
			placed.push(blockRange.range(line.start, line.end));
		} else {
			// 画像も閲覧時と同じく、行ごと画像にする。添付の無い行（下書きから戻した本文など）は
			// 記法のまま見せる。
			const key = blobKey(line.url, origins);
			const preview = key ? embeds.images[key] : undefined;
			if (!preview) continue;
			const alt = IMAGE_LINE.exec(doc.slice(line.start, line.end))?.[1] ?? '';
			const widget = new ImageWidget(preview, alt, Boolean(embeds.disabled));
			decorations.push(Decoration.replace({ widget, block: true }).range(line.start, line.end));
			placed.push(blockRange.range(line.start, line.end));
		}
	}
	return { decorations: Decoration.set(decorations, true), blocks: RangeSet.of(placed, true) };
}

/**
 * 記事の入力欄で、カードのある URL だけの行をリンクカードに、画像行を画像に置き換える。
 * 投稿後の記事ページ（RichText の card / image ブロック）と同じ見た目にするためのもの。
 * 画像の alt は画像の「ALT」から直し、本文の `![alt](url)` に書き戻す。
 * ブロックの装飾は ViewPlugin から出せないので StateField で持つ。
 */
const embedField = StateField.define<EmbedState>({
	create: () => ({ decorations: Decoration.none, blocks: RangeSet.empty }),
	update(value, transaction) {
		let embeds = value.embeds;
		let changed = transaction.docChanged;
		for (const effect of transaction.effects)
			if (effect.is(setComposerEmbeds)) {
				embeds = effect.value;
				changed = true;
			}
		if (!changed) return value;
		return { embeds, ...build(transaction.newDoc.toString(), embeds) };
	},
	provide: (field) => [
		EditorView.decorations.from(field, (value) => value.decorations),
		EditorView.atomicRanges.of((view) => view.state.field(field).blocks),
	],
});

/** pos を含むカード・画像の行の範囲。 */
function blockAt(state: EditorState, pos: number): { from: number; to: number } | undefined {
	let found: { from: number; to: number } | undefined;
	state.field(embedField).blocks.between(pos, pos, (from, to) => {
		found = { from, to };
		return false;
	});
	return found;
}

/**
 * カード・画像の行の直後の行頭で Backspace、直前の行末で Delete を押したとき、改行だけを
 * 消すと隣の行がその行に繋がり、カードや画像が崩れて記法の文字に戻ってしまう。行ごと消す。
 */
function deleteBlockLine(forward: boolean) {
	return (view: EditorView) => {
		const { state } = view;
		const selection = state.selection.main;
		if (!selection.empty) return false;
		const line = state.doc.lineAt(selection.head);
		if (forward ? selection.head !== line.to : selection.head !== line.from) return false;
		const neighbour = forward ? line.to + 1 : line.from - 1;
		if (neighbour < 0 || neighbour > state.doc.length) return false;
		const card = blockAt(state, neighbour);
		if (!card) return false;
		// その行と改行（後ろの行に続く側）を消す。
		const from = forward ? card.from - 1 : card.from;
		const to = forward ? card.to : card.to + 1;
		view.dispatch({
			changes: { from: Math.max(0, from), to: Math.min(state.doc.length, to) },
			selection: { anchor: forward ? Math.max(0, from) : card.from },
			userEvent: 'delete',
			scrollIntoView: true,
		});
		return true;
	};
}

export const composerEmbeds = [
	embedField,
	Prec.high(
		keymap.of([
			{ key: 'Backspace', run: deleteBlockLine(false) },
			{ key: 'Delete', run: deleteBlockLine(true) },
		]),
	),
];
