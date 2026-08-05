<script lang="ts">
	import { ApiRequestError, getCommunityAffirmations } from '$lib/api/appview';
	import type { ActorView, CommunityAffirmationView } from '$lib/api/types';
	import {
		communityAffirmationHandledUris,
		markCommunityAffirmationHandled,
	} from '$lib/community-affirmation/seen';
	import {
		communityAffirmationBotPost,
		hasCommunityAffirmationTimestamp,
	} from '$lib/community-affirmation/bot-post';
	import { i18n, m } from '$lib/i18n/i18n.svelte';
	import { latestReadPosition, openMyNagiUnreadView, readLatest } from '$lib/my-nagi/unread.svelte';
	import { oauthReady, session } from '$lib/oauth/session.svelte';
	import type { UnreadView } from '$lib/unread/watermark.svelte';
	import CarouselArrows from './CarouselArrows.svelte';
	import ChatBubble from './ChatBubble.svelte';
	import HorizontalCarousel from './HorizontalCarousel.svelte';
	import ReactionBar from './ReactionBar.svelte';
	import Icon from './shell/Icon.svelte';

	/**
	 * 「みんなで全肯定」。サーバ側のストックから未処理の声を最大 limit 件集め、
	 * 横スクロールのカルーセルで見せる。リアクション成功、または明示的な見送りで
	 * そのカードを消し、1回に表示したまとまりを空にできるキューとして扱う。
	 *
	 * 他ユーザーのリアクションはサーバが返さない（自分がどうするかだけの機能）。
	 * ReactionBar も showReactors={false} で反応した人を出さない。
	 */
	let { limit = 10, botActor: providedBotActor }: { limit?: number; botActor?: ActorView } =
		$props();

	let items = $state<CommunityAffirmationView[]>([]);
	let loading = $state(false);
	let error = $state('');
	let authError = $state(false);
	let unread = $state(false);
	let unreadView: UnreadView | undefined;
	let loadedKey = $state('');
	let completed = $state(false);
	let responseBotActor = $state<ActorView>();
	let visibleBotActor = $derived(responseBotActor ?? providedBotActor);
	let removingUris = $state(new Set<string>());
	let carousel = $state<{ scrollPrevious: () => void; scrollNext: () => void }>();
	let canScrollPrevious = $state(false);
	let canScrollNext = $state(false);
	/** ピッカーは1枚ずつしか開かないので、開いているカードの uri で持つ。 */
	let openPickerUri = $state<string>();
	let reactionButtons = $state<Record<string, HTMLButtonElement | undefined>>({});

	const reactedByMe = (item: CommunityAffirmationView) =>
		item.reactions.some((reaction) => reaction.reactedByMe || Boolean(reaction.viewerReactionUri));
	// 既存の処理済み記録は最大200件なので、20件×10ページを上限に次の未処理を探す。
	const MAX_SCAN_PAGES = 10;
	const REMOVE_MS = 180;

	async function load() {
		if (loading) return;
		const activeUnreadView = unreadView;
		loading = true;
		error = '';
		authError = false;
		completed = false;
		try {
			const pageLimit = Math.min(20, Math.max(10, limit));
			const handled = communityAffirmationHandledUris();
			const visible: CommunityAffirmationView[] = [];
			let cursor: string | undefined;
			let foundAny = false;
			for (let pageIndex = 0; pageIndex < MAX_SCAN_PAGES; pageIndex += 1) {
				const page = await getCommunityAffirmations(i18n.locale, cursor, pageLimit);
				responseBotActor = page.botActor ?? responseBotActor;
				foundAny ||= page.items.length > 0;
				for (const item of page.items) {
					if (reactedByMe(item)) {
						markCommunityAffirmationHandled(item.uri);
						handled.add(item.uri);
						continue;
					}
					if (!handled.has(item.uri) && visible.length < limit) visible.push(item);
				}
				if (visible.length >= limit || !page.hasMore || !page.cursor) break;
				cursor = page.cursor;
			}
			items = visible;
			unread = readLatest(
				activeUnreadView,
				latestReadPosition(visible, (item) => ({
					indexedAt: item.createdAt,
					uri: item.uri,
				})),
			);
			completed = foundAny && visible.length === 0;
		} catch (cause) {
			authError =
				cause instanceof ApiRequestError && (cause.status === 401 || cause.status === 403);
			error = cause instanceof Error ? cause.message : m.communityAffirmationError();
		} finally {
			loading = false;
		}
	}

	function handleItem(uri: string) {
		if (removingUris.has(uri)) return;
		markCommunityAffirmationHandled(uri);
		removingUris = new Set([...removingUris, uri]);
		if (openPickerUri === uri) openPickerUri = undefined;
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		window.setTimeout(
			() => {
				items = items.filter((item) => item.uri !== uri);
				const nextRemoving = new Set(removingUris);
				nextRemoving.delete(uri);
				removingUris = nextRemoving;
				if (items.length === 0) completed = true;
			},
			reduceMotion ? 0 : REMOVE_MS,
		);
	}

	function handleReactionToggle(uri: string, active: boolean) {
		if (active) handleItem(uri);
	}

	function handlePickerClose(uri: string) {
		if (openPickerUri === uri) openPickerUri = undefined;
	}

	$effect(() => {
		if (!$oauthReady) return;
		const key = `${$session?.did ?? 'guest'}:${i18n.locale}`;
		if (key === loadedKey) return;
		loadedKey = key;
		items = [];
		removingUris = new Set();
		completed = false;
		error = '';
		authError = false;
		unread = false;
		unreadView = $session ? openMyNagiUnreadView('community', $session.did) : undefined;
		if ($session) void load();
		else loading = false;
	});
