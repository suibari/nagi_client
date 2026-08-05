/**
 * 与えられた URL / パスが Nagi アプリ内のページ（内部ページ）であるか判定する。
 * - 相対パス（例: '/profile/xxx'）
 * - 現在の origin (window.location.origin) または同一オリジンと一致する絶対URL
 */
export function isInternalUrl(urlStr: string | undefined | null): boolean {
	if (!urlStr) return false;
	if (urlStr.startsWith('/') && !urlStr.startsWith('//')) return true;
	try {
		const base = typeof window !== 'undefined' ? window.location.href : 'https://nagi.app';
		const url = new URL(urlStr, base);
		const currentOrigin = typeof window !== 'undefined' ? window.location.origin : new URL(base).origin;
		return url.origin === currentOrigin;
	} catch {
		return false;
	}
}

/**
 * 内部URLである場合、SvelteKitのアプリ内遷移（SPA遷移）用に相対パス（例: '/profile/xxx'）へ変換して返す。
 * 内部URLでない場合は undefined を返す。
 */
export function toInternalPath(urlStr: string | undefined | null): string | undefined {
	if (!urlStr) return undefined;
	if (!isInternalUrl(urlStr)) return undefined;
	if (urlStr.startsWith('/') && !urlStr.startsWith('//')) return urlStr;
	try {
		const base = typeof window !== 'undefined' ? window.location.href : 'https://nagi.app';
		const url = new URL(urlStr, base);
		return `${url.pathname}${url.search}${url.hash}`;
	} catch {
		return undefined;
	}
}
