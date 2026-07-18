export type NavItem = { href: string; label: string; icon: string };
export const navItems: NavItem[] = [
	{ href: '/', label: 'グローバル', icon: 'home' },
	{ href: '/affirmation', label: '全肯定', icon: 'heart' },
	{ href: '/notifications', label: '通知', icon: 'bell' },
	{ href: '/settings', label: '設定', icon: 'settings' },
];
export const isActive = (pathname: string, href: string) =>
	href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
