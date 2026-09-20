import { writable, type Readable } from 'svelte/store';
import { m } from '$lib/i18n/i18n.svelte';
import { unreadCount } from '$lib/notifications/unread.svelte';
import { unplayedToday } from '$lib/zenkatsu/notice';

/**
 * ナビ項目に重ねる未読表示。ドットと数値バッジで真実源が違う（既読ウォーターマーク /
 * サーバーの readAt）ので、「0 なら非表示」の件数1本に揃えて見た目だけ style で
 * 切り替える。描画は NavBadge.svelte に集約。
 */
export type NavBadge = {
	/** 0 なら非表示。dot は 1 以上で点灯するだけで数は出さない。 */
	unread: Readable<number>;
	style: 'dot' | 'count' | 'text';
	aria: (count: number) => string;
};
export type NavItem = { href: string; label: () => string; icon: string; badge?: NavBadge };
/** 未読バッジの表示テキスト。3桁以上は "99+" に丸める。 */
export const formatUnread = (count: number) => (count > 99 ? '99+' : String(count));
const myNagi: NavItem = { href: '/', label: m.navMyNagi, icon: 'home' };
const feed: NavItem = { href: '/feed', label: m.navFeed, icon: 'text' };
const notifications: NavItem = {
	href: '/notifications',
	label: m.navNotifications,
	icon: 'bell',
	badge: {
		unread: unreadCount,
		style: 'count',
		aria: (count) => m.notifUnreadBadgeAria({ count }),
	},
};
const channels: NavItem = { href: '/channels', label: m.navChannels, icon: 'hash' };
const news: NavItem = { href: '/news', label: m.navNews, icon: 'newspaper' };
const diary: NavItem = { href: '/diary', label: m.navDiary, icon: 'draft' };
// 全肯定カード（ニュース / カードリスト / ゼンカツ！の3タブ）。
const cards: NavItem = {
	href: '/cards',
	label: m.navCards,
	icon: 'cards',
	badge: { unread: unplayedToday, style: 'text', aria: () => m.zenkatsuNotPlayedBadge() },
};
const settings: NavItem = { href: '/settings', label: m.navSettings, icon: 'settings' };

/** PC の区切りも含めた表示順。グループを足せば区切り線も自動で増える。 */
export const desktopNavGroups: NavItem[][] = [
	[myNagi, feed, notifications],
	[channels, news, diary, cards],
	[settings],
];

/** スマホで常に見せる、利用頻度の高い入口。 */
export const mobilePrimaryItems: NavItem[] = [myNagi, feed, notifications];

/** スマホのボトムシート。将来の項目追加はこの配列へ集約する。 */
export const mobileMenuItems: NavItem[] = [channels, news, diary, cards, settings];
/** フィードの3タブ（ホーム/グローバル/全肯定）はどれもフィード扱いにする。 */
const FEED_PATHS = ['/feed', '/global', '/affirmation'];
/**
 * my Nagi（`/`）は完全一致のときだけ。前方一致にすると全ページで active になってしまう。
 */
export const isActive = (pathname: string, href: string) => {
	if (href === '/') return pathname === '/';
	if (href === '/feed') return FEED_PATHS.some((path) => pathname.startsWith(path));
	return pathname === href || pathname.startsWith(`${href}/`);
};

/**
 * いま開いているページのナビ項目をもう一度押したときの「開き直して」の合図。
 * SvelteKit は同一 URL への遷移を捨てるので、これが無いと最新を取り直す導線が
 * デスクトップに一つも無くなる（pull-to-refresh も無いため）。X / Instagram / Threads
 * と同じ「アクティブなタブ再タップ＝先頭へ戻って再取得」に揃える。
 * 購読するのは再取得を持っているページだけでよく、それ以外は先頭スクロールだけになる。
 */
export const pageRefresh = writable(0);

/** ナビ項目のクリック。アクティブなら遷移を止めて、先頭スクロール＋再取得へ回す。 */
export function handleNavClick(event: MouseEvent, pathname: string, href: string): void {
	// 修飾キー付き（新しいタブで開く等）はブラウザに任せる。
	if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
		return;
	if (!isActive(pathname, href)) return;
	event.preventDefault();
	window.scrollTo({ top: 0, behavior: 'smooth' });
	pageRefresh.update((count) => count + 1);
}
