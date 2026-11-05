import { redirect } from '@sveltejs/kit';

// 初回のプロフィール登録画面は廃止した（Bluesky のプロフィールを写して、すぐフィードから始める）。
// 古いリンク用にフィードへ送る。
export const load = () => {
	redirect(307, '/');
};
