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

	let current = $state<CommunityAffirmationView>();
	let queued = $state<CommunityAffirmationView[]>([]);
	let deferred = $state<CommunityAffirmationView[]>([]);
	let cursor = $state<string>();
	let hasMore = $state(true);
	let loading = $state(false);
	let error = $state('');
	let authError = $state(false);
	let pickerOpen = $state(false);
	let reactionButton = $state<HTMLButtonElement>();
	let reacted = $state(false);
	let loadedLocale = $state<'ja' | 'en'>();

	const reactedByMe = (item: CommunityAffirmationView) =>
		item.reactions.some((reaction) => reaction.reactedByMe || Boolean(reaction.viewerReactionUri));

	function takeNext(): boolean {
		const reactedUris = communityAffirmationReactedUris();
		const nextIndex = queued.findIndex((item) => !reactedUris.has(item.uri) && !reactedByMe(item));
		if (nextIndex < 0) return false;
		const [next] = queued.splice(nextIndex, 1);
		current = next;
		reacted = false;
		return true;
	}

	function recycleDeferred(): boolean {
		if (!deferred.length) return false;
		queued.push(...deferred);
		deferred = [];
		return takeNext();
	}

	async function loadNext() {
		if (loading) return;
		if (takeNext()) return;
		loading = true;
		error = '';
		authError = false;
		try {
			while (hasMore && !current) {
				const page = await getCommunityAffirmations(i18n.locale, cursor);
				queued.push(...page.items);
				cursor = page.cursor;
				hasMore = page.hasMore;
				if (takeNext()) break;
			}
			if (!current) recycleDeferred();
		} catch (cause) {
			authError =
				cause instanceof ApiRequestError && (cause.status === 401 || cause.status === 403);
			error = cause instanceof Error ? cause.message : m.communityAffirmationError();
		} finally {
			loading = false;
		}
	}

	function next() {
		pickerOpen = false;
		if (current && !reacted) deferred.push(current);
		current = undefined;
		reacted = false;
		void loadNext();
	}

	function handleReactionToggle(active: boolean) {
		reacted = active;
		if (!current) return;
		if (active) markCommunityAffirmationReacted(current.uri);
		else unmarkCommunityAffirmationReacted(current.uri);
	}

	$effect(() => {
		const locale = i18n.locale;
		if (locale === loadedLocale) return;
		loadedLocale = locale;
		current = undefined;
		queued = [];
		deferred = [];
		cursor = undefined;
		hasMore = true;
		void loadNext();
	});
</script>

<section class="community-affirmation" aria-labelledby="community-affirmation-title">
	<header class="community-affirmation-titlebar">
		<span class="community-affirmation-mark"><Icon name="bot" size={18} /></span>
		<h2 id="community-affirmation-title">{m.communityAffirmationTitle()}</h2>
	</header>

	<div class="community-affirmation-body">
		{#if current}
			<div class="community-affirmation-comment">
				<p class="community-affirmation-summary">{current.summary}</p>
				{#key current.uri}
					<ReactionBar
						uri={current.uri}
						cid={current.cid}
						reactions={current.reactions}
						showReactors={false}
						bind:pickerOpen
						pickerAnchor={reactionButton}
						ontoggled={handleReactionToggle}
					/>
				{/key}
				{#if reacted}
					<p class="community-affirmation-complete" role="status">
						{m.communityAffirmationComplete()}
					</p>
				{/if}
				<div class="community-affirmation-actions">
					<button
						bind:this={reactionButton}
						class="community-affirmation-react"
						class:active={pickerOpen}
						aria-expanded={pickerOpen}
						aria-label={m.communityAffirmationReactAria()}
						onclick={() => (pickerOpen = !pickerOpen)}
					>
						<Icon name="emoji" size={18} />
						<span>{m.communityAffirmationReact()}</span>
					</button>
					<button class="community-affirmation-next" onclick={next}>
						<span>{m.communityAffirmationNext()}</span>
						<Icon name="chevron" size={17} />
					</button>
				</div>
			</div>
		{:else if loading}
			<p class="community-affirmation-state" role="status">{m.communityAffirmationLoading()}</p>
		{:else if error}
			<div class="community-affirmation-state community-affirmation-error">
				<span>{m.communityAffirmationError()}</span>
				{#if authError}
					<a href="/login">{m.communityAffirmationRefreshPermissions()}</a>
				{:else}
					<button onclick={() => loadNext()}>{m.retry()}</button>
				{/if}
			</div>
		{:else}
			<p class="community-affirmation-state">{m.communityAffirmationEmpty()}</p>
		{/if}
	</div>
</section>
