import { derived, type Readable } from 'svelte/store';
import { m } from '$lib/i18n/i18n.svelte';
import { unreadCount } from '$lib/notifications/unread.svelte';
import { unreadNews } from '$lib/news/unread.svelte';

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
export const navItems: NavItem[] = [
	{ href: '/', label: m.navFeed, icon: 'home' },
	{ href: '/channels', label: m.navChannels, icon: 'hash' },
	{
		href: '/news',
		label: m.navNews,
		icon: 'newspaper',
		badge: {
			unread: derived(unreadNews, (unread) => (unread ? 1 : 0)),
			style: 'dot',
			aria: () => m.newsUnreadAria(),
		},
	},
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
/** 2つのフィードタブ（グローバル/全肯定）ではホームを active にする。ニュースは独立項目。 */
export const isActive = (pathname: string, href: string) =>
	href === '/'
		? pathname === '/' || pathname.startsWith('/affirmation')
		: pathname === href || pathname.startsWith(`${href}/`);
