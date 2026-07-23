<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { APPVIEW_URL, getChannel, getChannelTimeline } from '$lib/api/appview';
	import { deleteChannel } from '$lib/atproto/records';
	import { Feed } from '$lib/feed/feed.svelte';
	import type { ChannelView } from '$lib/api/types';
	import ThreadUnit from '$lib/components/ThreadUnit.svelte';
	import Composer from '$lib/components/Composer.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import { m, relativeTime } from '$lib/i18n/i18n.svelte';

	const CHANNEL = 'com.suibari.nagi.channel';
	let did = $derived(page.params.did);
	let rkey = $derived(page.params.rkey);
	let uri = $derived(`at://${did}/${CHANNEL}/${rkey}`);

	let channel = $state<ChannelView>();
	let headError = $state('');
	let feed = $state<Feed>();

	// CH の投稿は channelOnly でも CH TL には出るので、楽観フィルタは掛けない。
	// 閲覧は未認証（AppView 直読み）なのでセッション復元を待つ必要はない。
	let currentUri = $state('');
	$effect(() => {
		if (uri !== currentUri) {
			currentUri = uri;
			channel = undefined;
			headError = '';
			const target = uri;
			getChannel(target)
				.then((res) => {
					if (target === currentUri) channel = res.channel;
				})
				.catch((e) => {
					if (target === currentUri)
						headError = e instanceof Error ? e.message : m.loadFailed();
				});
			feed = new Feed((cursor) => getChannelTimeline(target, cursor));
			feed.load();
		}
	});

	let isOwner = $derived(Boolean($session && channel && channel.did === $session.did));
	let composerChannel = $derived(channel ? { uri: channel.uri, cid: channel.cid, name: channel.name } : undefined);
	const resolve = (url?: string) => (url?.startsWith('/') ? APPVIEW_URL + url : url);

	let deleteOpen = $state(false);
	let deleting = $state(false);
	let deleteError = $state('');
	async function removeChannel() {
		if (deleting || !rkey) return;
		deleting = true;
		deleteError = '';
		try {
			await deleteChannel(rkey);
			deleteOpen = false;
			await goto('/channels');
		} catch (e) {
			deleteError = e instanceof Error ? e.message : m.channelDeleteFailed();
		} finally {
			deleting = false;
		}
	}

	onMount(() => {
		const base = setInterval(() => {
			if (document.visibilityState === 'visible') feed?.refresh();
		}, 30_000);
		return () => clearInterval(base);
	});
</script>

<section class="channel-header">
	<a class="settings-back" href="/channels">← {m.channelsTitle()}</a>
	{#if channel}
		<div class="channel-hero">
			<span class="channel-card-media">
				{#if channel.banner}<img src={resolve(channel.banner)} alt={m.channelBannerAlt()} />{/if}
			</span>
			<h1 class="channel-card-name">{channel.name}</h1>
			{#if isOwner}
				<button
					class="channel-hero-delete"
					type="button"
					aria-label={m.channelDelete()}
					title={m.channelDelete()}
					onclick={() => (deleteOpen = true)}><Icon name="trash" size={18} /></button
				>
			{/if}
			<span class="channel-card-foot">
				{#if channel.description}<span class="channel-card-desc">{channel.description}</span>{/if}
				<span class="channel-card-updated"
					>{m.channelUpdatedAt({ time: relativeTime(channel.lastPostAt ?? channel.createdAt) })}</span
				>
			</span>
		</div>
	{:else if headError}
		<p class="error">{headError}</p>
	{/if}
</section>

{#if $session}
	<Composer channel={composerChannel} onposted={() => feed?.refresh()} />
{/if}

<section class="timeline" aria-busy={feed?.loading}>
	{#if feed}
		{#if feed.loading && !feed.visibleItems.length}
			<div class="timeline-loading" role="status" aria-label={m.feedWaiting()}>
				<span class="spinner" aria-hidden="true"></span>
			</div>
		{:else if feed.error && !feed.visibleItems.length}
			<div class="state error">
				{feed.error}<button
					class="icon-action"
					type="button"
					aria-label={m.retry()}
					title={m.retry()}
					onclick={() => feed?.load()}><Icon name="refresh" size={18} /></button
				>
			</div>
		{:else if !feed.visibleItems.length}
			<div class="state">{m.channelTimelineEmpty()}</div>
		{:else}
			{#each feed.visibleItems as item (item.uri)}
				<ThreadUnit
					{item}
					botActor={feed.botActor}
					ondeleted={(u) => feed?.removePost(u)}
					onposted={() => feed?.refresh()}
				/>
			{/each}
			{#if feed.hasMore}
				<button
					class="more icon-action"
					type="button"
					aria-label={m.loadMore()}
					title={m.loadMore()}
					onclick={() => feed?.loadMore()}><Icon name="more" size={20} /></button
				>
			{/if}
		{/if}
	{/if}
</section>

{#if deleteOpen}
	<div class="draft-backdrop" role="presentation">
		<div class="draft-dialog draft-confirm" role="dialog" aria-modal="true">
			<h2>{m.channelDeleteTitle()}</h2>
			<p>{m.channelDeleteConfirmation()}</p>
			{#if deleteError}<p class="error">{deleteError}</p>{/if}
			<div class="delete-actions">
				<button type="button" class="ghost" onclick={() => (deleteOpen = false)}>{m.cancel()}</button
				>
				<button type="button" class="danger" disabled={deleting} onclick={removeChannel}
					>{deleting ? m.channelDeleting() : m.channelDeleteConfirm()}</button
				>
			</div>
		</div>
	</div>
{/if}
