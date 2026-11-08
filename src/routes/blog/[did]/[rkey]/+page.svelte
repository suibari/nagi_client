<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import ArticleTitleInput from '$lib/components/ArticleTitleInput.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { getThread, APPVIEW_URL } from '$lib/api/appview';
	import type { ReactionView, ThreadView } from '$lib/api/types';
	import RichText from '$lib/components/RichText.svelte';
	import AvatarLink from '$lib/components/AvatarLink.svelte';
	import ReactionBar from '$lib/components/ReactionBar.svelte';
	import ChatBubble from '$lib/components/ChatBubble.svelte';
	import ImageGallery from '$lib/components/ImageGallery.svelte';
	import LinkCard from '$lib/components/LinkCard.svelte';
	import GuestHero from '$lib/components/GuestHero.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';
	import { splitArticleText } from '$lib/blog/articleText';
	import { articleMedia } from '$lib/blog/articleMedia';
	import { isTranslationCandidate, postTranslations } from '$lib/i18n/postTranslations.svelte';
	import { languageName, languagePreferences } from '$lib/i18n/languagePreferences.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import { composerHost } from '$lib/post/composer-host.svelte';
	import { optimisticPosts } from '$lib/feed/optimistic-posts.svelte';
	import { followPostedScroll } from '$lib/feed/post-follow.svelte';
	import { replyDepths, replyIndent } from '$lib/thread/replyIndent';
	import { m, dateLocale, i18n } from '$lib/i18n/i18n.svelte';

	let { data } = $props();
	// プリレンダHTMLには紹介を残し、認証確認中は GuestHero の CSS で隠す。
	const showHero = $derived(!$session);
	// svelte-ignore state_referenced_locally -- prerender snapshot; onMount refreshes viewer-specific state
	let thread = $state<ThreadView | undefined>(data.thread);
	let error = $state('');
	let editing = $state(false);
	let editTitle = $state('');
	let editBusy = $state(false);
	let bottomPickerOpen = $state(false);
	let bottomReactionButton = $state<HTMLElement>();
	let reactionHoldUntil = 0;
	let refreshVersion = 0;
	let labels = $derived(
		i18n.locale === 'ja'
			? {
					blog: 'ブログ',
					tags: 'タグ',
					reactions: 'リアクション',
					comment: 'コメントする',
					comments: 'コメント',
					write: 'コメントを書く',
					empty: 'まだコメントはありません。最初のコメントをどうぞ。',
					loadError: 'コメントを読み込めませんでした。',
				}
			: {
					blog: 'Blog',
					tags: 'Tags',
					reactions: 'React',
					comment: 'Comment',
					comments: 'Comments',
					write: 'Write a comment',
					empty: 'No comments yet. Be the first to comment.',
					loadError: 'Could not load comments.',
				},
	);
	let post = $derived(thread?.post);
	let text = $derived(post?.text ?? data.post.text);
	let original = $derived(splitArticleText(text));

	// 記事本文の自動翻訳。プリレンダの HTML は原文のまま残し（検索・OGP 用）、
	// AppView のスレッドが読めて langs と cid が揃ってから訳文へ差し替える。
	// AppView は日本語などの記事を取り込み時に英訳しているので、英語ならキャッシュから返る。
	let translationTarget = $derived(languagePreferences.translationLanguage);
	let translationEligible = $derived(
		Boolean(
			post &&
			!editing &&
			languagePreferences.autoTranslate &&
			isTranslationCandidate(post, translationTarget),
		),
	);
	let translation = $derived(
		post && translationEligible
			? postTranslations.entry(post.uri, post.cid, translationTarget)
			: undefined,
	);
	let translating = $derived(
		translationEligible && (!translation || translation.status === 'loading'),
	);
	let translationFailed = $derived(translation?.status === 'failed');
	let translatedText = $derived(translation?.status === 'translated' ? translation.text : '');
	let showOriginal = $state(false);
	let showingTranslation = $derived(Boolean(translatedText) && !showOriginal);
	let translated = $derived(
		translatedText ? splitArticleText(translatedText, Boolean(original.prefix)) : undefined,
	);
	let targetLanguageName = $derived(languageName(translationTarget, i18n.locale));
	$effect(() => {
		if (post && translationEligible && !translation) postTranslations.ensure(post);
	});

	let title = $derived(showingTranslation && translated ? translated.title : original.title);
	let titlePrefix = $derived(original.prefix);
	let body = $derived(showingTranslation && translated ? translated.body : original.body);
	let bodyFacets = $derived(
		// facet のバイト位置は原文のもの。訳文には当てない。
		showingTranslation
			? undefined
			: post?.facets
					?.filter((facet) => facet.index.byteStart >= new TextEncoder().encode(titlePrefix).length)
					.map((facet) => {
						const offset = new TextEncoder().encode(titlePrefix).length;
						return {
							...facet,
							index: {
								byteStart: facet.index.byteStart - offset,
								byteEnd: facet.index.byteEnd - offset,
							},
						};
					}),
	);
	let author = $derived(post?.author ?? data.post.author);
	// 本文に `![alt](url)` で置いた画像・URL だけの行に置いたリンクカードはその位置に出す。
	// 残りの画像の先頭はヘッダー、それ以外とカードは本文の後ろにまとめる（フィードと共通）。
	let images = $derived(post?.images ?? []);
	let linkCards = $derived(post?.linkCards ?? []);
	let media = $derived(
		articleMedia(text, images, linkCards, [new URL(APPVIEW_URL, 'http://localhost').origin]),
	);
	let cover = $derived(media.cover);
	let bodyImages = $derived(media.looseImages);
	let looseLinkCards = $derived(media.looseLinkCards);
	let reactions = $derived(post?.reactions ?? []);
	let replies = $derived([
		...(thread?.replies ?? []).filter(
			(reply) => !optimisticPosts.items.some((item) => item.uri === reply.uri),
		),
		...optimisticPosts.items.filter((item) => item.reply?.root.uri === data.post.uri),
	]);
	let depths = $derived(replyDepths(data.post.uri, [...(post ? [post] : []), ...replies]));
	followPostedScroll(() => replies);

	async function refresh() {
		const version = ++refreshVersion;
		const viewer = $session?.did;
		const next = (await getThread(data.post.uri)).thread;
		if (version !== refreshVersion || viewer !== $session?.did) return;
		optimisticPosts.reconcile([next.post, ...next.replies]);
		if (Date.now() < reactionHoldUntil && post) next.post.reactions = post.reactions;
		thread = next;
		error = '';
	}
	function shareReactions(next: ReactionView[]) {
		if (!thread) return;
		reactionHoldUntil = Date.now() + 15_000;
		thread = { ...thread, post: { ...thread.post, reactions: next } };
	}
	function reply() {
		if (!post) return;
		if (!$session) {
			void goto('/login');
			return;
		}
		composerHost.openReply(post, 'feed');
	}
	function replyDeleted(uri: string) {
		if (thread) thread = { ...thread, replies: thread.replies.filter((item) => item.uri !== uri) };
	}
	onMount(() => {
		const unsubscribe = session.subscribe(() => {
			reactionHoldUntil = 0;
			void refresh().catch(
				(cause) => (error = cause instanceof Error ? cause.message : String(cause)),
			);
		});
		const timer = setInterval(() => {
			if (
				document.visibilityState === 'visible' &&
				optimisticPosts.items.some((item) => item.reply?.root.uri === data.post.uri)
			)
				void refresh().catch(() => undefined);
		}, 3_000);
		return () => {
			unsubscribe();
			refreshVersion++;
			clearInterval(timer);
		};
	});
