import type { PostView } from '$lib/api/types';
import { m } from '$lib/i18n/i18n.svelte';
import {
	parseNagiPostUrl,
	resolveQuoteFromUri,
	resolveQuoteFromUrl,
	type QuoteResolution,
} from './quote-url';

/**
 * コンポーザーの「貼り付けで付く引用」スロット。
 *
 * ポストモーダルと返信インライン欄が同じ挙動を持つので、状態と非同期解決を
 * ここへ集約する。
 * 引用は1件だけ持てる。新しく貼られたら置き換える。
 */
export class QuotePick {
	post = $state<PostView>();
	pending = $state(false);
	error = $state('');
	/** 後から届いた解決結果で、より新しい貼り付けを上書きしないための世代番号。 */
	#generation = 0;

	get ref(): { uri: string; cid: string } | undefined {
		return this.post ? { uri: this.post.uri, cid: this.post.cid } : undefined;
	}

	get active(): boolean {
		return Boolean(this.post) || this.pending;
	}

	/**
	 * 貼り付けが Nagi のスレッドURL単体なら引用として引き取る。
	 *
	 * URL文字列自体は本文へ入れない（preventDefault）。入れてしまうと
	 * LinkCardEditor の自動リンクカード化と競合し、あとから本文を削る処理も要る。
	 * 画像ペーストなど他の貼り付けは素通しする。
	 */
	handlePaste(
		event: ClipboardEvent,
		viewerDid: string | undefined,
		insertText?: (text: string) => void,
	): void {
		const text = event.clipboardData?.getData('text/plain') ?? '';
		if (!parseNagiPostUrl(text)) return;
		event.preventDefault();
		void this.#apply(
			() => resolveQuoteFromUrl(text, viewerDid),
			() => insertText?.(text.trim()),
		);
	}

	/**
	 * 下書きに保存しておいた引用を戻す。保存しているのは AT-URI だけなので、
	 * 表示に要る本文と著者はここで取り直す。復元時点でも権限は改めて判定される
	 * （下書きを寝かせている間に引用元が消えた／条件が変わった場合に備える）。
	 */
	restore(uri: string | undefined, viewerDid: string | undefined) {
		if (!uri) return;
		void this.#apply(() => resolveQuoteFromUri(uri, viewerDid));
	}

	/** onForbidden は引用できない相手だったときに呼ぶ（貼り付けでは URL を本文へ戻す、POST-07）。 */
	async #apply(resolve: () => Promise<QuoteResolution | undefined>, onForbidden?: () => void) {
		const generation = ++this.#generation;
		this.pending = true;
		this.error = '';
		try {
			const result = await resolve();
			if (generation !== this.#generation) return;
			if (!result) return;
			if (result.ok) {
				this.post = result.post;
				this.error = '';
			} else if (result.reason === 'forbidden' && onForbidden) {
				this.post = undefined;
				onForbidden();
			} else {
				// 見つからないときは本文へURLを戻さない（クリップボードに残っている）。
				// 代わりに理由を出して、貼り直すか諦めるかを選べるようにする。
				this.post = undefined;
				this.error = result.reason === 'forbidden' ? m.quoteNotAllowed() : m.quoteNotFound();
			}
		} finally {
			if (generation === this.#generation) this.pending = false;
		}
	}

	clear() {
		this.#generation++;
		this.post = undefined;
		this.pending = false;
		this.error = '';
	}
}
