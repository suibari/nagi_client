import { dev } from '$app/environment';
import { injectAnalytics } from '@vercel/analytics/sveltekit';
import { injectUmami } from '$lib/analytics/umami';

injectAnalytics({ mode: dev ? 'development' : 'production' });
injectUmami(__NAGI_UMAMI_WEBSITE_ID__);

export const ssr = false;
export const prerender = false;
