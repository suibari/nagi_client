import { get } from 'svelte/store';
import type { RadioTrack } from '$lib/api/types';
import { i18n } from '$lib/i18n/i18n.svelte';
import { RADIO_COLLECTION_SCOPE } from '$lib/oauth/client';
import { session } from '$lib/oauth/session.svelte';
import { sessionCovers } from '$lib/optin/scope-optin';
import { composerHost } from '$lib/post/composer-host.svelte';
import { radioSongCard } from './song-card';

/** いま表示している言語のDJコメント。 */
export const radioComment = (track: Pick<RadioTrack, 'comment' | 'commentJa' | 'commentEn'>) =>
	(i18n.locale === 'en' ? track.commentEn : track.commentJa) || track.comment;

/** ラジオの公開レコードを書く権限があるか。無ければポストモーダルで再認可を案内する。 */
export const hasRadioScope = () => sessionCovers([RADIO_COLLECTION_SCOPE]);

/** ラジオの1回を引用してポストする。ニュースの「コメント」（quoteNews）と同じ扱い。 */
export function quoteRadio(track: RadioTrack) {
	if (!get(session)) {
		location.href = '/login';
		return;
	}
	composerHost.openQuoteRadio(track);
}

/**
 * 曲ページを共有シートで、無ければクリップボードへ。ニュースの共有（shareNews）と同じ扱いで、
 * クリップボードへコピーしたときだけ true。共有シートを閉じただけなら false、それ以外は throw。
 */
export async function shareRadioTrack(track: RadioTrack): Promise<boolean> {
	const card = radioSongCard(track);
	if (!card) return false;
	try {
		if (navigator.share) {
			await navigator.share({ title: card.title, url: card.uri });
			return false;
		}
		await navigator.clipboard.writeText(card.uri);
		return true;
	} catch (e) {
		if ((e as DOMException)?.name === 'AbortError') return false;
		throw e;
	}
}
