import { redirect } from '@sveltejs/kit';

// チャンネルはハッシュタグへ統合して廃止した。一覧の代わりは検索（タグ・自由文）。
export const load = () => {
	redirect(308, '/search');
};
