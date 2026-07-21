import { m } from '$lib/i18n/i18n.svelte';

export type NavItem = { href: string; label: () => string; icon: string };
export const navItems: NavItem[] = [
	{ href: '/', label: m.navFeed, icon: 'home' },
	{ href: '/notifications', label: m.navNotifications, icon: 'bell' },
	{ href: '/settings', label: m.navSettings, icon: 'settings' },
];
/** グローバルと全肯定は同じ「フィード」の 2 タブなので、/affirmation でもホームを active に */
export const isActive = (pathname: string, href: string) =>
	href === '/'
		? pathname === '/' || pathname.startsWith('/affirmation')
		: pathname === href || pathname.startsWith(`${href}/`);
