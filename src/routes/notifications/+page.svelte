<script lang="ts">
	import { onMount } from 'svelte';
	import { getNotifications } from '$lib/api/appview';
	import type { NotificationView } from '$lib/api/types';
	import Avatar from '$lib/components/Avatar.svelte';
	import { session, oauthReady } from '$lib/oauth/session.svelte';
	import { m, dateLocale } from '$lib/i18n/i18n.svelte';
	let items = $state<NotificationView[]>([]);
	let error = $state('');
	let loading = $state(true);
	onMount(async () => {
		if (!$session && $oauthReady) {
			location.href = '/login';
			return;
		}
		try {
			items = (await getNotifications()).items;
		} catch (e) {
			error = e instanceof Error ? e.message : m.notifFetchFailed();
		} finally {
			loading = false;
		}
	});
	const threadHref = (uri: string) => {
		const [, , did, , rkey] = uri.split('/');
		return `/thread/${did}/${rkey}`;
	};
</script>

<section class="page-title"><h1>{m.navNotifications()}</h1></section>
<section class="timeline">
	{#if error}<div class="state error">{error}</div>
	{:else if loading}<div class="state">{m.loading()}</div>
	{:else if !items.length}<div class="state">{m.notifEmpty()}</div>
	{:else}
		{#each items as item (item.id)}
			<a class="notification card" href={threadHref(item.subjectUri)}>
				<Avatar actor={item.actor} size="small" />
				<span class="what"
					><strong>{item.actor.displayName ?? item.actor.handle}</strong>{item.type === 'reply'
						? m.notifRepliedSuffix()
						: m.notifReactedSuffix()}</span
				>
				<time class="when"
					>{new Date(item.createdAt).toLocaleString(dateLocale(), {
						month: 'short',
						day: 'numeric',
						hour: '2-digit',
						minute: '2-digit',
					})}</time
				>
			</a>
		{/each}
	{/if}
</section>
