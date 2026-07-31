<script lang="ts">
	import { ApiRequestError, getCommunityAffirmations } from '$lib/api/appview';
	import type { CommunityAffirmationView } from '$lib/api/types';
	import {
		communityAffirmationReactedUris,
		markCommunityAffirmationReacted,
		unmarkCommunityAffirmationReacted,
	} from '$lib/community-affirmation/seen';
	import { i18n, m } from '$lib/i18n/i18n.svelte';
	import ReactionBar from './ReactionBar.svelte';
	import Icon from './shell/Icon.svelte';

	/**
	 * 「みんなで全肯定」。以前は1件ずつ「次へ」で送るキュー型だったが、ストックが
	 * ほとんど増えない構造だったため毎回同じ1件を見せていた。サーバ側で常時ストック
	 * されるようになったので、横スクロールのカルーセルで一覧として見せる。
	 *
	 * 他ユーザーのリアクションはサーバが返さない（自分がどうするかだけの機能）。
	 * ReactionBar も showReactors={false} で反応した人を出さない。
	 */
	let { limit = 10 }: { limit?: number } = $props();

	let items = $state<CommunityAffirmationView[]>([]);
	let loading = $state(false);
	let error = $state('');
	let authError = $state(false);
	let loadedLocale = $state<'ja' | 'en'>();
	let reactedUris = $state(new Set<string>());
	let track = $state<HTMLDivElement>();
	/** ピッカーは1枚ずつしか開かないので、開いているカードの uri で持つ。 */
	let openPickerUri = $state<string>();
	let reactionButtons = $state<Record<string, HTMLButtonElement | undefined>>({});

	const reactedByMe = (item: CommunityAffirmationView) =>
		item.reactions.some((reaction) => reaction.reactedByMe || Boolean(reaction.viewerReactionUri));

	async function load() {
		if (loading) return;
		loading = true;
		error = '';
		authError = false;
		try {
			const page = await getCommunityAffirmations(i18n.locale, undefined, limit);
			items = page.items;
			reactedUris = communityAffirmationReactedUris();
		} catch (cause) {
			authError = cause instanceof ApiRequestError && (cause.status === 401 || cause.status === 403);
			error = cause instanceof Error ? cause.message : m.communityAffirmationError();
		} finally {
			loading = false;
		}
	}

	function handleReactionToggle(uri: string, active: boolean) {
		if (active) markCommunityAffirmationReacted(uri);
		else unmarkCommunityAffirmationReacted(uri);
		reactedUris = communityAffirmationReactedUris();
	}

	/** 1枚ぶん送る。カード幅はレイアウト依存なので実測から出す。 */
	function scrollByCard(direction: 1 | -1) {
		if (!track) return;
		const card = track.querySelector<HTMLElement>('.community-affirmation-card');
		const step = card ? card.offsetWidth + 12 : track.clientWidth * 0.8;
		track.scrollBy({ left: step * direction, behavior: 'smooth' });
	}

	$effect(() => {
		const locale = i18n.locale;
		if (locale === loadedLocale) return;
		loadedLocale = locale;
		items = [];
		void load();
	});
</script>

<section class="community-affirmation" aria-labelledby="community-affirmation-title">
	<header class="community-affirmation-titlebar">
		<span class="community-affirmation-mark"><Icon name="nagi" size={18} /></span>
		<h2 id="community-affirmation-title">{m.communityAffirmationTitle()}</h2>
		{#if items.length > 1}
			<div class="community-affirmation-arrows">
				<button
					type="button"
					aria-label={m.communityAffirmationScrollPrev()}
					title={m.communityAffirmationScrollPrev()}
					onclick={() => scrollByCard(-1)}
				>
					<Icon name="chevron" size={16} />
				</button>
				<button
					type="button"
					aria-label={m.communityAffirmationScrollNext()}
					title={m.communityAffirmationScrollNext()}
					onclick={() => scrollByCard(1)}
				>
					<Icon name="chevron" size={16} />
				</button>
			</div>
		{/if}
	</header>

	{#if items.length}
		<p class="community-affirmation-intro">{m.communityAffirmationIntro()}</p>
		<div class="community-affirmation-track" bind:this={track}>
			{#each items as item (item.uri)}
				<article class="community-affirmation-card" class:reacted={reactedUris.has(item.uri)}>
					<p class="community-affirmation-summary">{item.summary}</p>
					<div class="community-affirmation-card-foot">
						<ReactionBar
							uri={item.uri}
							cid={item.cid}
							reactions={item.reactions}
							showReactors={false}
							pickerOpen={openPickerUri === item.uri}
							pickerAnchor={reactionButtons[item.uri]}
							ontoggled={(active) => handleReactionToggle(item.uri, active)}
						/>
						<button
							bind:this={reactionButtons[item.uri]}
							class="community-affirmation-react"
							class:active={openPickerUri === item.uri}
							aria-expanded={openPickerUri === item.uri}
							aria-label={m.communityAffirmationReactAria()}
							onclick={() =>
								(openPickerUri = openPickerUri === item.uri ? undefined : item.uri)}
						>
							<Icon name="emoji" size={16} />
							<span>{reactedByMe(item) ? m.communityAffirmationSent() : m.communityAffirmationReact()}</span>
						</button>
					</div>
				</article>
			{/each}
		</div>
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
		<p class="community-affirmation-state">{m.communityAffirmationEmpty()}</p>
	{/if}
</section>
