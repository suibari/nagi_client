import { redirect } from '@sveltejs/kit';

export const ssr = true;
export const prerender = true;

export function load(): never {
	redirect(308, '/about');
}
