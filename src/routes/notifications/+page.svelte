<script lang="ts">
	import { onMount } from 'svelte';
	import { getNotifications, APPVIEW_URL } from '$lib/api/appview';
	import type { NotificationView } from '$lib/api/types';
	import Avatar from '$lib/components/Avatar.svelte';
	import { stripMarkdown } from '$lib/atproto/markdown';
	import { displayEmojiName, resolveEmojiUrl } from '$lib/atproto/bluemoji';
	import { session, oauthReady } from '$lib/oauth/session.svelte';
	import { m, dateLocale } from '$lib/i18n/i18n.svelte';
	let items = $state<NotificationView[]>([]);
	let error = $state('');
	let loading = $state(true);
	const relativeTimeBase = Date.now();
	/** 通知カード全体がリンクなので、サムネはギャラリー無しの素の img で並べる。 */
	const MAX_THUMBS = 4;
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
	/** 日記はスレッドが無いので、本人のプロフィールの日記タブに飛ばす。 */
	const notificationHref = (item: NotificationView) =>
		item.type === 'diary'
			? `/profile/${item.diary?.subject ?? $session?.did}?tab=diary${item.diary ? `&date=${item.diary.date}` : ''}`
			: threadHref(item.subjectUri);
	const resolveImage = (url: string) => (url.startsWith('/') ? APPVIEW_URL + url : url);
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

{#snippet reactionEmoji(reaction: NonNullable<NotificationView['reaction']>)}
	{#if reaction.bluemoji}<img
			class="notification-emoji"
			src={resolveEmojiUrl(reaction.bluemoji.url)}
			alt={reaction.bluemoji.alt ?? displayEmojiName(reaction.bluemoji.name)}
			title={displayEmojiName(reaction.bluemoji.name)}
			loading="lazy"
		/>{:else}{reaction.emoji}{/if}
{/snippet}

<section class="page-title"><h1>{m.navNotifications()}</h1></section>
<section class="timeline">
	{#if error}<div class="state error">{error}</div>
	{:else if loading}<div class="state">{m.loading()}</div>
	{:else if !items.length}<div class="state">{m.notifEmpty()}</div>
	{:else}
		{#each items as item (item.id)}
			<a class="notification card" href={notificationHref(item)}>
				<Avatar actor={item.actor} size="small" />
				<div class="notification-main">
					<div class="notification-head">
						<span class="what">
							<strong>{item.actor.displayName ?? item.actor.handle}</strong
							>{#if item.type === 'reaction' && item.reaction}{m.notifReactedWithPrefix()}{@render reactionEmoji(
									item.reaction,
								)}{m.notifReactedWithSuffix()}{:else if item.type === 'reply'}{m.notifRepliedSuffix()}{:else if item.type === 'reaction'}{m.notifReactedSuffix()}{:else if item.type === 'diary'}{m.notifDiarySuffix()}{:else}{m.notifMentionedSuffix()}{/if}
						</span>
						<time class="when" datetime={item.createdAt}>{relativeTime(item.createdAt)}</time>
					</div>
					{#if item.type === 'diary' && item.diary}<p class="notification-subject">
							{stripMarkdown(item.diary.text)}
						</p>{:else if item.post?.text}<p class="notification-subject">
							{stripMarkdown(item.post.text)}
						</p>{/if}
					{#if item.post?.images?.length}<div class="notification-thumbs">
							{#each item.post.images.slice(0, MAX_THUMBS) as image}
								<img src={resolveImage(image.url)} alt={image.alt} loading="lazy" />
							{/each}
						</div>{/if}
				</div>
			</a>
		{/each}
	{/if}
</section>
