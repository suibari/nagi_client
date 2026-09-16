/**
 * OGP画像は配信元からクライアントが直接読む。
 * mixed contentや data:/blob: の混入を避けるため HTTPS だけを表示対象にする。
 */
export function safeNewsImageUrl(value: string | undefined): string | undefined {
	if (!value) return undefined;
	try {
		const url = new URL(value);
		return url.protocol === 'https:' ? url.href : undefined;
	} catch {
		return undefined;
	}
}
