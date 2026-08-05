import { writable, type Readable } from 'svelte/store';
import { m } from '$lib/i18n/i18n.svelte';
import { unreadCount } from '$lib/notifications/unread.svelte';

/**
 * ナビ項目に重ねる未読表示。ドットと数値バッジで真実源が違う（既読ウォーターマーク /
 * サーバーの readAt）ので、「0 なら非表示」の件数1本に揃えて見た目だけ style で
 * 切り替える。描画は NavBadge.svelte に集約。
 */
export type NavBadge = {
	/** 0 なら非表示。dot は 1 以上で点灯するだけで数は出さない。 */
	unread: Readable<number>;
	style: 'dot' | 'count';
	aria: (count: number) => string;
};
export type NavItem = { href: string; label: () => string; icon: string; badge?: NavBadge };
/** 未読バッジの表示テキスト。3桁以上は "99+" に丸める。 */
export const formatUnread = (count: number) => (count > 99 ? '99+' : String(count));
/*
 * スマホの下部ナビは5項目が限界。ニュースはここから外し、my Nagi の
 * ニュースセクション（未読ドット付き）から入ってもらう。
 */
export const navItems: NavItem[] = [
	{ href: '/', label: m.navMyNagi, icon: 'home' },
	{ href: '/feed', label: m.navFeed, icon: 'text' },
	{ href: '/channels', label: m.navChannels, icon: 'hash' },
	{
		href: '/notifications',
		label: m.navNotifications,
		icon: 'bell',
		badge: {
			unread: unreadCount,
			style: 'count',
			aria: (count) => m.notifUnreadBadgeAria({ count }),
		},
	},
	{ href: '/settings', label: m.navSettings, icon: 'settings' },
];
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
