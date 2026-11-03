import type { PostScope } from './scope';
import type { NewsView, PostView } from '$lib/api/types';

export type ReplyTarget = {
	root: { uri: string; cid: string };
	parent: { uri: string; cid: string };
	post: PostView;
};

/** 編集する3行日記。ポストモーダルを3行日記タブだけにして開く。 */
export type TrilinesEditTarget = {
	uri: string;
	cid: string;
	post: PostView;
};

export type QuoteTarget = {
	uri: string;
	cid: string;
	post?: PostView;
	news?: NewsView;
};

/**
 * ポストモーダルの開閉と、「いま見ているフィード」の文脈。
 *
 * モーダルは +layout.svelte に1つだけ常駐する（Composer を {#if} で作り直すと
 * ImageAttachmentEditor がアンマウント時に Object URL を解放してしまい、
 * 添付画像と書きかけが消えるため）。開閉は表示の切り替えだけで行う。
 */
class ComposerHost {
	open = $state(false);
	/** 開いた文脈での既定の投稿範囲。ホームは従来どおりこっそりを既定にする。 */
	defaultScope = $state<PostScope>('feed');
	replyTarget = $state<ReplyTarget | undefined>(undefined);
	quoteTarget = $state<QuoteTarget | undefined>(undefined);
	trilinesEditTarget = $state<TrilinesEditTarget | undefined>(undefined);

	show(defaultScope: PostScope = 'feed') {
		this.defaultScope = defaultScope;
		this.trilinesEditTarget = undefined;
		this.open = true;
	}

	openReply(post: PostView, defaultScope: PostScope = 'feed') {
		const subject = { uri: post.uri, cid: post.cid };
		this.replyTarget = {
			root: post.reply?.root ?? subject,
			parent: subject,
			post,
		};
		this.quoteTarget = undefined;
		this.defaultScope = defaultScope;
		this.trilinesEditTarget = undefined;
		this.open = true;
	}

	openQuote(post: PostView, defaultScope: PostScope = 'feed') {
		this.quoteTarget = {
			uri: post.uri,
			cid: post.cid,
			post,
		};
		this.replyTarget = undefined;
		this.defaultScope = defaultScope;
		this.trilinesEditTarget = undefined;
		this.open = true;
	}

	openQuoteNews(news: NewsView, defaultScope: PostScope = 'feed') {
		this.quoteTarget = {
			uri: news.uri,
			cid: news.cid,
			news,
		};
		this.replyTarget = undefined;
		this.defaultScope = defaultScope;
		this.trilinesEditTarget = undefined;
		this.open = true;
	}

	clearReply() {
		this.replyTarget = undefined;
	}

	clearQuote() {
		this.quoteTarget = undefined;
	}

	openTrilinesEdit(post: PostView) {
		this.trilinesEditTarget = { uri: post.uri, cid: post.cid, post };
		this.replyTarget = undefined;
		this.quoteTarget = undefined;
		this.open = true;
	}

	clearAllTargets() {
		this.replyTarget = undefined;
		this.quoteTarget = undefined;
	}

	hide() {
		this.open = false;
		// 日記の編集はその場限り。次に開いたときは通常の投稿に戻す。
		this.trilinesEditTarget = undefined;
	}
}

export const composerHost = new ComposerHost();
