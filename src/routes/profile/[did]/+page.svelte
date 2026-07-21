<script lang="ts">
	import { page } from '$app/state';
	import { getProfile } from '$lib/api/appview';
	import type { ProfileDetail, ProfileFeedFilter } from '$lib/api/types';
	import { Feed } from '$lib/feed/feed.svelte';
	import ThreadUnit from '$lib/components/ThreadUnit.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import ActorBadges from '$lib/components/ActorBadges.svelte';
	import DiaryCalendar from '$lib/components/DiaryCalendar.svelte';
	import { actorBadges } from '$lib/badges/badges';
	import Icon from '$lib/components/shell/Icon.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import { m, dateLocale } from '$lib/i18n/i18n.svelte';
	import { onMount } from 'svelte';
	import { optimisticPosts } from '$lib/feed/optimistic-posts.svelte';

	// 日記はポストではないので Feed には載らない。タブだけ同じ並びに足す。
	type ProfileTab = ProfileFeedFilter | 'diary';
	const tabs: Array<{ id: ProfileTab; label: () => string }> = [
		{ id: 'posts', label: m.profileTabPosts },
		{ id: 'replies', label: m.profileTabReplies },
		{ id: 'media', label: m.profileTabMedia },
		{ id: 'reactions', label: m.profileTabReactions },
		{ id: 'diary', label: m.profileTabDiary },
	];
	let did = $derived(page.params.did ?? '');
	// 通知から ?tab=diary&date=YYYY-MM-DD で該当日を開く。
	const initialDiaryDate = $derived(page.url.searchParams.get('date') ?? undefined);
	let tab = $state<ProfileTab>('posts');
	let profile = $state<ProfileDetail>();
	// per-(did, tab) feed cache so switching tabs back doesn't refetch
	const feeds = new Map<string, Feed>();
	let feed = $state<Feed>();
	$effect(() => {
		void did;
		profile = undefined;
		tab = page.url.searchParams.get('tab') === 'diary' ? 'diary' : 'posts';
	});
	$effect(() => {
		const actor = did;
		// 日記タブでもプロフィール欄は要るので、投稿フィードは読んでおく。
		const filter: ProfileFeedFilter = tab === 'diary' ? 'posts' : tab;
		if (!actor) return;
		const key = `${actor}:${filter}`;
		let f = feeds.get(key);
		if (!f) {
			f = new Feed(
				(cursor) =>
					getProfile(actor, { filter, cursor }).then((r) => {
						profile = r.profile;
						optimisticPosts.rememberActor(r.profile);
						return r.feed;
					}),
				(item) => {
					if (item.author.did !== actor) return false;
					if (filter === 'posts') return !item.reply;
					if (filter === 'replies') return Boolean(item.reply);
					if (filter === 'media') return Boolean(item.images?.length);
					return false;
				},
			);
			feeds.set(key, f);
			void f.load();
		}
		feed = f;
	});
	const badges = $derived(actorBadges(profile));
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
	onMount(() => {
		const timer = setInterval(() => {
			if (document.visibilityState === 'visible' && feed?.hasOptimistic()) void feed.refresh();
		}, 3_000);
		return () => clearInterval(timer);
	});
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
				{#if badges.length}
					<div class="profile-badges"><ActorBadges actor={profile} /></div>
				{/if}
			</div>
			{#if $session?.did === did}<a class="edit" href="/settings/profile">{m.profileEdit()}</a>{/if}
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
	{#if tab === 'diary'}
		<section class="timeline"><DiaryCalendar {did} initialDate={initialDiaryDate} /></section>
	{:else}
	<section class="timeline" aria-busy={feed?.loading}>
		{#if !feed || (feed.loading && !feed.visibleItems.length)}<div class="state">{m.loading()}</div>
		{:else if feed.error && !feed.visibleItems.length}<div class="state error">
				{feed.error}<button
					class="icon-action"
					type="button"
					aria-label={m.retry()}
					title={m.retry()}
					onclick={() => feed?.load()}><Icon name="refresh" size={18} /></button
				>
			</div>
		{:else if !feed.visibleItems.length}<div class="state">
				{tab === 'reactions' ? m.profileEmptyReactions() : m.profileEmptyPosts()}
			</div>
		{:else}{#each feed.visibleItems as item (item.uri)}<ThreadUnit
					{item}
					botActor={feed.botActor}
					ondeleted={postDeleted}
					onposted={() => feed?.refresh()}
				/>{/each}{#if feed.hasMore}
				<button
					class="more icon-action"
					type="button"
					aria-label={m.loadMore()}
					title={m.loadMore()}
					onclick={() => feed?.loadMore()}><Icon name="more" size={20} /></button
				>{/if}{/if}
	</section>
	{/if}
{/if}
