<script lang="ts">
	import type { ModerationOpts } from '@atproto/api';
	import { onMount, untrack } from 'svelte';
	import {
		canInteractWithBsky,
		getBskyNotifications,
		getBskyThread,
		getModerationOpts,
		markBskyNotificationsSeen,
	} from '$lib/bsky/agent';
	import { bskyConversations } from '$lib/bsky/conversation';
	import { bskyPostDisplay } from '$lib/bsky/moderation';
	import { isBskyNotificationVisible, type BskyNotificationView } from '$lib/bsky/notifications';
	import { dateLocale, m } from '$lib/i18n/i18n.svelte';
	import { ageAssurance } from '$lib/moderation/age.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import { startVisiblePolling } from '$lib/polling';
	import Avatar from '../Avatar.svelte';
	import Button from '../Button.svelte';
	import InfiniteScroll from '../InfiniteScroll.svelte';
	import Spinner from '../Spinner.svelte';
	import BskyPermissionDialog from './BskyPermissionDialog.svelte';
	import BskyThreadUnit from './BskyThreadUnit.svelte';

	/**
	 * 通知画面の Bluesky タブ（NOTIFY-07）。既読は Bluesky 側に記録し、Nagi の通知の既読とは混ぜない。
	 * 通知は1件ずつ並べ、件数でまとめない。押すとその投稿の会話をその場に開く。
	 */
	let {
		active,
		onseen,
		refreshToken = 0,
	}: {
		/** 表示中のタブか。見えていない間は取得も既読化もしない。 */
		active: boolean;
		/** Bluesky 側で既読にできた。 */
		onseen?: () => void;
		/** ナビの再押下などで読み直す合図。 */
		refreshToken?: number;
	} = $props();

	let granted = $state<boolean>();
	let permissionPrompt = $state(false);
	let moderation = $state<ModerationOpts>();
	let items = $state<BskyNotificationView[]>([]);
	let cursor = $state<string>();
	let loading = $state(false);
	let loaded = $state(false);
	let error = $state('');
	let moreError = $state('');
	let expanded = $state<string>();
	const relativeTimeBase = Date.now();

	const visible = $derived(
		moderation
			? items.filter((item) =>
					isBskyNotificationVisible(item, moderation!, { isAdult: ageAssurance.isAdult }),
				)
			: [],
	);

	async function reload() {
		const current = $session;
		if (loading || !current) return;
		loading = true;
		try {
			granted ??= await canInteractWithBsky();
			if (!granted) return;
			moderation ??= await getModerationOpts();
			const page = await getBskyNotifications();
			if ($session !== current) return;
			items = page.items;
			cursor = page.cursor;
			error = '';
			const latest = visible[0]?.createdAt;
			if (latest && active) {
				try {
					await markBskyNotificationsSeen(latest);
					if ($session === current) onseen?.();
				} catch (cause) {
					console.warn('[BskyNotificationList] updateSeen failed', cause);
				}
			}
		} catch (cause) {
			console.warn('[BskyNotificationList] load failed', cause);
			// 読み直しの失敗で、表示済みの一覧を消さない。
			if (!items.length) error = m.notifFetchFailed();
		} finally {
			loading = false;
			loaded = true;
		}
	}

	async function loadMore() {
		if (!cursor || loading) return;
		loading = true;
		moreError = '';
		try {
			const page = await getBskyNotifications(cursor);
			const known = new Set(items.map((item) => item.id));
			items = [...items, ...page.items.filter((item) => !known.has(item.id))];
			cursor = page.cursor;
		} catch {
			moreError = m.notifFetchFailed();
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		if (!active) return;
		untrack(() => void reload());
	});
	$effect(() => {
		void refreshToken;
		if (untrack(() => active && loaded)) untrack(() => void reload());
	});
	onMount(() =>
		startVisiblePolling(
			() => {
				if (active) void reload();
			},
			60_000,
			{ onReturn: true },
		),
	);

	const suffix = (item: BskyNotificationView) =>
		item.reason === 'reply'
			? m.notifRepliedSuffix()
			: item.reason === 'mention'
				? m.notifMentionedSuffix()
				: item.reason === 'quote'
					? m.bskyNotifQuotedSuffix()
					: item.reason === 'like'
						? m.bskyNotifLikedSuffix()
						: item.reason === 'repost'
							? m.bskyNotifRepostedSuffix()
							: m.bskyNotifFollowedSuffix();

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

	const conversationOf = (item: BskyNotificationView) =>
		item.post ? bskyConversations([{ key: item.post.uri, post: item.post }])[0] : undefined;
</script>

{#snippet head(item: BskyNotificationView)}
	<div class="notification-head">
		<span class="what"
			><strong>{item.actor.displayName ?? item.actor.handle}</strong>{suffix(item)}</span
		>
		<time class="when" datetime={item.createdAt}>{relativeTime(item.createdAt)}</time>
	</div>
{/snippet}

{#if granted === false}
	<div class="state bsky-permission">
		<p>{m.bskyNotifNeedsPermission()}</p>
		<Button variant="secondary" type="button" onclick={() => (permissionPrompt = true)}
			>{m.crosspostReauthSubmit()}</Button
		>
	</div>
{:else if error}
	<div class="state error">{error}</div>
{:else if !loaded || !moderation}
	<Spinner />
{:else if !visible.length}
	<div class="state">{m.notifEmpty()}</div>
{:else}
	{#each visible as item (item.id)}
		{@const display = item.post
			? bskyPostDisplay(item.post.raw, moderation, { isAdult: ageAssurance.isAdult })
			: undefined}
		<div class="notification card bsky-notification" class:unread={!item.isRead}>
			<a
				class="avatar-link"
				href={item.actor.profileUrl}
				target="_blank"
				rel="noopener noreferrer"
				title={item.actor.displayName ?? item.actor.handle}
				><Avatar actor={item.actor} size="small" /></a
			>
			{#if item.post}
				<button
					type="button"
					class="notification-main bsky-notification-main"
					aria-expanded={expanded === item.id}
					onclick={() => (expanded = expanded === item.id ? undefined : item.id)}
				>
					{@render head(item)}
					<p class="notification-subject">
						{display?.warnContent ? m.contentWarningNotification() : item.post.text}
					</p>
				</button>
			{:else if item.reason === 'follow'}
				<a
					class="notification-main"
					href={item.actor.profileUrl}
					target="_blank"
					rel="noopener noreferrer">{@render head(item)}</a
				>
			{:else}
				<div class="notification-main">{@render head(item)}</div>
			{/if}
		</div>
		{#if expanded === item.id}
			{@const conversation = conversationOf(item)}
			{#if conversation}
				<div class="bsky-notification-thread">
					<BskyThreadUnit thread={conversation} {moderation} loadThread={getBskyThread} />
				</div>
			{/if}
		{/if}
	{/each}
	<InfiniteScroll hasMore={Boolean(cursor)} {loading} error={moreError} onload={() => loadMore()} />
{/if}

{#if permissionPrompt}<BskyPermissionDialog onclose={() => (permissionPrompt = false)} />{/if}

<style>
	.bsky-notification-main {
		display: block;
		width: 100%;
		padding: 0;
		border: 0;
		background: none;
		color: inherit;
		font: inherit;
		text-align: left;
		cursor: pointer;
	}
	.bsky-notification-main::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: 0;
	}
	.bsky-notification-thread {
		margin: -4px 0 8px;
	}
	.bsky-permission {
		display: grid;
		justify-items: center;
		gap: 10px;
	}
</style>
