import { page } from '$app/state';
import { get } from 'svelte/store';
import { oauthReady, session } from '$lib/oauth/session.svelte';
import { trackSignupEvent } from './umami';

export function trackSignupCta(): void {
	if (get(oauthReady) && !get(session) && page.route.id) {
		trackSignupEvent('signup_cta_click', page.route.id);
	}
}