</script>

<svelte:head>
	<!-- standard.site の document 検証。プリレンダの記事は SPA 関数（og/html.ts）を通らないので、ここでも出す。 -->
	{#if data.post.uri.includes('/site.standard.document/')}
		<link rel="site.standard.document" href={data.post.uri} />
	{/if}
</svelte:head>

{#if showHero}
	<GuestHero />
{/if}

<article class="blog-article">
	{#if cover}
		<div class="blog-cover">
			<img src={cover.url.startsWith('/') ? APPVIEW_URL + cover.url : cover.url} alt={cover.alt} />
		</div>
	{/if}
	<header class="blog-header">
		<p class="blog-label"><Icon name="newspaper" size={17} /> {labels.blog}</p>
		{#if editing}
			<ArticleTitleInput bind:value={editTitle} disabled={editBusy} />
		{:else}
			<h1>{title}</h1>
		{/if}
		<div class="blog-byline">
			<AvatarLink actor={author} size="small" />
			<div class="blog-author">
				<a href={'/profile/' + author.did}>{author.displayName ?? author.handle}</a>
				<span>@{author.handle}</span>
			</div>
			<time datetime={post?.createdAt ?? data.post.createdAt}>
				{new Date(post?.createdAt ?? data.post.createdAt).toLocaleDateString(dateLocale(), {
					year: 'numeric',
					month: 'long',
					day: 'numeric',
				})}
			</time>
		</div>
		{#if data.tags.length}
			<div class="blog-tags" aria-label={labels.tags}>
				{#each data.tags as tag}<a href={'/search?tag=' + encodeURIComponent(tag.toLowerCase())}
						>#{tag}</a
					>{/each}
			</div>
		{/if}
	</header>

	{#if thread && post && !post.deleted && $session?.did === post.author.did}
		<ChatBubble
			bind:post={thread.post}
			bind:editing
			bind:editTitle
			bind:editBusy
			externalTitleEditor
			managementOnly
			ondeleted={() => void goto('/blog')}
		/>
	{/if}

	{#if translating}
		<p class="blog-translation" aria-live="polite">
			<Spinner size="sm" inline decorative />
			<span>{m.translatingTo({ language: targetLanguageName })}</span>
		</p>
	{:else if translatedText}
		<p class="blog-translation" aria-live="polite">
			<Icon name="language" size={15} />
			<span>{showOriginal ? m.showingOriginalArticle() : m.translationLabel()}</span>
			<button type="button" onclick={() => (showOriginal = !showOriginal)}
				>{showOriginal ? m.showTranslatedArticle() : m.showOriginalText()}</button
			>
		</p>
	{:else if translationFailed && post}
		<p class="blog-translation" aria-live="polite">
			<span>{m.translationFailed()}</span>
			<button type="button" onclick={() => post && void postTranslations.retry(post)}
				>{m.translationRetry()}</button
			>
		</p>
	{/if}

	<div class="blog-body post-text" lang={showingTranslation ? translationTarget : undefined}>
		<RichText text={body} facets={bodyFacets} {images} {linkCards} />
	</div>
	{#if bodyImages.length}<div class="blog-media"><ImageGallery images={bodyImages} /></div>{/if}
	{#if looseLinkCards.length}<div class="blog-links">
			{#each looseLinkCards as card}<LinkCard {card} />{/each}
		</div>{/if}

	{#if post}
		<div class="blog-interactions blog-interactions-end" aria-label={labels.reactions}>
			<ReactionBar
				uri={post.uri}
				cid={post.cid}
				{reactions}
				onchange={shareReactions}
				showReactors={$session?.did === post.author.did}
				bind:pickerOpen={bottomPickerOpen}
				pickerAnchor={bottomReactionButton}
			/>
			<div class="blog-action-buttons">
				<Button
					variant="secondary"
					size="sm"
					type="button"
					bind:ref={bottomReactionButton}
					aria-label={m.addReactionAria()}
					aria-expanded={bottomPickerOpen}
					onclick={() => (bottomPickerOpen = !bottomPickerOpen)}
				>
					<Icon name="emojiPlus" size={19} /> <span>{labels.reactions}</span>
				</Button>
				<Button variant="secondary" size="sm" type="button" onclick={reply}
					><Icon name="reply" size={18} /> <span>{labels.comment}</span></Button
				>
			</div>
		</div>
	{/if}

	<section class="blog-comments" id="comments" aria-labelledby="comments-title">
		<div class="comments-heading">
			<h2 id="comments-title">{labels.comments} <span>{replies.length}</span></h2>
			{#if post}<Button variant="secondary" size="sm" type="button" onclick={reply}
					>{labels.write}</Button
				>{/if}
		</div>
		{#if error && !thread}<p class="state error" role="alert">{labels.loadError} {error}</p>
		{:else if !thread}<Spinner />
		{:else if !replies.length}<p class="comments-empty">{labels.empty}</p>
		{:else}
			<div class="blog-comment-list">
				{#each replies as comment (comment.uri)}
					<div
						class="blog-comment"
						id={'comment-' + comment.uri.split('/').pop()}
						style:--reply-indent={replyIndent(depths.get(comment.uri) ?? 1)}
						data-post-uri={comment.uri}
						data-optimistic-key={comment.optimisticKey}
					>
						<ChatBubble
							post={comment}
							ondeleted={replyDeleted}
							onposted={refresh}
							collapsible={false}
							permalinkHref={'#comment-' + comment.uri.split('/').pop()}
						/>
					</div>
				{/each}
			</div>
		{/if}
	</section>
</article>

<style>
	.blog-article {
		max-width: 820px;
		margin: 0 auto;
		padding: 20px 22px 96px;
	}
	.blog-cover {
		margin: 0 -22px 30px;
		overflow: hidden;
		border-radius: 18px;
		background: var(--bg-inset);
	}
	.blog-cover img {
		display: block;
		width: 100%;
		max-height: 420px;
		object-fit: cover;
	}
	.blog-header {
		padding-bottom: 22px;
		border-bottom: 1px solid var(--line);
	}
	.blog-label {
		display: flex;
		align-items: center;
		gap: 7px;
		margin: 0 0 13px;
		color: var(--accent-strong);
		font-size: 13px;
		font-weight: 700;
	}
	.blog-translation {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px 8px;
		margin: 18px 0 0;
		color: var(--text-muted);
		font-size: 13px;
	}
	.blog-translation button {
		padding: 0;
		border: 0;
		background: none;
		color: var(--accent-strong);
		font-size: inherit;
	}
	.blog-translation button:hover {
		text-decoration: underline;
	}
	h1 {
		margin: 0 0 24px;
		font-size: clamp(1.8rem, 4vw, 2.7rem);
		line-height: 1.35;
		letter-spacing: -0.025em;
		overflow-wrap: anywhere;
	}
	.blog-byline {
		display: flex;
		align-items: center;
		gap: 10px;
		color: var(--text-muted);
		font-size: 13px;
	}
	.blog-author {
		display: grid;
		gap: 2px;
		min-width: 0;
	}
	.blog-author a {
		color: var(--text);
		font-weight: 700;
		text-decoration: none;
	}
	.blog-author span {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.blog-byline time {
		margin-left: auto;
		white-space: nowrap;
	}
	.blog-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 22px;
	}
	.blog-tags a {
		padding: 5px 11px;
		border-radius: 999px;
		background: var(--bg-inset);
		color: var(--accent-strong);
		font-size: 13px;
		text-decoration: none;
	}
	.blog-tags a:hover {
		background: var(--bg-hover);
	}
	.blog-interactions {
		padding: 18px 0;
		border-bottom: 1px solid var(--line);
	}
	.blog-interactions-end {
		margin-top: 32px;
		border-top: 1px solid var(--line);
	}
	.blog-action-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 12px;
	}
	.blog-body {
		margin: 34px 0;
	}

	.blog-media,
	.blog-links {
		margin: 24px 0;
	}
	.blog-comments {
		margin-top: 46px;
	}
	.comments-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding-bottom: 16px;
		border-bottom: 1px solid var(--line);
	}
	.comments-heading h2 {
		margin: 0;
		font-size: 1.3rem;
	}
	.comments-heading h2 span {
		color: var(--text-muted);
		font-size: 0.85em;
	}
	.comments-empty {
		padding: 25px 0;
		color: var(--text-muted);
	}
	.blog-comment-list {
		padding-top: 12px;
	}
	.blog-comment {
		padding-left: calc(var(--reply-indent) * 18px);
		margin: 0 0 12px;
	}
	@media (max-width: 600px) {
		.blog-article {
			padding: 0 16px 70px;
		}
		.blog-cover {
			margin: 0 -16px 24px;
			border-radius: 0;
		}
		.blog-byline {
			flex-wrap: wrap;
		}
		.blog-byline time {
			margin-left: 0;
			width: 100%;
			padding-left: 42px;
		}
	}
</style>
