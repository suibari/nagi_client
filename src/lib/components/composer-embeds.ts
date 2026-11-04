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
import { httpUrl } from '$lib/atproto/facets';
import { articleEmbedLines } from '$lib/atproto/markdown';
import { blobKey } from '$lib/blog/inlineImages';
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
 * 渡されていない行（カードを × で消した URL、添付の無い画像行）は何も出さない。
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
	constructor(readonly url: string) {
		super();
	}

	eq(other: ImageWidget) {
		return this.url === other.url;
	}

	toDOM() {
		const wrap = document.createElement('div');
		wrap.className = 'composer-embed composer-embed-image';
		wrap.contentEditable = 'false';
		const image = document.createElement('img');
		image.src = resolve(this.url);
		image.alt = '';
		wrap.append(image);
		return wrap;
	}

	ignoreEvent() {
		return true;
	}
}

type EmbedState = {
	embeds?: ComposerEmbeds;
	decorations: DecorationSet;
	/** カードに置き換えた行。キャレットはこの中に入らず、1 つの塊として動く。 */
	cards: RangeSet<RangeValue>;
};

const cardRange = new (class extends RangeValue {})();

function build(doc: string, embeds: ComposerEmbeds | undefined): Omit<EmbedState, 'embeds'> {
	if (!embeds) return { decorations: Decoration.none, cards: RangeSet.empty };
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
			placed.push(cardRange.range(line.start, line.end));
		} else {
			const key = blobKey(line.url, origins);
			const preview = key ? embeds.images[key] : undefined;
			if (preview)
				decorations.push(
					Decoration.widget({ widget: new ImageWidget(preview), block: true, side: 1 }).range(
						line.end,
					),
				);
		}
	}
	return { decorations: Decoration.set(decorations, true), cards: RangeSet.of(placed, true) };
}

/**
 * 記事の入力欄で、カードのある URL だけの行をリンクカードに置き換え、画像行の下に画像を出す。
 * 投稿後の記事ページ（RichText の card / image ブロック）と同じ見た目にするためのもの。
 * 画像行は alt を編集できるよう `![alt](url)` を残し、画像は行の下に足すだけにする。
 * ブロックの装飾は ViewPlugin から出せないので StateField で持つ。
 */
const embedField = StateField.define<EmbedState>({
	create: () => ({ decorations: Decoration.none, cards: RangeSet.empty }),
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
		EditorView.atomicRanges.of((view) => view.state.field(field).cards),
	],
});

/** pos を含むカード行の範囲。 */
function cardAt(state: EditorState, pos: number): { from: number; to: number } | undefined {
	let found: { from: number; to: number } | undefined;
	state.field(embedField).cards.between(pos, pos, (from, to) => {
		found = { from, to };
		return false;
	});
	return found;
}

/**
 * カード行の直後の行頭で Backspace、直前の行末で Delete を押したとき、改行だけを消すと
 * 隣の行がカード行に繋がり、カードが崩れて URL の文字に戻ってしまう。カード行ごと消す。
 */
function deleteCardLine(forward: boolean) {
	return (view: EditorView) => {
		const { state } = view;
		const selection = state.selection.main;
		if (!selection.empty) return false;
		const line = state.doc.lineAt(selection.head);
		if (forward ? selection.head !== line.to : selection.head !== line.from) return false;
		const neighbour = forward ? line.to + 1 : line.from - 1;
		if (neighbour < 0 || neighbour > state.doc.length) return false;
		const card = cardAt(state, neighbour);
		if (!card) return false;
		// カード行とその改行（後ろの行に続く側）を消す。
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
			{ key: 'Backspace', run: deleteCardLine(false) },
			{ key: 'Delete', run: deleteCardLine(true) },
		]),
	),
];
