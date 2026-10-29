import { redirect } from '@sveltejs/kit';

// フィードは TOP（`/`）へ移った。`/feed?tab=<id>` の既存リンク・ブックマーク用にクエリを引き継ぐ。
export const load = ({ url }) => {
	redirect(307, `/${url.search}`);
};
