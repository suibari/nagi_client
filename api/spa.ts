import { isSafeDid, withProfileCardMeta } from '../src/lib/og/html.js';

function shellUrl() {
	if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}/200`;
	// `vercel dev` だけのフォールバック。デプロイ環境では信頼済みの VERCEL_URL を必ず使い、
	// 外部入力の Host ヘッダーを fetch 先にしない（SSRF 防止）。
	if (process.env.NODE_ENV !== 'production') return 'http://127.0.0.1:3000/200';
	return 'https://nagi.suibari.com/200';
}

export default async function handler(request: Request) {
	if (request.method !== 'GET' && request.method !== 'HEAD')
		return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
	const did = new URL(request.url).searchParams.get('did');
	if (!isSafeDid(did)) return new Response(null, { status: 404 });

	try {
		const shell = await fetch(shellUrl(), {
			headers: { Accept: 'text/html' },
			signal: AbortSignal.timeout(5_000),
		});
		if (!shell.ok) throw new Error(`SPA shell returned ${shell.status}`);
		const html = withProfileCardMeta(await shell.text(), did);
		return new Response(request.method === 'HEAD' ? null : html, {
			headers: {
				'Content-Type': 'text/html; charset=utf-8',
				'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400',
			},
		});
	} catch (error) {
		console.error('Failed to render dynamic OGP shell:', error);
		// Vercel の静的 shell 取得だけが失敗した場合は従来の /200 へ戻す。
		// 通常は到達しないが、OGP補助の一時障害を固定HTMLより優先しない。
		return Response.redirect(new URL('/200', request.url), 307);
	}
}
