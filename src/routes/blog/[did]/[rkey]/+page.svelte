<script lang="ts">
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
	import Icon from '$lib/components/shell/Icon.svelte';
	import { extractTitle } from '$lib/atproto/markdown';
	import { session } from '$lib/oauth/session.svelte';
	import { composerHost } from '$lib/post/composer-host.svelte';
	import { optimisticPosts } from '$lib/feed/optimistic-posts.svelte';
	import { followPostedScroll } from '$lib/feed/post-follow.svelte';
	import { replyDepths, replyIndent } from '$lib/thread/replyIndent';
	import { m, dateLocale, i18n } from '$lib/i18n/i18n.svelte';

	let { data } = $props();
	// svelte-ignore state_referenced_locally -- prerender snapshot; onMount refreshes viewer-specific state
	let thread = $state<ThreadView | undefined>(data.thread);
	let error = $state('');
	let bottomPickerOpen = $state(false);
	let bottomReactionButton = $state<HTMLButtonElement>();
	let reactionHoldUntil = 0;
	let labels = $derived(i18n.locale === 'ja'
		? { blog: 'ブログ', tags: 'タグ', reactions: 'リアクション', comment: 'コメントする', comments: 'コメント', write: 'コメントを書く', empty: 'まだコメントはありません。最初のコメントをどうぞ。', loadError: 'コメントを読み込めませんでした。' }
		: { blog: 'Blog', tags: 'Tags', reactions: 'React', comment: 'Comment', comments: 'Comments', write: 'Write a comment', empty: 'No comments yet. Be the first to comment.', loadError: 'Could not load comments.' });
	let post = $derived(thread?.post);
	let text = $derived(post?.text ?? data.post.text);
	let title = $derived(extractTitle(text) ?? text.slice(0, 80));
	let titlePrefix = $derived(text.match(/^# [^\n]+\n*\s*/)?.[0] ?? '');
	let body = $derived(text.slice(titlePrefix.length));
	let bodyFacets = $derived(
		post?.facets
			?.filter((facet) => facet.index.byteStart >= new TextEncoder().encode(titlePrefix).length)
			.map((facet) => {
				const offset = new TextEncoder().encode(titlePrefix).length;
				return {
					...facet,
					index: { byteStart: facet.index.byteStart - offset, byteEnd: facet.index.byteEnd - offset },
				};
			}),
	);
	let author = $derived(post?.author ?? data.post.author);
	let cover = $derived(post?.images?.[0]);
	let bodyImages = $derived(post?.images?.slice(1) ?? []);
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
		const next = (await getThread(data.post.uri)).thread;
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
		void refresh().catch((cause) => (error = cause instanceof Error ? cause.message : String(cause)));
		const timer = setInterval(() => {
			if (
				document.visibilityState === 'visible' &&
				optimisticPosts.items.some((item) => item.reply?.root.uri === data.post.uri)
			) void refresh().catch(() => undefined);
		}, 3_000);
		return () => clearInterval(timer);
	});
</script>

