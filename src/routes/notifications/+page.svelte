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
	const relativeTimeBase = Date.now();
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
	const relativeTime = (createdAt: string) => {
		const differenceSeconds = (new Date(createdAt).valueOf() - relativeTimeBase) / 1000;
		const absoluteSeconds = Math.abs(differenceSeconds);
		const formatter = new Intl.RelativeTimeFormat(dateLocale(), { numeric: 'auto' });
		if (absoluteSeconds < 60) return formatter.format(Math.round(differenceSeconds), 'second');
		if (absoluteSeconds < 3_600)
			return formatter.format(Math.round(differenceSeconds / 60), 'minute');
		if (absoluteSeconds < 86_400)
			return formatter.format(Math.round(differenceSeconds / 3_600), 'hour');
		return formatter.format(Math.round(differenceSeconds / 86_400), 'day');
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
				<div class="notification-main">
					<div class="notification-head">
						<span class="what"
							><strong>{item.actor.displayName ?? item.actor.handle}</strong>{item.type === 'reply'
								? m.notifRepliedSuffix()
								: item.type === 'reaction'
									? m.notifReactedSuffix()
									: m.notifMentionedSuffix()}</span
						>
						<time class="when" datetime={item.createdAt}>{relativeTime(item.createdAt)}</time>
					</div>
					{#if item.post?.text}<p class="notification-subject">{item.post.text}</p>{/if}
				</div>
			</a>
		{/each}
	{/if}
</section>
