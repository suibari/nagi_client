import { SHARE_PATH, saveShare, sharedContent } from './store';

export function isShareRequest(request: Request, origin: string): boolean {
	const url = new URL(request.url);
	return request.method === 'POST' && url.origin === origin && url.pathname === SHARE_PATH;
}

export async function receiveShare(request: Request): Promise<Response> {
	try {
		const content = sharedContent(await request.formData());
		await saveShare(content);
		return Response.redirect(new URL(`${SHARE_PATH}?id=${content.id}`, request.url), 303);
	} catch {
		return new Response(
			'共有内容を受け取れませんでした。元のアプリから共有し直してください。\nCould not receive the shared content. Please share again from the original app.',
			{
				status: 400,
				headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
			},
		);
	}
}
