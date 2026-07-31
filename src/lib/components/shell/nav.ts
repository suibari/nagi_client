import { type Readable } from 'svelte/store';
import { m } from '$lib/i18n/i18n.svelte';
import { unreadCount } from '$lib/notifications/unread.svelte';

/**
 * ナビ項目に重ねる未読表示。ドットと数値バッジで真実源が違う（端末ローカルの
 * ウォーターマーク / サーバーの readAt）ので、「0 なら非表示」の件数1本に揃えて
 * 見た目だけ style で切り替える。描画は NavBadge.svelte に集約。
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
