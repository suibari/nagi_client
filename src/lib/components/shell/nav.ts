import { m } from '$lib/i18n/i18n.svelte';

export type NavItem = { href: string; label: () => string; icon: string };
export const navItems: NavItem[] = [
	{ href: '/', label: m.navGlobal, icon: 'home' },
	{ href: '/affirmation', label: m.navAffirmation, icon: 'heart' },
	{ href: '/notifications', label: m.navNotifications, icon: 'bell' },
	{ href: '/settings', label: m.navSettings, icon: 'settings' },
];
export const isActive = (pathname: string, href: string) =>
	href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
