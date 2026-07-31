<script lang="ts">
	/**
	 * my Nagi — サインイン後の起点。
	 *
	 * 投稿欄より先に「ゆるいつながり」を見せるための画面。投稿は左下／右下の FAB から
	 * ポストモーダルで行う（+layout.svelte に常駐）。
	 *
	 * 情報量が多くなるので、上ほど圧縮・下ほど展開の密度勾配を付けている:
	 * ニュース（1行）→ botたん（3件）→ みんなで全肯定（横カルーセル）→ リスト動向。
	 *
	 * 各セクションは独立して読み込み・失敗する。1本コケても画面全体は落ちない。
	 * 将来の表示/順序カスタマイズを見据え、並びは下の SECTIONS 配列1本で決める。
	 */
	import { onMount } from 'svelte';
	import { getMyNagi, getPositiveNews, getProfile } from '$lib/api/appview';
	import type { ActorView, MyNagiView, NewsView, PostView } from '$lib/api/types';
	import CommunityAffirmationPanel from '$lib/components/CommunityAffirmationPanel.svelte';
	import MainFeed from '$lib/components/MainFeed.svelte';
	import MyNagiPostRow from '$lib/components/MyNagiPostRow.svelte';
	import MyNagiSection from '$lib/components/MyNagiSection.svelte';
	import NewsTicker from '$lib/components/NewsTicker.svelte';
	import { i18n, m } from '$lib/i18n/i18n.svelte';
	import { unreadNews } from '$lib/news/unread.svelte';
	import { oauthReady, session } from '$lib/oauth/session.svelte';

	const NEWS_COUNT = 5;
	const BOT_POST_COUNT = 3;
	const LIST_COUNT = 6;

	let news = $state<NewsView[]>([]);
	let newsLoading = $state(true);
	let newsError = $state('');

	let botPosts = $state<PostView[]>([]);
	let botActor = $state<ActorView>();
	let botLoading = $state(true);
	let botError = $state('');

	let listActivity = $state<MyNagiView>({ listUsers: [], channels: [] });
	let listLoading = $state(true);
	let listError = $state('');

	// 開くのは画面全体で1件だけ。縦に伸び続けて現在地を見失うのを防ぐ。
	let openPostUri = $state<string>();
	const isOpen = (uri: string) => openPostUri === uri;
	const setOpen = (uri: string, open: boolean) => (openPostUri = open ? uri : undefined);

	const message = (cause: unknown) =>
		cause instanceof Error ? cause.message : m.loadFailed();
	// at://<did>/<collection>/<rkey> → /channels/<did>/<rkey>
	const channelHref = (uri: string) => {
		const rest = uri.slice('at://'.length).split('/');
		return `/channels/${rest[0]}/${rest[2]}`;
	};

	async function loadNews() {
		newsLoading = true;
		newsError = '';
		try {
			const page = await getPositiveNews(i18n.locale);
			news = page.items.slice(0, NEWS_COUNT);
			botActor ??= page.botActor;
		} catch (cause) {
			newsError = message(cause);
		} finally {
			newsLoading = false;
		}
	}

	async function loadBotPosts() {
		botLoading = true;
		botError = '';
		try {
			// botたん専用のエンドポイントは要らない。getProfile の filter=posts が
			// SQL レベルで返信を除くので、トップレベル投稿だけが返る。
			const did = botActor?.did;
			if (!did) {
				botPosts = [];
				return;
			}
			const profile = await getProfile(did, {
				filter: 'posts',
				limit: BOT_POST_COUNT,
				lang: i18n.locale,
			});
			botPosts = profile.feed.items.slice(0, BOT_POST_COUNT);
		} catch (cause) {
			botError = message(cause);
		} finally {
			botLoading = false;
		}
	}

	async function loadListActivity() {
		listLoading = true;
		listError = '';
		try {
			listActivity = await getMyNagi(LIST_COUNT);
		} catch (cause) {
			listError = message(cause);
		} finally {
			listLoading = false;
		}
	}

	function loadAll() {
		void loadNews().then(loadBotPosts);
		void loadListActivity();
	}

	onMount(() => {
		if ($session) loadAll();
	});

	let loadedFor = $state<string | undefined>(undefined);
	$effect(() => {
		if (!$oauthReady) return;
		const key = `${$session?.did ?? 'guest'}:${i18n.locale}`;
		if (key === loadedFor) return;
		loadedFor = key;
		if ($session) loadAll();
	});
