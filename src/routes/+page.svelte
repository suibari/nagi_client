<script lang="ts">
	/**
	 * my Nagi — Nagi の起点。公開部分はサインイン前にも見せる。
	 *
	 * パーソナルな全肯定を起点に、内部のつながりから外部の話題へ段階的に広げる:
	 * botたん（1件）→ みんなで全肯定 → 全肯定ニュース → リスト動向。
	 * 投稿は左下／右下の FAB からポストモーダルで行う（+layout.svelte に常駐）。
	 *
	 * 各セクションは独立して読み込み・失敗する。1本コケても画面全体は落ちない。
	 * 表示順は下のセクション配置で明示する。
	 */
	import { getMyNagi, getPositiveNews, getProfile, getThread } from '$lib/api/appview';
	import type { ActorView, MyNagiView, NewsView, PostView } from '$lib/api/types';
	import CarouselArrows from '$lib/components/CarouselArrows.svelte';
	import CardDrawEntry from '$lib/components/CardDrawEntry.svelte';
	import CommunityAffirmationPanel from '$lib/components/CommunityAffirmationPanel.svelte';
	import MyNagiNewsCarousel from '$lib/components/MyNagiNewsCarousel.svelte';
	import MyNagiSection from '$lib/components/MyNagiSection.svelte';
	import ThreadUnit from '$lib/components/ThreadUnit.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';
	import { i18n, m } from '$lib/i18n/i18n.svelte';
	import {
		latestIncludedPostPosition,
		latestReadPosition,
		openMyNagiUnreadView,
		readLatest,
	} from '$lib/my-nagi/unread.svelte';
	import { openNewsUnreadView, previewUnreadNews } from '$lib/news/unread.svelte';
	import { oauthReady, session } from '$lib/oauth/session.svelte';
	import { threadToConversationItem } from '$lib/thread/conversation';
	import type { UnreadView } from '$lib/unread/watermark.svelte';
	import { onMount, untrack } from 'svelte';
	import { pageRefresh } from '$lib/components/shell/nav';
	import { startVisiblePolling } from '$lib/polling';

	const NEWS_COUNT = 5;
	const BOT_POST_COUNT = 1;
	const LIST_COUNT = 6;

	let news = $state<NewsView[]>([]);
	let newsLoading = $state(true);
	let newsError = $state('');
	let newsUnread = $state(false);
	let newsUnreadView: UnreadView | undefined;

	let botPosts = $state<PostView[]>([]);
	let botActor = $state<ActorView>();
	let botLoading = $state(true);
	let botError = $state('');
	let botUnread = $state(false);
	let botUnreadView: UnreadView | undefined;

	let listActivity = $state<MyNagiView>({ listUsers: [], channels: [] });
	let listLoading = $state(true);
	let listError = $state('');
	let listUnread = $state(false);
	let channelsUnread = $state(false);
	let listUnreadView: UnreadView | undefined;
	let channelsUnreadView: UnreadView | undefined;
	let newsCarousel = $state<{
		scrollPrevious: () => void;
		scrollNext: () => void;
	}>();
	let newsCarouselState = $state({ canPrevious: false, canNext: false });

	// APIも新着順だが、表示境界でも時系列を保証し、リスト登録順には依存させない。
	const newestFirst = <T extends { post: PostView }>(a: T, b: T) =>
		new Date(b.post.createdAt).getTime() - new Date(a.post.createdAt).getTime() ||
		b.post.uri.localeCompare(a.post.uri);
	let listUsersByRecency = $derived([...listActivity.listUsers].sort(newestFirst));
	let channelsByRecency = $derived([...listActivity.channels].sort(newestFirst));

	const message = (cause: unknown) => (cause instanceof Error ? cause.message : m.loadFailed());
	function showBotPosts(items: PostView[], unreadView = botUnreadView) {
		botPosts = items;
		botUnread = readLatest(unreadView, latestIncludedPostPosition(items));
	}

	/**
	 * 定期・復帰時の取り直しでは、すでに出ている内容を消さない。ローディング表示を
	 * 出し直すと60秒ごとに画面がちらつき、失敗するたびに読めていた内容が消えてしまう。
	 */
	async function loadNews() {
		const activeUnreadView = newsUnreadView;
		newsLoading = news.length === 0;
		newsError = '';
		try {
			const page = await getPositiveNews(i18n.locale);
			news = page.items.slice(0, NEWS_COUNT);
			newsUnread = previewUnreadNews(
				activeUnreadView,
				latestReadPosition(news, (item) => ({
					indexedAt: item.indexedAt,
					uri: item.uri,
				})),
			);
			botActor ??= page.botActor;
		} catch (cause) {
			if (!news.length) newsError = message(cause);
		} finally {
			newsLoading = false;
		}
	}

	async function loadBotPosts() {
		const activeUnreadView = botUnreadView;
		botLoading = botPosts.length === 0;
		botError = '';
		try {
			// 最新のトップレベル投稿を代表にしつつ、通常タイムラインと同じ会話単位で返信を含める。
			const did = botActor?.did;
			if (!did) {
				showBotPosts([], activeUnreadView);
				return;
			}
			const profile = await getProfile(did, {
				filter: 'posts',
				limit: BOT_POST_COUNT,
				lang: i18n.locale,
				group: true,
			});
			const latest = profile.feed.items[0];
			if (!latest) {
				showBotPosts([], activeUnreadView);
				return;
			}
			// group をまだ解釈しない稼働中 AppView でも、返信を欠落させずに表示する。
			if (!latest.conversation) {
				try {
					const { thread } = await getThread(latest.uri);
					botActor ??= thread.botActor;
					showBotPosts([threadToConversationItem(thread)], activeUnreadView);
					return;
				} catch {
					// スレッド補完だけが失敗した場合も、取得済みの最新投稿自体は表示する。
				}
			}
			showBotPosts([latest], activeUnreadView);
		} catch (cause) {
			if (!botPosts.length) botError = message(cause);
		} finally {
			botLoading = false;
		}
	}

	async function loadListActivity() {
		const activeListUnreadView = listUnreadView;
		const activeChannelsUnreadView = channelsUnreadView;
		const hadContent = listActivity.listUsers.length > 0 || listActivity.channels.length > 0;
		listLoading = !hadContent;
		listError = '';
		try {
			listActivity = await getMyNagi(LIST_COUNT);
			listUnread = readLatest(
				activeListUnreadView,
				latestIncludedPostPosition(listActivity.listUsers.map(({ post }) => post)),
			);
			channelsUnread = readLatest(
				activeChannelsUnreadView,
				latestIncludedPostPosition(listActivity.channels.map(({ post }) => post)),
			);
		} catch (cause) {
			if (!hadContent) listError = message(cause);
		} finally {
			listLoading = false;
		}
	}

	function loadAll() {
		void loadNews().then(loadBotPosts);
		void loadListActivity();
	}

	function loadPublic() {
		void loadNews().then(loadBotPosts);
		listActivity = { listUsers: [], channels: [] };
		listLoading = false;
		listError = '';
	}

	let loadedFor = $state<string | undefined>(undefined);
	$effect(() => {
		if (!$oauthReady) return;
		const key = `${$session?.did ?? 'guest'}:${i18n.locale}`;
		if (key === loadedFor) return;
		loadedFor = key;
		newsUnread = false;
		botUnread = false;
		listUnread = false;
		channelsUnread = false;
		newsUnreadView = openNewsUnreadView($session?.did);
		// botたんセクションは公開だが、既読はアカウント同期するので DID で分ける。
		botUnreadView = openMyNagiUnreadView('bot', $session?.did);
		listUnreadView = $session ? openMyNagiUnreadView('list', $session.did) : undefined;
		channelsUnreadView = $session ? openMyNagiUnreadView('channels', $session.did) : undefined;
		if ($session) loadAll();
		else loadPublic();
	});
	/**
	 * タブ復帰と60秒ポーリングで各セクションを取り直す。フィードは MainFeed が同じ形で
	 * やっているのに my Nagi だけ無く、戻ってきても中身とドットが古いままだった。
	 * 既読ビューは作り直さない（凍結した基準のまま新着ぶんだけドットが点く）。
	 */
	function reload() {
		if (!loadedFor) return;
		if ($session) loadAll();
		else loadPublic();
	}
	onMount(() => startVisiblePolling(reload, 60_000, { onReturn: true }));
	// ナビの my Nagi をもう一度押したときも開き直す。reload() が読む状態を依存に
	// 取り込まないよう untrack する（取り込むと初回ロードと二重に走る）。
	let refreshHandled = 0;
	$effect(() => {
		const requested = $pageRefresh;
		if (requested === refreshHandled) return;
		refreshHandled = requested;
		untrack(reload);
	});
