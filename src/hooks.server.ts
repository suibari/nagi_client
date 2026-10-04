import type { Handle } from '@sveltejs/kit';
import { isSafeDid, isSafeRkey, withPostCardMeta } from '$lib/og/html';

/**
 * prerender 済みのブログ記事は Vercel が静的ファイルとして返し、api/spa を通らない。
 * app.html 固定の OGP 画像のままにならないよう、生成時に記事カードへ差し替える。
 */
export const handle: Handle = async ({ event, resolve }) => {
	const { did, rkey } = event.params;
	if (event.route.id !== '/blog/[did]/[rkey]' || !isSafeDid(did) || !isSafeRkey(rkey))
		return resolve(event);
	return resolve(event, {
		transformPageChunk: ({ html }) => withPostCardMeta(html, did, rkey, 'blog'),
	});
};
