import { redirect } from '@sveltejs/kit';

export const load = ({ url }) => {
	redirect(307, `/emoji${url.search}#favorites`);
};
