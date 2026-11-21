<script lang="ts">
	import type { ModerationOpts } from '@atproto/api';
	import Avatar from '$lib/components/Avatar.svelte';
	import ContentWarningMask from '$lib/components/ContentWarningMask.svelte';
	import ImageGallery from '$lib/components/ImageGallery.svelte';
	import LinkCard from '$lib/components/LinkCard.svelte';
	import VideoPlayer from '$lib/components/VideoPlayer.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';
	import {
		bskyInteractions,
		canInteractWithBsky,
		deletedBskyPosts,
		deleteOwnBskyPost,
		getBskyLikers,
	} from '$lib/bsky/agent';
	import { VIA } from '$lib/crosspost/bluesky';
	import { composerHost } from '$lib/post/composer-host.svelte';
	import ActionMenu from '$lib/components/ActionMenu.svelte';
	import PostDeleteDialog from '$lib/components/PostDeleteDialog.svelte';
	import type { BskyInteractionKind } from '$lib/bsky/interactions.svelte';
	import type { BskyActor, BskyFeedItemView } from '$lib/bsky/mapView';
	import { bskyPostDisplay } from '$lib/bsky/moderation';
	import { dateLocale, m } from '$lib/i18n/i18n.svelte';
	import { ageAssurance } from '$lib/moderation/age.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import BskyPermissionDialog from './BskyPermissionDialog.svelte';
	import BskyRichText from './BskyRichText.svelte';

	/**
	 * Bluesky の投稿1件。著者・日時・カードは bsky.app を新しいタブで開く。
	 * 誰がいいねしたかは投稿者本人にだけ、最大5人まで見せる。
	 */
	let {
		item,
		moderation,
		standalone = true,
		interactive = true,
	}: {
		item: BskyFeedItemView;
		moderation: ModerationOpts;
		standalone?: boolean;
		interactive?: boolean;
	} = $props();

	const LIKERS_LIMIT = 5;

	const post = $derived(item.post);
	const mine = $derived(post.author.did === $session?.did);
	const display = $derived(
		bskyPostDisplay(post.raw, moderation, { isAdult: ageAssurance.isAdult }),
	);
	const time = $derived(
		new Date(post.createdAt).toLocaleString(dateLocale(), {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		}),
	);
	const nameOf = (actor: BskyActor) => actor.displayName ?? actor.handle;
	const withWarning = <T extends { contentWarning?: boolean }>(media: T): T => ({
		...media,
		contentWarning: display.warnMedia || media.contentWarning,
	});

	const liked = $derived(bskyInteractions.active('like', post));
	const reposted = $derived(bskyInteractions.active('repost', post));
	let permissionPrompt = $state(false);
	let actionError = $state(false);
	let errorTimer: ReturnType<typeof setTimeout> | undefined;

	/** Nagi 経由で作った自分の投稿だけ削除できる（BSKY-10）。 */
	const deletable = $derived(mine && (post.raw.record as { via?: unknown }).via === VIA);
	const replyDisabled = $derived(Boolean(post.raw.viewer?.replyDisabled));
	const quoteDisabled = $derived(Boolean(post.raw.viewer?.embeddingDisabled));
	let deleteOpen = $state(false);
	let deleting = $state(false);
	let deleteError = $state('');

	async function permitted() {
		if (await canInteractWithBsky()) return true;
		permissionPrompt = true;
		return false;
	}

	async function compose(kind: 'reply' | 'quote') {
		if (!(await permitted())) return;
		if (kind === 'reply') composerHost.openBskyReply(post);
		else composerHost.openBskyQuote(post);
	}

	async function removePost() {
		if (deleting) return;
		deleting = true;
		deleteError = '';
		try {
			await deleteOwnBskyPost(post.uri);
			deleteOpen = false;
		} catch (error) {
			console.warn('[BskyPostCard] delete failed', error);
			deleteError = m.bskyDeleteFailed();
		} finally {
			deleting = false;
		}
	}

	async function toggle(kind: BskyInteractionKind) {
		if (bskyInteractions.busy(kind, post)) return;
		if (!(await permitted())) return;
		try {
			await bskyInteractions.toggle(kind, post);
		} catch (error) {
			console.warn('[BskyPostCard] interaction failed', kind, error);
			actionError = true;
			clearTimeout(errorTimer);
			errorTimer = setTimeout(() => (actionError = false), 4000);
		}
	}
	$effect(() => () => clearTimeout(errorTimer));

	// 自分の投稿だけ、画面に入ったときに一度だけ引く。フィードを開いただけで全件ぶん叩かない。
	let likers = $state<BskyActor[]>([]);
	let row = $state<HTMLElement>();
	$effect(() => {
		if (!mine || !row) return;
		const uri = post.uri;
		const target = row;
		const observer = new IntersectionObserver((entries) => {
			if (!entries.some((entry) => entry.isIntersecting)) return;
			observer.disconnect();
			getBskyLikers(uri, LIKERS_LIMIT)
				.then((actors) => (likers = actors))
				.catch((error) => console.warn('[BskyPostCard] getLikes failed', error));
		});
		observer.observe(target);
		return () => observer.disconnect();
	});
