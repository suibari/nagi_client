import { m } from '$lib/i18n/i18n.svelte';

export type NavItem = { href: string; label: () => string; icon: string };
/** 未読バッジの表示テキスト。3桁以上は "99+" に丸める。 */
export const formatUnread = (count: number) => (count > 99 ? '99+' : String(count));
export const navItems: NavItem[] = [
	{ href: '/', label: m.navFeed, icon: 'home' },
	{ href: '/channels', label: m.navChannels, icon: 'hash' },
	{ href: '/notifications', label: m.navNotifications, icon: 'bell' },
	{ href: '/settings', label: m.navSettings, icon: 'settings' },
];
/** 3つのフィードタブではホームを active にする。 */
export const isActive = (pathname: string, href: string) =>
	href === '/'
		? pathname === '/' || pathname.startsWith('/affirmation') || pathname.startsWith('/news')
		: pathname === href || pathname.startsWith(`${href}/`);
