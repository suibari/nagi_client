<script lang="ts">
	import { onMount } from 'svelte';
	import type { PostView } from '$lib/api/types';
	import { session, type OAuthSession } from '$lib/oauth/session.svelte';
	import { composerHost } from '$lib/post/composer-host.svelte';
	import {
		clearModerationPreferences,
		setModerationPreference,
	} from '$lib/moderation/preferences.svelte';

	const did = 'did:plc:playwright-composer-moderation';
	const post: PostView = {
		uri: `at://${did}/com.suibari.nagi.post/moderated`,
		cid: 'moderated',
		author: { did, handle: 'moderation.test', displayName: 'Moderation fixture' },
		text: 'Moderated composer target text',
		createdAt: '2026-01-01T00:00:00Z',
		indexedAt: '2026-01-01T00:00:00Z',
		moderationLabels: ['harassment'],
		reactions: [],
		isBot: false,
		isAffirmation: false,
	};
	let ready = $state(false);
	let preference = $state<'warn' | 'hide' | 'ignore'>('warn');

	onMount(() => {
		session.set({
			did,
			fetchHandler: (url: string | URL, init?: RequestInit) => fetch(url, init),
			getTokenInfo: async () => ({ scope: '' }),
		} as unknown as OAuthSession);
		ready = true;
		return () => {
			composerHost.hide();
			composerHost.clearAllTargets();
			clearModerationPreferences();
			session.set(null);
		};
	});

	function openTarget(kind: 'reply' | 'quote') {
		setModerationPreference('automatic', preference);
		if (kind === 'reply') composerHost.openReply(post);
		else composerHost.openQuote(post);
	}
</script>

<svelte:head><title>Composer moderation E2E</title></svelte:head>

<section>
	<h1>Composer moderation E2E</h1>
	{#if ready}
		<label>
			Moderation preference
			<select bind:value={preference}>
				<option value="warn">Warn</option>
				<option value="hide">Hide</option>
				<option value="ignore">Ignore</option>
			</select>
		</label>
		<button type="button" onclick={() => openTarget('reply')}>Open reply target</button>
		<button type="button" onclick={() => openTarget('quote')}>Open quote target</button>
	{/if}
</section>
