import { browser } from '$app/environment';
import { session } from '$lib/oauth/session.svelte';
import { writable } from 'svelte/store';
import { getThread } from '$lib/api/appview';
import { BotReplyChecks } from './bot-reply-collapse';

export const botReplyChecks = new BotReplyChecks(getThread);
export const botReplyCheckRevision = writable(0);
export function invalidateBotReplyChecks() {
	botReplyChecks.clear();
	botReplyCheckRevision.update((revision) => revision + 1);
}

if (browser) {
	let viewer: string | undefined;
	session.subscribe((value) => {
		if (viewer === value?.did) return;
		viewer = value?.did;
		invalidateBotReplyChecks();
	});
}
