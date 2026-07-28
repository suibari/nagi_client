import { dev } from '$app/environment';
import { error } from '@sveltejs/kit';

/**
 * 名刺カードの見た目を、Gemini も DB もワーカーも無しで詰めるための開発用ページ。
 * 分析は「初回登録」か「100投稿ごと」でしか発火しないので、実データを待っていては
 * デザインを確定できない。dev はビルド時に false へ畳まれるので本番では必ず 404。
 */
export const prerender = false;

export const load = () => {
	if (!dev) error(404, 'Not found');
	return {};
};
