<script lang="ts">
	import type { PostView } from '$lib/api/types';
	import ReactionBar from './ReactionBar.svelte';
	import Avatar from './Avatar.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import { m, dateLocale } from '$lib/i18n/i18n.svelte';
	import TranslateToggle from './TranslateToggle.svelte';
	import Icon from './shell/Icon.svelte';
	import QuoteCard from './QuoteCard.svelte';
	import NewsQuoteCard from './NewsQuoteCard.svelte';
	import ActorBadges from './ActorBadges.svelte';
	import PostDeleteDialog from './PostDeleteDialog.svelte';
	import { createPost, deleteRecord, preparePostDraft, setPostKossori } from '$lib/atproto/records';
	import ImageAttachmentEditor from './ImageAttachmentEditor.svelte';
	import ImageGallery from './ImageGallery.svelte';
	import type { ImageAttachment } from '$lib/images';
	import type { LinkCardDraft } from '$lib/atproto/records';
	import LinkCardEditor from './LinkCardEditor.svelte';
	import LinkCard from './LinkCard.svelte';
	import { optimisticPosts } from '$lib/feed/optimistic-posts.svelte';
	import ComposerEditor from './ComposerEditor.svelte';
	import type { MentionSelection } from '$lib/atproto/facets';
	import { myProfile } from '$lib/profile/me.svelte';
	import {
		languagePreferences,
		normalizeSupportedLanguage,
	} from '$lib/i18n/languagePreferences.svelte';
	import { buildExternalTranslationUrl } from '$lib/i18n/translationProviders';
	let {
		post,
		ondeleted,
		onposted,
		displayOnly = false,
	}: {
		post: PostView;
		ondeleted?: (uri: string) => void;
		onposted?: () => void | Promise<void>;
		/** ニュースコメント等、投稿と同じ見た目だけを使う読み取り専用表示。 */
		displayOnly?: boolean;
	} = $props();
	let expanded = $state(false);
	let overflowing = $state(false);
	let deleteOpen = $state(false);
	let deleting = $state(false);
	let deleteError = $state('');
	let composeMode = $state<'reply' | 'quote'>();
	let composeText = $state('');
	let posting = $state(false);
	let postError = $state('');
	let attachments = $state<ImageAttachment[]>([]);
	let linkCards = $state<LinkCardDraft[]>([]);
	let mentions = $state<MentionSelection[]>([]);
	let kossoriBusy = $state(false);
	let mine = $derived($session?.did === post.author.did);
	let topLevel = $derived(!post.reply);
	let optimistic = $derived(Boolean(post.optimisticState));
	let threadHref = $derived(`/thread/${post.author.did}/${post.uri.split('/').pop()}`);
	// 外国語の投稿にだけ「選択したプロバイダーで翻訳」ボタンを出す。
	let translateSourceLang = $derived(normalizeSupportedLanguage(post.langs?.[0]));
	let canTranslateExternally = $derived(
		Boolean(post.text?.trim()) &&
			Boolean(translateSourceLang) &&
			translateSourceLang !== languagePreferences.translationLanguage,
	);
	function openExternalTranslation() {
		const url = buildExternalTranslationUrl(languagePreferences.translationProvider, {
			text: post.text,
			from: translateSourceLang,
			to: languagePreferences.translationLanguage,
		});
		window.open(url, '_blank', 'noopener,noreferrer');
	}
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
			mentions = [];
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
			mentions,
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
		mentions = [];
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
	async function toggleKossori() {
		if (kossoriBusy) return;
		const match = /^at:\/\/[^/]+\/(com\.suibari\.nagi\.post)\/([^/]+)$/.exec(post.uri);
		if (!match) {
			postError = m.kossoriToggleFailed();
			return;
		}
		kossoriBusy = true;
		postError = '';
		try {
			await setPostKossori(match[2], !post.kossori);
			await Promise.resolve(onposted?.()).catch(() => undefined);
		} catch (error) {
			postError = error instanceof Error ? error.message : m.kossoriToggleFailed();
		} finally {
			kossoriBusy = false;
		}
	}
</script>

