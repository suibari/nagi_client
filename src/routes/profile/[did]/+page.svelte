<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { getProfile } from '$lib/api/appview';
	import type { ProfileDetail, ProfileFeedFilter } from '$lib/api/types';
	import { Feed } from '$lib/feed/feed.svelte';
	import {
		isNewsReactionItem,
		ProfileReactionFeed,
		reactionItemUri,
	} from '$lib/profile/reaction-feed.svelte';
	import ThreadUnit from '$lib/components/ThreadUnit.svelte';
	import NewsCard from '$lib/components/NewsCard.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import BusinessCardDialog from '$lib/components/BusinessCardDialog.svelte';
	import { cardFromProfile } from '$lib/card/data';
	import { browser } from '$app/environment';
	import ActorBadges from '$lib/components/ActorBadges.svelte';
	import DiaryCalendar from '$lib/components/DiaryCalendar.svelte';
	import CardCollection from '$lib/components/CardCollection.svelte';
	import ProfileAppLinks from '$lib/components/ProfileAppLinks.svelte';
	import ProfileDescription from '$lib/components/ProfileDescription.svelte';
	import ProfileWebsiteCard from '$lib/components/ProfileWebsiteCard.svelte';
	import InfiniteScroll from '$lib/components/InfiniteScroll.svelte';
	import { actorBadges } from '$lib/badges/badges';
	import Icon from '$lib/components/shell/Icon.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import { m, dateLocale, i18n } from '$lib/i18n/i18n.svelte';
	import { onMount } from 'svelte';
	import { optimisticPosts } from '$lib/feed/optimistic-posts.svelte';
	import { mutes } from '$lib/mute/mutes.svelte';
	import { privateList } from '$lib/private-list/private-list.svelte';

	// 日記・カードはポストではないので Feed には載らない。タブだけ同じ並びに足す。
	type ProfileTab = ProfileFeedFilter | 'diary' | 'cards';
	const tabs: Array<{ id: ProfileTab; label: () => string }> = [
		{ id: 'posts', label: m.profileTabPosts },
		{ id: 'replies', label: m.profileTabReplies },
		{ id: 'media', label: m.profileTabMedia },
		{ id: 'reactions', label: m.profileTabReactions },
		{ id: 'diary', label: m.profileTabDiary },
		{ id: 'cards', label: m.profileTabCards },
	];
	let did = $derived(page.params.did ?? '');
	// 通知から ?tab=diary&date=YYYY-MM-DD で該当日を開く。
	const initialDiaryDate = $derived(page.url.searchParams.get('date') ?? undefined);
	let tab = $state<ProfileTab>('posts');
	let profile = $state<ProfileDetail>();
	let muteError = $state('');
	let homeListError = $state('');
	async function toggleMute() {
		if (!profile) return;
		muteError = '';
		try {
			await mutes.toggleActor({
				did,
				handle: profile.handle,
				...(profile.displayName ? { displayName: profile.displayName } : {}),
				...(profile.avatar ? { avatar: profile.avatar } : {}),
			});
		} catch {
			muteError = m.muteUpdateFailed();
		}
	}
	async function toggleHomeList() {
		if (!profile) return;
		homeListError = '';
		try {
			await privateList.toggle({
				did,
				handle: profile.handle,
				...(profile.displayName ? { displayName: profile.displayName } : {}),
				...(profile.avatar ? { avatar: profile.avatar } : {}),
			});
		} catch {
			homeListError = m.homeListUpdateFailed();
		}
	}
	// per-(did, tab) feed cache so switching tabs back doesn't refetch
	const feeds = new Map<string, Feed>();
	const reactionFeeds = new Map<string, ProfileReactionFeed>();
	let feed = $state<Feed>();
	let reactionFeed = $state<ProfileReactionFeed>();
	$effect(() => {
		void did;
		profile = undefined;
		feed = undefined;
		reactionFeed = undefined;
		const requested = page.url.searchParams.get('tab');
		tab = requested === 'diary' || requested === 'cards' ? requested : 'posts';
	});
	$effect(() => {
		const actor = did;
		const locale = i18n.locale;
		// 日記・カードタブでもプロフィール欄は要るので、投稿フィードは読んでおく。
		const filter: ProfileFeedFilter = tab === 'diary' || tab === 'cards' ? 'posts' : tab;
		if (!actor) return;
		if (filter === 'reactions') {
			const key = `${actor}:reactions:${locale}`;
			let f = reactionFeeds.get(key);
			if (!f) {
				f = new ProfileReactionFeed((cursor) =>
					getProfile(actor, { filter, cursor, lang: locale }).then((response) => {
						if (actor !== response.profile.did)
							void goto(`/profile/${encodeURIComponent(response.profile.did)}${page.url.search}`, {
								replaceState: true,
								noScroll: true,
								keepFocus: true,
							});
						profile = response.profile;
						optimisticPosts.rememberActor(response.profile);
						return response.feed;
					}),
				);
				reactionFeeds.set(key, f);
				void f.load();
			}
			reactionFeed = f;
			return;
		}
		const key = `${actor}:${filter}:${locale}`;
		let f = feeds.get(key);
		if (!f) {
			f = new Feed(
				(cursor) =>
					getProfile(actor, { filter, cursor, lang: locale }).then((r) => {
						if (actor !== r.profile.did)
							void goto(`/profile/${encodeURIComponent(r.profile.did)}${page.url.search}`, {
								replaceState: true,
								noScroll: true,
								keepFocus: true,
							});
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
	// 名刺はヘッダーに並べず、アバターを押して開くモーダルに入れる。
	// アバター・表示名・ハンドルはプロフィール上部と丸ごと重複するので、
	// 常時出すとヘッダーが同じ情報で縦に伸びるだけになる。
	const cardData = $derived(browser ? cardFromProfile(profile, location.origin) : undefined);
	let cardDialogOpen = $state(false);
	const joined = $derived(
		profile?.joinedAt
			? new Date(profile.joinedAt).toLocaleDateString(dateLocale(), {
					year: 'numeric',
					month: 'long',
					day: 'numeric',
				})
			: undefined,
	);
	function postDeleted(uri: string) {
		for (const cachedFeed of feeds.values()) cachedFeed.removePost(uri);
		for (const cachedFeed of reactionFeeds.values()) cachedFeed.removePost(uri);
	}
	onMount(() => {
		const timer = setInterval(() => {
			if (document.visibilityState === 'visible' && feed?.hasOptimistic()) void feed.refresh();
		}, 3_000);
		return () => clearInterval(timer);
	});
</script>

{#if (tab === 'reactions' ? reactionFeed?.error : feed?.error) && !profile}
	<div class="state error">{tab === 'reactions' ? reactionFeed?.error : feed?.error}</div>
{:else}
	<header class="profile-header card">
		<div class="top">
			{#if cardData}
				<!-- 名刺があることは、アバターの周りを回る光で示す。押すと名刺が開く。 -->
				<button
					type="button"
					class="avatar-card-button"
					aria-label={m.nameCardOpenAria()}
					onclick={() => (cardDialogOpen = true)}
				>
					<Avatar actor={profile} size="large" />
				</button>
			{:else}
				<Avatar actor={profile} size="large" />
			{/if}
			<div class="names">
				<h1>{profile?.displayName ?? profile?.handle ?? did}</h1>
				<span class="handle">@{profile?.handle ?? did}</span>
				{#if badges.length}
					<div class="profile-badges"><ActorBadges actor={profile} /></div>
				{/if}
			</div>
			{#if $session?.did === did}
				<a class="edit" href="/settings/profile">{m.profileEdit()}</a>
			{:else if $session && profile}
				<div class="profile-actions">
					{#if privateList.loaded && !profile.isBot}
						<button
							type="button"
							class="edit"
							disabled={privateList.isPending(did) ||
								(!privateList.has(did) && privateList.members.length >= privateList.limit)}
							onclick={() => void toggleHomeList()}
						>
							{privateList.has(did) ? m.homeListRemove() : m.homeListAdd()}
						</button>
					{/if}
					<!-- ミュートしても、このプロフィールの投稿は今までどおり見える（自分で開いたので）。
					     効くのはTL・検索・通知のほう。 -->
					<button
						type="button"
						class="edit"
						disabled={mutes.isPending(did)}
						onclick={() => void toggleMute()}
					>
						{mutes.hasActor(did) ? m.unmuteUser() : m.muteUser()}
					</button>
				</div>
			{/if}
		</div>
		{#if muteError}<p class="mute-error" role="alert">{muteError}</p>{/if}
		{#if homeListError}<p class="mute-error" role="alert">{homeListError}</p>{/if}
		{#if privateList.has(did) && mutes.hasActor(did)}
			<p class="muted home-list-note">{m.homeListMutedNote()}</p>
		{/if}
		{#if privateList.loaded && !privateList.has(did) && privateList.members.length >= privateList.limit}
			<p class="muted home-list-note">{m.homeListLimitReached()}</p>
		{/if}
		{#if profile?.description}<ProfileDescription text={profile.description} />{/if}
		<div class="profile-stats">
			<span
				><strong>{profile?.postCount ?? 0}</strong>
				{m.profilePostsUnit({ count: profile?.postCount ?? 0 })}</span
			>
			{#if joined}<span>{m.profileJoinedSince({ date: joined })}</span>{/if}
		</div>
		<ProfileWebsiteCard did={profile?.did} />
		<ProfileAppLinks did={profile?.did} />
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
		<section class="timeline">
			<DiaryCalendar {did} initialDate={initialDiaryDate} botActor={feed?.botActor} />
		</section>
	{:else if tab === 'cards'}
		<section class="timeline">
			<CardCollection {did} isSelf={$session?.did === did} />
		</section>
	{:else if tab === 'reactions'}
		<section class="timeline" aria-busy={reactionFeed?.loading}>
			{#if !reactionFeed || (reactionFeed.loading && !reactionFeed.items.length)}
				<div class="state">{m.loading()}</div>
			{:else if reactionFeed.error && !reactionFeed.items.length}
				<div class="state error">
					{reactionFeed.error}<button
						class="icon-action"
						type="button"
						aria-label={m.retry()}
						title={m.retry()}
						onclick={() => reactionFeed?.load()}><Icon name="refresh" size={18} /></button
					>
				</div>
			{:else if !reactionFeed.items.length}
				<div class="state">{m.profileEmptyReactions()}</div>
			{:else}
				{#each reactionFeed.items as item (reactionItemUri(item))}
					{#if isNewsReactionItem(item)}
						<NewsCard news={item.news} botActor={reactionFeed.botActor} />
					{:else}
						<ThreadUnit {item} botActor={reactionFeed.botActor} ondeleted={postDeleted} />
					{/if}
				{/each}
				<InfiniteScroll
					hasMore={reactionFeed.hasMore}
					loading={reactionFeed.loading}
					error={reactionFeed.error}
					onload={() => reactionFeed?.loadMore()}
				/>
			{/if}
		</section>
	{:else}
		<section class="timeline" aria-busy={feed?.loading}>
			{#if !feed || (feed.loading && !feed.visibleItems.length)}<div class="state">
					{m.loading()}
				</div>
			{:else if feed.error && !feed.visibleItems.length}<div class="state error">
					{feed.error}<button
						class="icon-action"
						type="button"
						aria-label={m.retry()}
						title={m.retry()}
						onclick={() => feed?.load()}><Icon name="refresh" size={18} /></button
					>
				</div>
			{:else if !feed.visibleItems.length}<div class="state">{m.profileEmptyPosts()}</div>
			{:else}{#each feed.visibleItems as item (item.uri)}<ThreadUnit
						{item}
						botActor={feed.botActor}
						ondeleted={postDeleted}
						onposted={() => feed?.refresh()}
					/>{/each}<InfiniteScroll
					hasMore={feed.hasMore}
					loading={feed.loading}
					error={feed.error}
					onload={() => feed?.loadMore()}
				/>{/if}
		</section>
	{/if}
{/if}

{#if cardDialogOpen && cardData}
	<BusinessCardDialog
		data={cardData}
		comment={profile?.comment}
		botActor={feed?.botActor ?? reactionFeed?.botActor}
		onclose={() => (cardDialogOpen = false)}
	/>
{/if}