</script>

{#if !display.hidden && !deletedBskyPosts.has(post.uri)}
	<article class="bsky-post" class:thread-unit={standalone} data-bsky-uri={post.uri}>
		{#if item.repostedBy}
			<p class="bsky-context">
				<Icon name="refresh" size={14} />
				<a href={item.repostedBy.profileUrl} target="_blank" rel="noopener noreferrer"
					>{m.bskyRepostedBy({ name: nameOf(item.repostedBy) })}</a
				>
			</p>
		{/if}
		<div class="post-row" class:mine bind:this={row}>
			<a href={post.author.profileUrl} target="_blank" rel="noopener noreferrer"
				><Avatar actor={post.author} /></a
			>
			<div class="bubble">
				<div class="meta">
					<div class="meta-author-line">
						<a href={post.author.profileUrl} target="_blank" rel="noopener noreferrer"
							>{nameOf(post.author)}</a
						>
						<span class="bsky-handle">@{post.author.handle}</span>
					</div>
					<div class="meta-time">
						<time datetime={post.createdAt}
							>{#if post.url}<a href={post.url} target="_blank" rel="noopener noreferrer">{time}</a
								>{:else}{time}{/if}</time
						>
					</div>
				</div>
				{#if item.replyTo}
					<p class="bsky-context">
						<Icon name="reply" size={14} />{m.bskyReplyTo({ name: nameOf(item.replyTo) })}
					</p>
				{/if}
				<ContentWarningMask
					kind="content"
					active={display.warnContent}
					title={m.bskyModerationWarning()}
				>
					{#if post.text}<BskyRichText text={post.text} facets={post.facets} />{/if}
					{#if post.images?.length}<ImageGallery images={post.images.map(withWarning)} />{/if}
					{#if post.video}<VideoPlayer video={withWarning(post.video)} />{/if}
					{#if post.external}<LinkCard card={post.external} />{/if}
					{#if post.quote?.kind === 'post'}
						{@const quote = post.quote}
						<aside class="bsky-quote">
							<header>
								<a href={quote.author.profileUrl} target="_blank" rel="noopener noreferrer"
									><strong>{nameOf(quote.author)}</strong></a
								>
								{#if quote.url}<a
										class="bsky-quote-open"
										href={quote.url}
										target="_blank"
										rel="noopener noreferrer">{m.bskyOpenInBluesky()}</a
									>{/if}
							</header>
							{#if quote.text}<BskyRichText text={quote.text} facets={quote.facets} />{/if}
							{#if quote.images?.length}<ImageGallery images={quote.images.map(withWarning)} />{/if}
							{#if quote.video}<VideoPlayer video={withWarning(quote.video)} />{/if}
							{#if quote.external}<LinkCard card={quote.external} />{/if}
						</aside>
					{:else if post.quote?.kind === 'unavailable'}
						<aside class="bsky-quote bsky-quote-missing">{m.bskyQuoteUnavailable()}</aside>
					{/if}
				</ContentWarningMask>
				<footer class="bsky-footer">
					{#if interactive && $session}
						<button
							type="button"
							class="bsky-action"
							disabled={replyDisabled}
							title={replyDisabled ? m.bskyReplyDisabled() : m.bskyReplyTitle()}
							onclick={() => void compose('reply')}
							><Icon name="reply" size={15} />{m.bskyReply()}</button
						>
						<button
							type="button"
							class="bsky-action"
							class:active={reposted}
							aria-pressed={reposted}
							title={reposted ? m.bskyUndoRepost() : m.bskyRepost()}
							aria-busy={bskyInteractions.busy('repost', post)}
							onclick={() => toggle('repost')}
							><Icon name="refresh" size={15} />{reposted
								? m.bskyReposted()
								: m.bskyRepost()}</button
						>
						<button
							type="button"
							class="bsky-action"
							disabled={quoteDisabled}
							title={quoteDisabled ? m.bskyQuoteDisabled() : m.bskyQuoteTitle()}
							onclick={() => void compose('quote')}
							><Icon name="quote" size={15} />{m.bskyQuote()}</button
						>
						<button
							type="button"
							class="bsky-action"
							class:active={liked}
							aria-pressed={liked}
							title={liked ? m.bskyUnlike() : m.bskyLike()}
							aria-busy={bskyInteractions.busy('like', post)}
							onclick={() => toggle('like')}
							><Icon name={liked ? 'heartFilled' : 'heart'} size={15} />{liked
								? m.bskyLikedByMe()
								: m.bskyLike()}</button
						>
						{#if deletable}
							<ActionMenu label={m.morePostActions()} icon="moreHorizontal" align="start">
								{#snippet menu(closeMenu)}
									<button
										class="danger"
										role="menuitem"
										onclick={() => {
											closeMenu(false);
											deleteError = '';
											deleteOpen = true;
										}}
									>
										<Icon name="trash" size={17} />
										<span>{m.deletePost()}</span>
									</button>
								{/snippet}
							</ActionMenu>
						{/if}
					{:else if liked}
						<span class="bsky-liked"><Icon name="heart" size={14} />{m.bskyLikedByMe()}</span>
					{/if}
					{#if likers.length}
						<span class="bsky-likers" aria-label={m.bskyLikedBy()} title={m.bskyLikedBy()}>
							<Icon name="heart" size={14} />
							{#each likers as liker (liker.did)}
								<a
									href={liker.profileUrl}
									target="_blank"
									rel="noopener noreferrer"
									title={nameOf(liker)}><Avatar actor={liker} size="small" /></a
								>
							{/each}
						</span>
					{/if}
					{#if post.url}
						<a class="bsky-open" href={post.url} target="_blank" rel="noopener noreferrer"
							><Icon name="bluesky" size={14} />{m.bskyOpenInBluesky()}</a
						>
					{/if}
				</footer>
				{#if actionError}<p class="bsky-action-error" role="status">{m.bskyActionFailed()}</p>{/if}
			</div>
		</div>
	</article>
	{#if permissionPrompt}<BskyPermissionDialog onclose={() => (permissionPrompt = false)} />{/if}
	{#if deleteOpen}
		<PostDeleteDialog
			busy={deleting}
			error={deleteError}
			title={m.bskyDeleteTitle()}
			message={m.bskyDeleteBody()}
			onconfirm={() => void removePost()}
			oncancel={() => (deleteOpen = false)}
		/>
	{/if}
{/if}

<style>
	.bsky-post {
		min-inline-size: 0;
	}
	.bsky-context {
		display: flex;
		align-items: center;
		gap: 4px;
		margin: 0 0 6px;
		color: var(--text-mute);
		font-size: 12px;
	}
	.bsky-context a {
		color: inherit;
	}
	.bsky-handle {
		min-width: 0;
		overflow: hidden;
		color: var(--text-mute);
		font-size: 12px;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.bubble > .bsky-context {
		margin: 4px 0 0;
	}
	.bsky-quote {
		margin-top: 0.6rem;
		min-inline-size: 0;
		padding: 0.25rem 0 0.25rem 0.75rem;
		border-left: 3px solid var(--line-strong);
		font-size: 0.875rem;
	}
	.bsky-quote header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--text-muted);
		font-size: 0.75rem;
	}
	.bsky-quote-open {
		margin-left: auto;
		color: var(--text-mute);
	}
	.bsky-quote-missing {
		color: var(--text-mute);
	}
	.bsky-footer {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 8px 12px;
		margin-top: 8px;
		color: var(--text-mute);
		font-size: 12px;
	}
	.bsky-action {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		min-height: 28px;
		padding: 2px 8px;
		border: 1px solid transparent;
		border-radius: var(--r-pill, 999px);
		background: none;
		color: var(--text-mute);
		font: inherit;
		cursor: pointer;
	}
	.bsky-action:hover:not(:disabled) {
		border-color: var(--line);
		color: var(--text-muted);
	}
	.bsky-action:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}
	.bsky-action.active,
	.bsky-action.active:hover:not(:disabled) {
		color: var(--accent-strong);
	}
	.bsky-action-error {
		margin: 6px 0 0;
		color: var(--danger);
		font-size: 12px;
	}
	.bsky-liked,
	.bsky-likers,
	.bsky-open {
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}
	.bsky-likers :global(.avatar.small) {
		width: 22px;
		height: 22px;
		font-size: 10px;
	}
	.bsky-open {
		margin-left: auto;
		color: var(--text-mute);
	}
</style>