</script>

{#if !$oauthReady}
	<div class="timeline-loading" role="status" aria-label={m.loading()}>
		<span class="spinner" aria-hidden="true"></span>
	</div>
{:else if !$session}
	<!-- サインアウト時は従来どおりグローバルTLとヒーローを見せる（公開ランディング）。 -->
	<MainFeed mode="global" />
{:else}
	<h1 class="my-nagi-title">{m.navMyNagi()}</h1>

	<MyNagiSection
		title={m.navNews()}
		icon="newspaper"
		moreHref="/news"
		loading={newsLoading}
		error={newsError}
		empty={!news.length}
		unread={$unreadNews}
		unreadLabel={m.newsUnreadAria()}
		onretry={loadNews}
	>
		<NewsTicker items={news} {botActor} />
	</MyNagiSection>

	<MyNagiSection
		title={m.myNagiBotTitle()}
		icon="bot"
		moreHref={botActor ? `/profile/${botActor.did}` : undefined}
		loading={botLoading}
		error={botError}
		empty={!botPosts.length}
		onretry={loadBotPosts}
	>
		{#each botPosts as post (post.uri)}
			<MyNagiPostRow
				{post}
				{botActor}
				open={isOpen(post.uri)}
				onopenchange={(open) => setOpen(post.uri, open)}
			/>
		{/each}
	</MyNagiSection>

	<CommunityAffirmationPanel />

	<MyNagiSection
		title={m.myNagiListTitle()}
		icon="user"
		moreHref="/feed"
		loading={listLoading}
		error={listError}
		empty={!listActivity.listUsers.length}
		onretry={loadListActivity}
	>
		{#snippet emptyState()}
			<p class="my-nagi-state">
				{m.myNagiListEmpty()}
				<a href="/settings/home-list">{m.myNagiListEmptyCta()}</a>
			</p>
		{/snippet}
		{#each listActivity.listUsers as entry (entry.post.uri)}
			<MyNagiPostRow
				post={entry.post}
				actor={entry.actor}
				{botActor}
				open={isOpen(entry.post.uri)}
				onopenchange={(open) => setOpen(entry.post.uri, open)}
			/>
		{/each}
	</MyNagiSection>

	<MyNagiSection
		title={m.myNagiChannelsTitle()}
		icon="hash"
		moreHref="/channels"
		loading={listLoading}
		error={listError}
		empty={!listActivity.channels.length}
		onretry={loadListActivity}
	>
		{#snippet emptyState()}
			<p class="my-nagi-state">
				{m.myNagiChannelsEmpty()}
				<a href="/channels">{m.myNagiChannelsEmptyCta()}</a>
			</p>
		{/snippet}
		{#each listActivity.channels as entry (entry.post.uri)}
			<a class="my-nagi-channel-link" href={channelHref(entry.channel.uri)}
				>#{entry.channel.name}</a
			>
			<MyNagiPostRow
				post={entry.post}
				{botActor}
				open={isOpen(entry.post.uri)}
				onopenchange={(open) => setOpen(entry.post.uri, open)}
			/>
		{/each}
	</MyNagiSection>
{/if}

<style>
	.my-nagi-title {
		margin: 0 0 12px;
		font-size: 1.1rem;
		font-weight: 800;
	}

	.my-nagi-state {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
		margin: 0;
		padding: 12px 4px;
		color: var(--text-muted);
		font-size: 12px;
		line-height: 1.55;
	}

	.my-nagi-state a {
		color: var(--accent-strong);
		font-weight: 700;
	}

	.my-nagi-channel-link {
		display: block;
		padding: 8px 4px 0;
		color: var(--accent-strong);
		font-size: 0.76rem;
		font-weight: 800;
		text-decoration: none;
	}

	.my-nagi-channel-link:hover {
		text-decoration: underline;
	}
</style>
