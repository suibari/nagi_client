import { dev } from '$app/environment';
import { error } from '@sveltejs/kit';

/** APIやPDSへ書き込まず、インタラクション演出だけを再生する開発専用ページ。 */
export const prerender = false;

export const load = () => {
	if (!dev) error(404, 'Not found');
	return {};
};
