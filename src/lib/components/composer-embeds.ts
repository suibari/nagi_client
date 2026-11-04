import { StateEffect, StateField, type Range } from '@codemirror/state';
import { Decoration, EditorView, WidgetType, type DecorationSet } from '@codemirror/view';
import { APPVIEW_URL } from '$lib/api/appview';
import { httpUrl } from '$lib/atproto/facets';
import { articleEmbedLines } from '$lib/atproto/markdown';
import { blobKey } from '$lib/blog/inlineImages';
import { m } from '$lib/i18n/i18n.svelte';

/** 入力欄で URL 行の下に見せるリンクカード。LinkCardEditor が取得した内容をそのまま渡す。 */
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

function build(doc: string, embeds: ComposerEmbeds | undefined): DecorationSet {
	if (!embeds) return Decoration.none;
	const cards = new Map(embeds.cards.map((card) => [httpUrl(card.uri) ?? card.uri, card]));
	const origins = appViewOrigins();
	const decorations: Range<Decoration>[] = [];
	for (const line of articleEmbedLines(doc)) {
		let widget: WidgetType | undefined;
		if (line.type === 'card') {
			const card = cards.get(line.url);
			if (card) widget = new CardWidget(card, Boolean(embeds.disabled), embeds.onremovecard);
		} else {
			const key = blobKey(line.url, origins);
			const preview = key ? embeds.images[key] : undefined;
			if (preview) widget = new ImageWidget(preview);
		}
		if (widget)
			decorations.push(Decoration.widget({ widget, block: true, side: 1 }).range(line.end));
	}
	return Decoration.set(decorations, true);
}

/**
 * 記事の入力欄で、URL だけの行の下にリンクカードを、画像行の下に画像を出す。
 * 投稿後の記事ページ（RichText の card / image ブロック）と同じ位置に見せるためのもの。
 * 行そのもの（URL や `![alt](url)`）は編集できるよう残し、埋め込みは行の下に足すだけにする。
 * ブロックの装飾は ViewPlugin から出せないので StateField で持つ。
 */
export const composerEmbeds = StateField.define<{
	embeds?: ComposerEmbeds;
	decorations: DecorationSet;
}>({
	create: () => ({ decorations: Decoration.none }),
	update(value, transaction) {
		let embeds = value.embeds;
		let changed = transaction.docChanged;
		for (const effect of transaction.effects)
			if (effect.is(setComposerEmbeds)) {
				embeds = effect.value;
				changed = true;
			}
		if (!changed) return value;
		return { embeds, decorations: build(transaction.newDoc.toString(), embeds) };
	},
	provide: (field) => EditorView.decorations.from(field, (value) => value.decorations),
});