</script>

{#snippet newsCarouselActions()}
	<CarouselArrows
		previousLabel={m.myNagiNewsScrollPrev()}
		nextLabel={m.myNagiNewsScrollNext()}
		previousDisabled={!newsCarouselState.canPrevious}
		nextDisabled={!newsCarouselState.canNext}
		onprevious={() => newsCarousel?.scrollPrevious()}
		onnext={() => newsCarousel?.scrollNext()}
	/>
{/snippet}

{#if !$oauthReady}
	<div class="timeline-loading" role="status" aria-label={m.loading()}>
		<span class="spinner" aria-hidden="true"></span>
	</div>
{:else}
	<div class="my-nagi-heading">
		<h1 class="my-nagi-title">{m.navMyNagi()}</h1>
		<CardDrawEntry variant="header" />
	</div>

	<MyNagiSection
		title={m.myNagiBotTitle()}
		icon="bot"
		description={m.myNagiBotIntro()}
		moreHref={botActor ? `/profile/${botActor.did}` : undefined}
		loading={botLoading}
		error={botError}
		empty={!botPosts.length}
		unread={botUnread}
		unreadLabel={m.myNagiBotUnreadAria()}
		onretry={loadBotPosts}
	>
		{#if botPosts[0]}
			<div class="my-nagi-bot-card">
				<ThreadUnit item={botPosts[0]} {botActor} />
			</div>
		{/if}
	</MyNagiSection>

	<CommunityAffirmationPanel {botActor} />

	<MyNagiSection
		title={m.myNagiNewsTitle()}
		icon="newspaper"
		description={m.myNagiNewsIntro()}
		loading={newsLoading}
		error={newsError}
		empty={!news.length}
		unread={newsUnread}
		unreadLabel={m.newsUnreadAria()}
		onretry={loadNews}
		headerActions={news.length > 1 ? newsCarouselActions : undefined}
	>
		<MyNagiNewsCarousel
			bind:this={newsCarousel}
			items={news}
			{botActor}
			onscrollstatechange={(state) => (newsCarouselState = state)}
		/>
		<div class="my-nagi-news-footer">
			<a href="/news">{m.myNagiMore()}<Icon name="chevron" size={15} /></a>
		</div>
	</MyNagiSection>

	{#if !$session}
		<section class="my-nagi-signin-panel">
			<div>
				<strong>{m.myNagiGuestTitle()}</strong>
				<span>{m.myNagiGuestBody()}</span>
			</div>
			<a href="/login">{m.login()}</a>
		</section>
	{:else}
		<MyNagiSection
			title={m.myNagiListTitle()}
			icon="user"
			moreHref="/feed"
			loading={listLoading}
			error={listError}
			empty={!listActivity.listUsers.length}
			unread={listUnread}
			unreadLabel={m.myNagiListUnreadAria()}
			onretry={loadListActivity}
		>
			{#snippet emptyState()}
				<p class="my-nagi-state">
					{m.myNagiListEmpty()}
					<a href="/settings/home-list">{m.myNagiListEmptyCta()}</a>
				</p>
			{/snippet}
			{#each listUsersByRecency as entry (entry.post.uri)}
				<div class="my-nagi-activity-card">
					<ThreadUnit item={entry.post} {botActor} />
				</div>
			{/each}
		</MyNagiSection>

		<MyNagiSection
			title={m.myNagiChannelsTitle()}
			icon="hash"
			moreHref="/channels"
			loading={listLoading}
			error={listError}
			empty={!listActivity.channels.length}
			unread={channelsUnread}
			unreadLabel={m.myNagiChannelsUnreadAria()}
			onretry={loadListActivity}
		>
			{#snippet emptyState()}
				<p class="my-nagi-state">
					{m.myNagiChannelsEmpty()}
					<a href="/channels">{m.myNagiChannelsEmptyCta()}</a>
				</p>
			{/snippet}
			{#each channelsByRecency as entry (entry.post.uri)}
				<div class="my-nagi-activity-card">
					<ThreadUnit item={entry.post} {botActor} />
				</div>
			{/each}
		</MyNagiSection>
	{/if}
{/if}

<style>
	.my-nagi-title {
		margin: 0;
		font-size: 1.1rem;
		font-weight: 800;
	}

	.my-nagi-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 12px;
	}

	.my-nagi-bot-card {
		min-width: 0;
		padding: 8px 4px 10px;
	}

	.my-nagi-news-footer {
		display: flex;
		justify-content: flex-end;
		padding: 0 4px 8px;
	}

	.my-nagi-news-footer a {
		display: inline-flex;
		align-items: center;
		gap: 2px;
		color: var(--text-muted);
		font-size: 12px;
		font-weight: 700;
		text-decoration: none;
	}

	.my-nagi-news-footer a:hover {
		color: var(--accent-strong);
	}

	.my-nagi-activity-card {
		min-width: 0;
		padding: 10px 4px;
	}

	.my-nagi-activity-card + .my-nagi-activity-card {
		border-top: 1px solid var(--panel-divider);
	}

	/* my NagiSection 自体がカード境界を持つため、内側のタイムライン用カード枠は重ねない。 */
	.my-nagi-bot-card :global(> .thread-unit),
	.my-nagi-activity-card :global(> .thread-unit) {
		background: transparent;
		border-radius: 0;
		box-shadow: none;
		padding: 0;
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

	.my-nagi-signin-panel {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		margin-bottom: 16px;
		padding: 14px;
		border: 1px solid var(--panel-border);
		border-radius: var(--r-md);
		background: var(--surface-1);
		box-shadow: none;
	}

	.my-nagi-signin-panel div {
		display: grid;
		gap: 3px;
		min-width: 0;
	}

	.my-nagi-signin-panel strong {
		color: var(--text-strong);
		font-size: 13px;
	}

	.my-nagi-signin-panel span {
		color: var(--text-muted);
		font-size: 12px;
		line-height: 1.55;
	}

	.my-nagi-signin-panel a {
		flex: 0 0 auto;
		padding: 7px 12px;
		border: 1px solid var(--accent);
		border-radius: var(--r-md);
		color: var(--accent-strong);
		font-size: 12px;
		font-weight: 800;
		text-decoration: none;
	}

	@media (max-width: 480px) {
		.my-nagi-signin-panel {
			align-items: flex-start;
			flex-direction: column;
		}
	}
</style>
