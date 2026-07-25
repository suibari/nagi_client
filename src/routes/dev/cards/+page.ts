import { dev } from '$app/environment';
import { error } from '@sveltejs/kit';

/**
 * カードまわりの見た目を、サーバーもセッションも無しで一覧するための開発用ページ。
 * dev はビルド時に false へ畳まれるので、本番ビルドでは必ず 404 になる。
 */
export const prerender = false;

export const load = () => {
	if (!dev) error(404, 'Not found');
	return {};
};
