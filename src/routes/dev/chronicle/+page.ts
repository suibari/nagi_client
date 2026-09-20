import { dev } from '$app/environment';
import { error } from '@sveltejs/kit';

/**
 * APIを叩かず、年表のスクロール演出だけを再生する開発専用ページ。
 *
 * 数年ぶんの年表を seed しないと確認できない、という状態を避けるために置いている。
 * reduced-motion の切り替えもここで確かめる。
 */
export const prerender = false;

export const load = () => {
	if (!dev) error(404, 'Not found');
	return {};
};
