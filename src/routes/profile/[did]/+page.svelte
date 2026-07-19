<script lang="ts">
	import { page } from '$app/state';
	import { getProfile } from '$lib/api/appview';
	import type { ProfileDetail, ProfileFeedFilter } from '$lib/api/types';
	import { Feed } from '$lib/feed/feed.svelte';
	import ThreadUnit from '$lib/components/ThreadUnit.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import { m, dateLocale } from '$lib/i18n/i18n.svelte';

	const tabs: Array<{ id: ProfileFeedFilter; label: () => string }> = [
		{ id: 'posts', label: m.profileTabPosts },
		{ id: 'replies', label: m.profileTabReplies },
		{ id: 'media', label: m.profileTabMedia },
		{ id: 'reactions', label: m.profileTabReactions },
	];
	let did = $derived(page.params.did ?? '');
	let tab = $state<ProfileFeedFilter>('posts');
	let profile = $state<ProfileDetail>();
	// per-(did, tab) feed cache so switching tabs back doesn't refetch
	const feeds = new Map<string, Feed>();
	let feed = $state<Feed>();
	$effect(() => {
		void did;
		profile = undefined;
		tab = 'posts';
	});
	$effect(() => {
		const actor = did;
		const filter = tab;
		if (!actor) return;
		const key = `${actor}:${filter}`;
		let f = feeds.get(key);
		if (!f) {
			f = new Feed((cursor) =>
				getProfile(actor, { filter, cursor }).then((r) => {
					profile = r.profile;
					return r.feed;
				}),
			);
			feeds.set(key, f);
			void f.load();
		}
		feed = f;
	});
	const joined = $derived(
		profile?.joinedAt
			? new Date(profile.joinedAt).toLocaleDateString(dateLocale(), {
					year: 'numeric',
					month: 'long',
				})
			: undefined,
	);
	function postDeleted(uri: string) {
		for (const cachedFeed of feeds.values()) cachedFeed.removePost(uri);
	}
</script>

{#if feed?.error && !profile}
	<div class="state error">{feed.error}</div>
{:else}
	<header class="profile-header card">
		<div class="top">
			<Avatar actor={profile} size="large" />
			<div class="names">
				<h1>{profile?.displayName ?? profile?.handle ?? did}</h1>
				<span class="handle">@{profile?.handle ?? did}</span>
			</div>
			{#if $session?.did === did}<a class="edit" href="/settings">{m.profileEdit()}</a>{/if}
		</div>
		{#if profile?.description}<p class="description">{profile.description}</p>{/if}
		<div class="profile-stats">
			<span
				><strong>{profile?.postCount ?? 0}</strong>
				{m.profilePostsUnit({ count: profile?.postCount ?? 0 })}</span
			>
			{#if joined}<span>{m.profileJoinedSince({ date: joined })}</span>{/if}
		</div>
	</header>
	<nav class="profile-tabs" aria-label={m.profileTabsAria()}>
		{#each tabs as t (t.id)}
			<button
				class:active={tab === t.id}
				aria-current={tab === t.id ? 'page' : undefined}
				onclick={() => (tab = t.id)}>{t.label()}</button
			>
		{/each}
	</nav>
	<section class="timeline" aria-busy={feed?.loading}>
		{#if !feed || (feed.loading && !feed.items.length)}<div class="state">{m.loading()}</div>
		{:else if feed.error && !feed.items.length}<div class="state error">
				{feed.error}<button onclick={() => feed?.load()}>{m.retry()}</button>
			</div>
		{:else if !feed.items.length}<div class="state">
				{tab === 'reactions' ? m.profileEmptyReactions() : m.profileEmptyPosts()}
			</div>
		{:else}{#each feed.items as item (item.uri)}<ThreadUnit
					{item}
					ondeleted={postDeleted}
					onposted={() => feed?.refresh()}
				/>{/each}{#if feed.hasMore}
				<button class="more" onclick={() => feed?.loadMore()}>{m.loadMore()}</button>{/if}{/if}
	</section>
{/if}
