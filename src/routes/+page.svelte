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
	import { getMyNagi, getPositiveNews, getProfile } from '$lib/api/appview';
	import type { ActorView, MyNagiView, NewsView, PostView } from '$lib/api/types';
	import CarouselArrows from '$lib/components/CarouselArrows.svelte';
	import ChatBubble from '$lib/components/ChatBubble.svelte';
	import CardDrawEntry from '$lib/components/CardDrawEntry.svelte';
	import CommunityAffirmationPanel from '$lib/components/CommunityAffirmationPanel.svelte';
	import MyNagiNewsCarousel from '$lib/components/MyNagiNewsCarousel.svelte';
	import MyNagiSection from '$lib/components/MyNagiSection.svelte';
	import ThreadFlags from '$lib/components/ThreadFlags.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';
	import { i18n, m } from '$lib/i18n/i18n.svelte';
	import { unreadNews } from '$lib/news/unread.svelte';
	import { oauthReady, session } from '$lib/oauth/session.svelte';

	const NEWS_COUNT = 5;
	const BOT_POST_COUNT = 1;
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
		if ($session) loadAll();
		else loadPublic();
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
		moreHref={botActor ? `/profile/${botActor.did}` : undefined}
		loading={botLoading}
		error={botError}
		empty={!botPosts.length}
		onretry={loadBotPosts}
	>
		{#if botPosts[0]}
			<div class="my-nagi-bot-card">
				<ChatBubble post={botPosts[0]} {botActor} />
			</div>
		{/if}
	</MyNagiSection>

	<CommunityAffirmationPanel {botActor} />

	<MyNagiSection
		title={m.myNagiNewsTitle()}
		icon="newspaper"
		loading={newsLoading}
		error={newsError}
		empty={!news.length}
		unread={$unreadNews}
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
					<ChatBubble post={entry.post} {botActor} />
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
					<ThreadFlags channel={entry.channel} />
					<ChatBubble post={entry.post} {botActor} />
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
		border-radius: var(--radius-l);
		background: var(--panel-bg);
		box-shadow: var(--shadow-panel);
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
		border-radius: var(--radius-pill);
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
