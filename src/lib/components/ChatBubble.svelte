<script lang="ts">
	import type { PostView } from '$lib/api/types';
	import ReactionBar from './ReactionBar.svelte';
	import Avatar from './Avatar.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import { m, dateLocale } from '$lib/i18n/i18n.svelte';
	import TranslateToggle from './TranslateToggle.svelte';
	import QuoteCard from './QuoteCard.svelte';
	import PostDeleteDialog from './PostDeleteDialog.svelte';
	import { createPost, deleteRecord, preparePostDraft } from '$lib/atproto/records';
	import Icon from './shell/Icon.svelte';
	import ImageAttachmentEditor from './ImageAttachmentEditor.svelte';
	import ImageGallery from './ImageGallery.svelte';
	import type { ImageAttachment } from '$lib/images';
	import type { LinkCardDraft } from '$lib/atproto/records';
	import LinkCardEditor from './LinkCardEditor.svelte';
	import LinkCard from './LinkCard.svelte';
	import { optimisticPosts } from '$lib/feed/optimistic-posts.svelte';
	let {
		post,
		compact = false,
		ondeleted,
		onposted,
	}: {
		post: PostView;
		compact?: boolean;
		ondeleted?: (uri: string) => void;
		onposted?: () => void | Promise<void>;
	} = $props();
	let expanded = $state(false);
	let deleteOpen = $state(false);
	let deleting = $state(false);
	let deleteError = $state('');
	let composeMode = $state<'reply' | 'quote'>();
	let composeText = $state('');
	let posting = $state(false);
	let postError = $state('');
	let attachments = $state<ImageAttachment[]>([]);
	let linkCards = $state<LinkCardDraft[]>([]);
	let mine = $derived($session?.did === post.author.did);
	let optimistic = $derived(Boolean(post.optimisticState));
	let threadHref = $derived(`/thread/${post.author.did}/${post.uri.split('/').pop()}`);
	function openComposer(mode: 'reply' | 'quote') {
		if (!$session) {
			location.href = '/login';
			return;
		}
		postError = '';
		if (composeMode === mode) {
			composeMode = undefined;
			attachments = [];
			linkCards = [];
		} else {
			composeMode = mode;
		}
	}
	async function submitPost() {
		if (
			!composeMode ||
			(!composeText.trim() && !attachments.length && !linkCards.length) ||
			posting ||
			!$session
		)
			return;
		const mode = composeMode;
		const subject = { uri: post.uri, cid: post.cid };
		const draft = preparePostDraft(
			composeText,
			mode === 'reply' ? { root: subject, parent: subject } : undefined,
			mode === 'quote' ? subject : undefined,
			attachments,
			linkCards,
		);
		const optimisticId = optimisticPosts.add(draft, $session.did, {
			...(mode === 'reply' ? { replyParent: post } : {}),
			...(mode === 'quote' ? { quote: post } : {}),
		});
		posting = true;
		postError = '';
		composeText = '';
		attachments = [];
		linkCards = [];
		composeMode = undefined;
		try {
			const response = await createPost(draft);
			optimisticPosts.markCreated(optimisticId, response.data);
			await Promise.resolve(onposted?.()).catch(() => undefined);
		} catch (error) {
			optimisticPosts.remove(optimisticId);
			postError = error instanceof Error ? error.message : m.postFailed();
		} finally {
			posting = false;
		}
	}
	async function removePost() {
		if (deleting) return;
		const match = /^at:\/\/[^/]+\/(com\.suibari\.nagi\.post)\/([^/]+)$/.exec(post.uri);
		if (!match) {
			deleteError = m.deletePostFailed();
			return;
		}
		deleting = true;
		deleteError = '';
		try {
			await deleteRecord(match[1], match[2]);
			deleteOpen = false;
			ondeleted?.(post.uri);
		} catch (error) {
			deleteError = error instanceof Error ? error.message : m.deletePostFailed();
		} finally {
			deleting = false;
		}
	}
</script>