<div class="post-row" class:mine class:bot={post.isBot}>
	<a href={`/profile/${post.author.did}`} aria-label={m.viewProfileAria()}
		><Avatar actor={post.author} /></a
	>
	<div class="bubble" class:sending={optimistic}>
		<div class="meta">
			<a href={`/profile/${post.author.did}`}>{post.author.displayName ?? post.author.handle}</a
			><ActorBadges actor={post.author} /><time>
				{#if displayOnly}{new Date(post.createdAt).toLocaleString(dateLocale(), {
					month: 'short',
					day: 'numeric',
					hour: '2-digit',
					minute: '2-digit',
				})}{:else}<a href={threadHref}
					>{new Date(post.createdAt).toLocaleString(dateLocale(), {
						month: 'short',
						day: 'numeric',
						hour: '2-digit',
						minute: '2-digit',
					})}</a
				>{/if}</time
			>
		</div>
		{#if post.kossori}
			<div class="post-flags">
				<span class="kossori-badge" title={m.kossoriBadgeAria()} aria-label={m.kossoriBadgeAria()}
					><Icon name="hide" size={12} />{m.kossoriBadge()}</span
				>
			</div>
		{/if}
		<TranslateToggle
			uri={post.uri}
			text={post.text}
			langs={post.langs}
			facets={post.facets}
			deleted={post.deleted}
			collapsed={!expanded}
			disabled={optimistic}
			onoverflowchange={(value) => (overflowing = value)}
		/>
		{#if overflowing || expanded}<button class="read" onclick={() => (expanded = !expanded)}
				>{expanded ? m.readLess() : m.readMore()}</button
			>{/if}{#if post.images?.length}<ImageGallery
				images={post.images}
			/>{/if}{#if post.linkCards?.length}<div class="link-cards">
				{#each post.linkCards as card}<LinkCard {card} />{/each}
			</div>{/if}{#if post.quote?.kind === 'post'}<QuoteCard post={post.quote.post} />
		{:else if post.quote?.kind === 'news'}<NewsQuoteCard news={post.quote.news} />{/if}
		{#if !displayOnly}{#if optimistic}
			<div class="post-sending" role="status" aria-live="polite">
				<span class="typing" aria-hidden="true"><i></i><i></i><i></i></span>
				<span>{m.postSending()}</span>
			</div>
		{:else}
			<ReactionBar uri={post.uri} cid={post.cid} reactions={post.reactions} />
		{/if}{/if}
		{#if !displayOnly && !post.deleted && !optimistic}
			<div class="post-actions">
				<button
					class="ghost"
					class:active={composeMode === 'reply'}
					type="button"
					aria-label={m.replyPost()}
					title={m.replyPost()}
					onclick={() => openComposer('reply')}><Icon name="reply" size={17} /></button
				>
				{#if canTranslateExternally}<button
						class="ghost"
						type="button"
						aria-label={m.translateExternally()}
						title={m.translateExternally()}
						onclick={openExternalTranslation}><Icon name="language" size={17} /></button
					>{/if}
				{#if post.isBot}<button
						class="ghost"
						class:active={composeMode === 'quote'}
						type="button"
						aria-label={m.quotePost()}
						title={m.quotePost()}
						onclick={() => openComposer('quote')}><Icon name="quote" size={17} /></button
					>{/if}
				{#if mine && topLevel}<button
						class="ghost"
						class:active={post.kossori}
						type="button"
						disabled={kossoriBusy}
						aria-pressed={Boolean(post.kossori)}
						aria-label={post.kossori ? m.kossoriDisableAria() : m.kossoriEnableAria()}
						title={post.kossori ? m.kossoriDisable() : m.kossoriEnable()}
						onclick={toggleKossori}><Icon name="hide" size={17} /></button
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
		{/if}
		{#if postError && !composeMode}<p class="error" role="alert">{postError}</p>{/if}
	</div>
</div>
{#if composeMode && !displayOnly}
	<!-- リプライ／引用も「自分のアバター＋吹き出し」で、投稿後のカードと同じ並びに見せる -->
	<div class="post-row mine composer-row">
		<a href={`/profile/${$session?.did}`} aria-label={m.myProfileAria()}
			><Avatar actor={myProfile.current} /></a
		>
		<section class="bubble post-composer">
			<label for={`compose-${post.cid}`}
				>{composeMode === 'reply' ? m.replyComposerLabel() : m.quoteComposerLabel()}</label
			>
			<ComposerEditor
				id={`compose-${post.cid}`}
				bind:value={composeText}
				bind:mentions
				placeholder={composeMode === 'reply' ? m.replyPlaceholder() : m.quotePlaceholder()}
				disabled={posting}
				onsubmit={() => void submitPost()}
			/>
			<ImageAttachmentEditor bind:attachments disabled={posting} />
			<LinkCardEditor text={composeText} bind:cards={linkCards} disabled={posting} />
			<div class="post-composer-foot">
				{#if postError}<span class="error" role="alert">{postError}</span>{/if}
				<button
					class="ghost icon-action"
					type="button"
					disabled={posting}
					aria-label={m.cancel()}
					title={m.cancel()}
					onclick={() => {
						composeMode = undefined;
						attachments = [];
						linkCards = [];
						mentions = [];
					}}><Icon name="cancel" size={18} /></button
				>
				<button
					class="primary icon-action primary-icon"
					type="button"
					disabled={posting || (!composeText.trim() && !attachments.length && !linkCards.length)}
					aria-label={posting ? m.composerSubmitting() : m.composerSubmit()}
					title={posting ? m.composerSubmitting() : m.composerSubmit()}
					onclick={() => void submitPost()}
					><Icon name={posting ? 'refresh' : 'send'} size={18} /></button
				>
			</div>
		</section>
	</div>
{/if}
{#if deleteOpen}
	<PostDeleteDialog
		busy={deleting}
		error={deleteError}
		onconfirm={() => void removePost()}
		oncancel={() => (deleteOpen = false)}
	/>
{/if}

<style>
	.bubble.sending {
		border-style: dashed;
	}
	.bubble.sending::before,
	.bubble.sending::after {
		display: none;
	}
	.post-sending {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.45rem;
		color: var(--text-muted);
		font-size: 0.8125rem;
	}
</style>