<article class="blog-article">
	{#if cover}
		<div class="blog-cover">
			<img src={cover.url.startsWith('/') ? APPVIEW_URL + cover.url : cover.url} alt={cover.alt} />
		</div>
	{/if}
	<header class="blog-header">
		<p class="blog-label"><Icon name="newspaper" size={17} /> {labels.blog}</p>
		<h1>{title}</h1>
		<div class="blog-byline">
			<AvatarLink actor={author} size="small" />
			<div class="blog-author">
				<a href={'/profile/' + author.did}>{author.displayName ?? author.handle}</a>
				<span>@{author.handle}</span>
			</div>
			<time datetime={post?.createdAt ?? data.post.createdAt}>
				{new Date(post?.createdAt ?? data.post.createdAt).toLocaleDateString(dateLocale(), {
					year: 'numeric', month: 'long', day: 'numeric',
				})}
			</time>
		</div>
		{#if data.tags.length}
			<div class="blog-tags" aria-label={labels.tags}>
				{#each data.tags as tag}<a href={'/search?tag=' + encodeURIComponent(tag.toLowerCase())}>#{tag}</a>{/each}
			</div>
		{/if}
	</header>

	<div class="blog-body"><RichText text={body} facets={bodyFacets} /></div>
	{#if bodyImages.length}<div class="blog-media"><ImageGallery images={bodyImages} /></div>{/if}
	{#if post?.linkCards?.length}<div class="blog-links">
			{#each post.linkCards as card}<LinkCard {card} />{/each}
		</div>{/if}

	{#if post}
		<div class="blog-interactions blog-interactions-end" aria-label={labels.reactions}>
			<ReactionBar uri={post.uri} cid={post.cid} {reactions} onchange={shareReactions}
				showReactors={$session?.did === post.author.did}
				bind:pickerOpen={bottomPickerOpen} pickerAnchor={bottomReactionButton} />
			<div class="blog-action-buttons">
				<button type="button" bind:this={bottomReactionButton} aria-label={m.addReactionAria()}
					aria-expanded={bottomPickerOpen} onclick={() => bottomPickerOpen = !bottomPickerOpen}>
					<Icon name="emojiPlus" size={19} /> <span>{labels.reactions}</span>
				</button>
				<button type="button" onclick={reply}><Icon name="reply" size={18} /> <span>{labels.comment}</span></button>
			</div>
		</div>
	{/if}

	<section class="blog-comments" id="comments" aria-labelledby="comments-title">
		<div class="comments-heading">
			<h2 id="comments-title">{labels.comments} <span>{replies.length}</span></h2>
			{#if post}<button type="button" onclick={reply}>{labels.write}</button>{/if}
		</div>
		{#if error && !thread}<p class="state error" role="alert">{labels.loadError} {error}</p>
		{:else if !thread}<p class="state">{m.loading()}</p>
		{:else if !replies.length}<p class="comments-empty">{labels.empty}</p>
		{:else}
			<div class="blog-comment-list">
				{#each replies as comment (comment.uri)}
					<div class="blog-comment"
						id={'comment-' + comment.uri.split('/').pop()}
						style:--reply-indent={replyIndent(depths.get(comment.uri) ?? 1)}
						data-post-uri={comment.uri} data-optimistic-key={comment.optimisticKey}>
						<ChatBubble post={comment} ondeleted={replyDeleted} onposted={refresh} collapsible={false}
							permalinkHref={'#comment-' + comment.uri.split('/').pop()} />
					</div>
				{/each}
			</div>
		{/if}
	</section>
</article>

<style>
	.blog-article { max-width: 820px; margin: 0 auto; padding: 20px 22px 96px; }
	.blog-cover { margin: 0 -22px 30px; overflow: hidden; border-radius: 18px; background: var(--bg-inset); }
	.blog-cover img { display: block; width: 100%; max-height: 420px; object-fit: cover; }
	.blog-header { padding-bottom: 22px; border-bottom: 1px solid var(--line); }
	.blog-label { display: flex; align-items: center; gap: 7px; margin: 0 0 13px; color: var(--accent-strong); font-size: 13px; font-weight: 700; }
	h1 { margin: 0 0 24px; font-size: clamp(1.8rem, 4vw, 2.7rem); line-height: 1.35; letter-spacing: -.025em; overflow-wrap: anywhere; }
	.blog-byline { display: flex; align-items: center; gap: 10px; color: var(--text-muted); font-size: 13px; }
	.blog-author { display: grid; gap: 2px; min-width: 0; }
	.blog-author a { color: var(--text); font-weight: 700; text-decoration: none; }
	.blog-author span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.blog-byline time { margin-left: auto; white-space: nowrap; }
	.blog-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 22px; }
	.blog-tags a { padding: 5px 11px; border-radius: 999px; background: var(--bg-inset); color: var(--accent-strong); font-size: 13px; text-decoration: none; }
	.blog-tags a:hover { background: var(--bg-hover); }
	.blog-interactions { padding: 18px 0; border-bottom: 1px solid var(--line); }
	.blog-interactions-end { margin-top: 32px; border-top: 1px solid var(--line); }
	.blog-action-buttons { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
	.blog-action-buttons button, .comments-heading button { display: inline-flex; align-items: center; gap: 7px; padding: 8px 13px; border: 1px solid var(--line); border-radius: 999px; background: var(--bg-inset); color: var(--text); font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; }
	.blog-action-buttons button:hover, .comments-heading button:hover { border-color: var(--accent-strong); color: var(--accent-strong); }
	.blog-body { margin: 34px 0; line-height: 1.9; font-size: 1.03rem; overflow-wrap: anywhere; }
	.blog-body :global(p) { margin: 0 0 1.25em; }
	.blog-body :global(h3), .blog-body :global(h4), .blog-body :global(h5) { margin: 1.8em 0 .6em; line-height: 1.4; }
	.blog-body :global(h3) { font-size: 1.5rem; }
	.blog-body :global(h4) { font-size: 1.25rem; }
	.blog-body :global(blockquote) { margin: 1.5em 0; padding: .2em 1.1em; border-left: 3px solid var(--accent-strong); color: var(--text-muted); }
	.blog-media, .blog-links { margin: 24px 0; }
	.blog-comments { margin-top: 46px; }
	.comments-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-bottom: 16px; border-bottom: 1px solid var(--line); }
	.comments-heading h2 { margin: 0; font-size: 1.3rem; }
	.comments-heading h2 span { color: var(--text-muted); font-size: .85em; }
	.comments-empty { padding: 25px 0; color: var(--text-muted); }
	.blog-comment-list { padding-top: 12px; }
	.blog-comment { padding-left: calc(var(--reply-indent) * 18px); margin: 0 0 12px; }
	@media (max-width: 600px) { .blog-article { padding: 0 16px 70px; } .blog-cover { margin: 0 -16px 24px; border-radius: 0; } .blog-byline { flex-wrap: wrap; } .blog-byline time { margin-left: 0; width: 100%; padding-left: 42px; } }
</style>