<div class="post-row" class:mine class:bot={post.isBot}>
	<a href={`/profile/${post.author.did}`} aria-label={m.viewProfileAria()}
		><Avatar actor={post.author} size={compact ? 'small' : undefined} /></a
	>
	<div class="bubble">
		<div class="meta">
			<a href={`/profile/${post.author.did}`}>{post.author.displayName ?? post.author.handle}</a
			>{#if post.isBot}<span class="badge">{m.botBadge()}</span>{/if}<time
				><a href={threadHref}
					>{new Date(post.createdAt).toLocaleString(dateLocale(), {
						month: 'short',
						day: 'numeric',
						hour: '2-digit',
						minute: '2-digit',
					})}</a
				></time
			>
		</div>
		<TranslateToggle
			uri={post.uri}
			text={post.text}
			langs={post.langs}
			facets={post.facets}
			deleted={post.deleted}
			collapsed={!expanded}
			disabled={optimistic}
		/>
		{#if post.text.length > 220}<button class="read" onclick={() => (expanded = !expanded)}
				>{expanded ? m.readLess() : m.readMore()}</button
			>{/if}{#if post.images?.length}<ImageGallery
				images={post.images}
			/>{/if}{#if post.linkCards?.length}<div class="link-cards">
				{#each post.linkCards as card}<LinkCard {card} />{/each}
			</div>{/if}{#if post.quote}<QuoteCard post={post.quote} />{/if}
		{#if optimistic}
			<p class="post-sending" role="status">{m.postSending()}</p>
		{:else}
			<ReactionBar uri={post.uri} cid={post.cid} reactions={post.reactions} />
		{/if}
		{#if !post.deleted && !optimistic}
			<div class="post-actions">
				<button
					class="ghost"
					class:active={composeMode === 'reply'}
					type="button"
					aria-label={m.replyPost()}
					title={m.replyPost()}
					onclick={() => openComposer('reply')}><Icon name="reply" size={17} /></button
				>
				{#if post.isBot}<button
						class="ghost"
						class:active={composeMode === 'quote'}
						type="button"
						aria-label={m.quotePost()}
						title={m.quotePost()}
						onclick={() => openComposer('quote')}><Icon name="quote" size={17} /></button
					>{/if}
				{#if mine}<button
						class="ghost danger"
						type="button"
						aria-label={m.deletePostAria()}
						title={m.deletePost()}
						onclick={() => {
							deleteError = '';
							deleteOpen = true;
						}}><Icon name="trash" size={17} /></button
					>{/if}
			</div>
			{#if composeMode}
				<div class="post-composer">
					<label for={`compose-${post.cid}`}
						>{composeMode === 'reply' ? m.replyComposerLabel() : m.quoteComposerLabel()}</label
					>
					<textarea
						id={`compose-${post.cid}`}
						bind:value={composeText}
						maxlength="30000"
						placeholder={composeMode === 'reply' ? m.replyPlaceholder() : m.quotePlaceholder()}
					></textarea>
					<ImageAttachmentEditor bind:attachments disabled={posting} />
					<LinkCardEditor text={composeText} bind:cards={linkCards} disabled={posting} />
					<div class="post-composer-foot">
						{#if postError}<span class="error" role="alert">{postError}</span>{/if}
						<button
							class="ghost"
							type="button"
							disabled={posting}
							onclick={() => {
								composeMode = undefined;
								attachments = [];
								linkCards = [];
							}}>{m.cancel()}</button
						>
						<button
							class="primary"
							type="button"
							disabled={posting ||
								(!composeText.trim() && !attachments.length && !linkCards.length)}
							onclick={() => void submitPost()}
							>{posting ? m.composerSubmitting() : m.composerSubmit()}</button
						>
					</div>
				</div>
			{/if}
		{/if}
		{#if postError && !composeMode}<p class="error" role="alert">{postError}</p>{/if}
	</div>
</div>
{#if deleteOpen}
	<PostDeleteDialog
		busy={deleting}
		error={deleteError}
		onconfirm={() => void removePost()}
		oncancel={() => (deleteOpen = false)}
	/>
{/if}

<style>
	.post-sending {
		margin-top: 0.45rem;
		color: var(--text-muted);
		font-size: 0.75rem;
	}
</style>
