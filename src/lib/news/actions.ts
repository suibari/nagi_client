import { get } from 'svelte/store';
import type { NewsView } from '$lib/api/types';
import { session } from '$lib/oauth/session.svelte';
import { composerHost } from '$lib/post/composer-host.svelte';
import { safeNewsUrl } from './bot-post';

/**
 * ニュースの操作。ニュース一覧のカード（NewsCard）と右サイドバー（NewsSidebarContent）で
 * 同じ挙動にするため、ここに寄せる。
 */

/** 「コメントする」＝ニュースの引用投稿。未ログインならサインインへ。 */
export function quoteNews(news: NewsView) {
	if (!get(session)) {
		location.href = '/login';
		return;
	}
	composerHost.openQuoteNews(news);
}

/**
 * 共有シートがあればそれで、無ければ記事 URL をクリップボードへ。
 * クリップボードへコピーしたときだけ true（「コピーしました」を出すため）。
 * 共有シートを閉じただけなら false、それ以外の失敗は throw する。
 */
export async function shareNews(news: NewsView): Promise<boolean> {
	const url = safeNewsUrl(news.url);
	if (!url) return false;
	try {
		if (navigator.share) {
			await navigator.share({ title: news.title, url });
			return false;
		}
		await navigator.clipboard.writeText(url);
		return true;
	} catch (e) {
		if ((e as DOMException)?.name === 'AbortError') return false;
		throw e;
	}
}
