import { isSafeDid, withProfileCardMeta } from '../src/lib/og/html.js';

type FunctionRequest = {
	method?: string;
	query: Record<string, string | string[] | undefined>;
};

type FunctionResponse = {
	status(code: number): FunctionResponse;
	setHeader(name: string, value: string): void;
	send(body: string): void;
	end(): void;
	redirect(code: number, destination: string): void;
};

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

function shellUrl() {
	const env = (
		globalThis as typeof globalThis & {
			process?: { env?: Record<string, string | undefined> };
		}
	).process?.env;
	if (env?.VERCEL_URL) return `https://${env.VERCEL_URL}/200`;
	// `vercel dev` だけのフォールバック。デプロイ環境では信頼済みの VERCEL_URL を必ず使い、
	// 外部入力の Host ヘッダーを fetch 先にしない（SSRF 防止）。
	if (env?.NODE_ENV !== 'production') return 'http://127.0.0.1:3000/200';
	return 'https://nagi.suibari.com/200';
}

export default async function handler(request: FunctionRequest, response: FunctionResponse) {
	if (request.method !== 'GET' && request.method !== 'HEAD') return response.status(405).end();
	const did = first(request.query.did);
	if (!isSafeDid(did)) return response.status(404).end();

	try {
		const shell = await fetch(shellUrl(), {
			headers: { Accept: 'text/html' },
			signal: AbortSignal.timeout(5_000),
		});
		if (!shell.ok) throw new Error(`SPA shell returned ${shell.status}`);
		const html = withProfileCardMeta(await shell.text(), did);
		response.setHeader('Content-Type', 'text/html; charset=utf-8');
		response.setHeader(
			'Cache-Control',
			'public, max-age=0, s-maxage=300, stale-while-revalidate=86400',
		);
		if (request.method === 'HEAD') return response.status(200).end();
		return response.status(200).send(html);
	} catch (error) {
		console.error('Failed to render dynamic OGP shell:', error);
		// Vercel の静的 shell 取得だけが失敗した場合は従来の /200 へ戻す。
		// 通常は到達しないが、OGP補助の一時障害を固定HTMLより優先しない。
		return response.redirect(307, '/200');
	}
}