</script>

<section class="community-affirmation" aria-labelledby="community-affirmation-title">
	<header class="community-affirmation-titlebar">
		<span class="community-affirmation-mark"><Icon name="nagi" size={18} /></span>
		<h2 id="community-affirmation-title">{m.communityAffirmationTitle()}</h2>
		{#if unread}
			<span
				class="community-affirmation-unread"
				role="status"
				aria-label={m.communityAffirmationUnreadAria()}
			></span>
		{/if}
		{#if items.length > 1}
			<div class="community-affirmation-arrows">
				<CarouselArrows
					previousLabel={m.communityAffirmationScrollPrev()}
					nextLabel={m.communityAffirmationScrollNext()}
					previousDisabled={!canScrollPrevious}
					nextDisabled={!canScrollNext}
					onprevious={() => carousel?.scrollPrevious()}
					onnext={() => carousel?.scrollNext()}
				/>
			</div>
		{/if}
	</header>

	{#if !$session}
		<div class="community-affirmation-state community-affirmation-guest">
			<span>{m.communityAffirmationGuest()}</span>
			<a href="/login">{m.login()}</a>
		</div>
	{:else if items.length}
		<p class="community-affirmation-intro">{m.communityAffirmationIntro()}</p>
		<HorizontalCarousel
			bind:this={carousel}
			ariaLabel={m.communityAffirmationTitle()}
			onscrollstatechange={(state) => {
				canScrollPrevious = state.canPrevious;
				canScrollNext = state.canNext;
			}}
		>
			<div class="horizontal-carousel-track">
				{#each items as item (item.uri)}
					<article
						class="horizontal-carousel-item community-affirmation-card"
						class:removing={removingUris.has(item.uri)}
					>
						<ChatBubble
							post={communityAffirmationBotPost(item, visibleBotActor)}
							botActor={visibleBotActor}
							displayOnly
							hideTimestamp={!hasCommunityAffirmationTimestamp(item)}
							clampLines={item.images?.length || item.linkCards?.length ? 3 : 6}
							maxImages={2}
							maxLinkCards={1}
						/>
						<div class="community-affirmation-card-foot">
							<ReactionBar
								uri={item.uri}
								cid={item.cid}
								reactions={item.reactions}
								showReactors={false}
								pickerOpen={openPickerUri === item.uri}
								pickerAnchor={reactionButtons[item.uri]}
								ontoggled={(active) => handleReactionToggle(item.uri, active)}
								onpickerclose={() => handlePickerClose(item.uri)}
							/>
							<button
								bind:this={reactionButtons[item.uri]}
								class="community-affirmation-react"
								class:active={openPickerUri === item.uri}
								aria-expanded={openPickerUri === item.uri}
								aria-label={m.communityAffirmationReactAria()}
								onclick={() => (openPickerUri = openPickerUri === item.uri ? undefined : item.uri)}
							>
								<Icon name="emoji" size={16} />
								<span>{m.communityAffirmationReact()}</span>
							</button>
							<button
								type="button"
								class="community-affirmation-dismiss"
								aria-label={m.communityAffirmationDismissAria()}
								title={m.communityAffirmationDismissAria()}
								onclick={() => handleItem(item.uri)}
							>
								{m.communityAffirmationDismiss()}
							</button>
						</div>
					</article>
				{/each}
			</div>
		</HorizontalCarousel>
	{:else if loading}
		<p class="community-affirmation-state" role="status">{m.communityAffirmationLoading()}</p>
	{:else if error}
		<div class="community-affirmation-state community-affirmation-error">
			<span>{m.communityAffirmationError()}</span>
			{#if authError}
				<a href="/login">{m.communityAffirmationRefreshPermissions()}</a>
			{:else}
				<button onclick={() => load()}>{m.retry()}</button>
			{/if}
		</div>
	{:else}
		<p class="community-affirmation-state">
			{completed ? m.communityAffirmationDone() : m.communityAffirmationEmpty()}
		</p>
	{/if}
</section>
