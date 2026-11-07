<script lang="ts">
	import type { ActorView, FeedItem, PostView } from '$lib/api/types';
	import ChatBubble from './ChatBubble.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import BotReplyStatus from './BotReplyStatus.svelte';
	import ThreadFlags from './ThreadFlags.svelte';
	import ReplyToViewerMark from './ReplyToViewerMark.svelte';
	import { isReplyToViewer } from '$lib/thread/reply-to-viewer';
	import Icon from './shell/Icon.svelte';
	import { replyIndent } from '$lib/thread/replyIndent';
	import { postPageHref } from '$lib/feed/post-follow.svelte';
	import { session, oauthReady, hadRecentSession } from '$lib/oauth/session.svelte';
	import { itemPosts, collapsibleBotReplies } from '$lib/thread/bot-reply-collapse';
	import {
		botReplyChecks,
		botReplyCheckRevision,
		invalidateBotReplyChecks,
	} from '$lib/thread/bot-reply-checks';
	let {
		item,
		botActor,
		ondeleted,
		onposted,
		hiddenPostUri,
		unread = false,
		entering = false,
		isPostEntering = () => false,
		collapseBotReplies = true,
	}: {
		item: FeedItem;
		botActor?: ActorView;
		ondeleted?: (uri: string) => void;
		onposted?: () => void | Promise<void>;
		/** 別枠で表示済みの投稿など、このURIの吹き出しだけを通常タイムラインから省く。 */
		hiddenPostUri?: string;
		/** 前回このフィードを見た時点より新しいスレッドか。カード全体に1本だけマークを出す。 */
		unread?: boolean;
		/** 新着スレッドの吹き出しをアバターから登場させる。 */
		entering?: boolean;
		/** 既存スレッドへ後着した返信を発言単位で登場させる。 */
		isPostEntering?: (uri: string) => boolean;
		/** false なら botたんの返信を折りたたまない（botたんのプロフィールの返信タブなど）。 */
		collapseBotReplies?: boolean;
	} = $props();

	let expandedUris = $state<Set<string>>(new Set());
	let checkedUris = $state<Set<string>>(new Set());
	let knownPosts = $derived(itemPosts(item));
	let candidates = $derived(
		collapseBotReplies ? collapsibleBotReplies(knownPosts, $session?.did, true) : new Set<string>(),
	);
	let ready = $derived(Boolean($session || $oauthReady || !hadRecentSession()));
	let collapseUris = $derived(
		ready ? new Set([...candidates].filter((uri) => checkedUris.has(uri))) : new Set<string>(),
	);
	$effect(() => {
		const posts = knownPosts;
		const viewer = $session?.did;
		const revision = $botReplyCheckRevision;
		const currentItem = item;
		const eligible = candidates;
		checkedUris = new Set();
		if (!ready || !eligible.size) return;
		if (currentItem.conversation?.hiddenCount === 0) {
			checkedUris = eligible;
			return;
		}
		const rootUri = posts.find((post) => eligible.has(post.uri))?.reply?.root.uri;
		if (!rootUri) return;
		let active = true;
		const signature = JSON.stringify([
			revision,
			posts.map((post) => [post.uri, post.cid, post.reply, post.deleted]),
			currentItem.conversation?.totalCount,
		]);
		void botReplyChecks.get(viewer, rootUri, signature).then((thread) => {
			if (!active || !thread) return;
			// Local optimistic replies override a fetched snapshot immediately.
			checkedUris = collapsibleBotReplies([thread.post, ...thread.replies, ...posts], viewer);
		});
		return () => {
			active = false;
		};
	});
	function toggleReply(uri: string) {
		const next = new Set(expandedUris);
		if (next.has(uri)) next.delete(uri);
		else next.add(uri);
		expandedUris = next;
	}
	function postDeleted(uri: string) {
		invalidateBotReplyChecks();
		ondeleted?.(uri);
	}
	async function postPosted() {
		invalidateBotReplyChecks();
		await onposted?.();
	}

	// 会話グループ(group モード)では待機状態は conversation.awaitingBotReply が持つ。
	let conv = $derived(item.conversation);
	let botState = $derived(conv ? conv.awaitingBotReply : item.botReplyState);
	let showConvRoot = $derived(Boolean(conv && conv.root.uri !== hiddenPostUri));
	let visibleConvBubbles = $derived(
		conv?.bubbles.filter((bubble) => bubble.post.uri !== hiddenPostUri) ?? [],
	);
	let showConversation = $derived(
		Boolean(conv && (showConvRoot || visibleConvBubbles.length > 0 || botState)),
	);
	// こっそり投稿の URI は著者ではなく AppView の DID 配下なので、リンクは URI から組む。
	let fullThreadHref = $derived(conv ? postPageHref(conv.root) : '');
	let convKossori = $derived(Boolean(conv && (conv.root.threadKossori ?? conv.root.kossori)));
	let threadKossori = $derived(
		Boolean(
			item.threadKossori ??
			item.replyParent?.threadKossori ??
			item.botReply?.threadKossori ??
			item.kossori,
		),
	);
	let showParent = $derived(Boolean(item.replyParent && item.replyParent.uri !== hiddenPostUri));
	let showItem = $derived(item.uri !== hiddenPostUri);
	let showBotReply = $derived(Boolean(item.botReply && item.botReply.uri !== hiddenPostUri));
	let hasVisiblePost = $derived(showParent || showItem || showBotReply);
</script>

{#snippet replyToggle(post: PostView, expanded: boolean)}
	<button
		type="button"
		class="thread-reply-toggle-btn"
		class:expanded
		aria-expanded={expanded}
		onclick={() => toggleReply(post.uri)}
	>
		<Icon name="chevron" size={12} />
		<span>{expanded ? m.hideReplies() : m.showBotReply()}</span>
	</button>
{/snippet}

{#snippet postBubble(post: PostView)}
	{@const collapsible = collapseUris.has(post.uri)}
	{@const expanded = expandedUris.has(post.uri)}
	{#if collapsible && !expanded}
		{@render replyToggle(post, false)}
	{:else}
		{#if isReplyToViewer(post, $session?.did, knownPosts)}<ReplyToViewerMark />{/if}
		<ChatBubble {post} {botActor} ondeleted={postDeleted} onposted={postPosted} />
		{#if collapsible}{@render replyToggle(post, true)}{/if}
	{/if}
{/snippet}

{#if conv && showConversation}
	<article
		class="thread-unit"
		class:unread
		class:optimistic={Boolean(item.optimisticState)}
		class:feed-entering={entering}
		data-post-uri={item.uri}
		data-optimistic-key={item.optimisticKey}
	>
		<ThreadFlags kossori={convKossori} />
		{#if showConvRoot}
			{@render postBubble(conv.root)}
		{/if}
		{#if conv.hiddenCount > 0}<a
				class="thread-gap"
				href={fullThreadHref}
				aria-label={m.threadViewAll()}>{m.threadMore({ count: conv.hiddenCount })}</a
			>{/if}

		{#each visibleConvBubbles as bubble (bubble.post.uri)}
			<div
				class="thread-reply"
				class:message-entering={!entering && isPostEntering(bubble.post.uri)}
				style="--reply-indent: {replyIndent(bubble.depth)}"
				data-post-uri={bubble.post.uri}
				data-optimistic-key={bubble.post.optimisticKey}
			>
				{@render postBubble(bubble.post)}
			</div>
		{/each}

		<BotReplyStatus
			state={botState}
			createdAt={item.createdAt}
			{botActor}
			optimistic={Boolean(item.optimisticState)}
		/>
	</article>
{:else if hasVisiblePost}
	<article
		class="thread-unit"
		class:unread
		class:optimistic={Boolean(item.optimisticState)}
		class:feed-entering={entering}
		data-post-uri={item.uri}
		data-optimistic-key={item.optimisticKey}
	>
		<ThreadFlags kossori={threadKossori} />
		{#if showParent && item.replyParent}
			{@render postBubble(item.replyParent)}
		{/if}
		{#if showItem}
			{#if showParent}<div class="thread-reply" class:message-entering={isPostEntering(item.uri)}>
					{@render postBubble(item)}
				</div>
			{:else}{@render postBubble(item)}
			{/if}
		{/if}
		{#if !item.optimisticState && showBotReply && item.botReply}
			<div class:thread-reply={showItem} class:message-entering={isPostEntering(item.botReply.uri)}>
				{@render postBubble(item.botReply)}
			</div>
		{:else if showItem}
			<BotReplyStatus
				state={item.botReplyState}
				createdAt={item.createdAt}
				{botActor}
				optimistic={Boolean(item.optimisticState)}
			/>
		{/if}
	</article>
{/if}

<style>
	/* 省略中の .thread-gap（「N件のやりとり」）と同じ控えめな見た目にそろえる。 */
	.thread-reply-toggle-btn {
		display: flex;
		align-items: center;
		gap: 4px;
		width: fit-content;
		margin: 8px auto 2px;
		padding: 3px 12px;
		border: 1px solid var(--line);
		border-radius: var(--radius-pill);
		background: var(--bg-inset);
		color: var(--text-faint);
		font: inherit;
		font-size: 12px;
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			color 0.15s ease;
	}

	.thread-reply-toggle-btn:hover {
		background: var(--bg-hover);
		color: var(--text);
	}

	.thread-reply-toggle-btn :global(.icon) {
		transition: transform 0.2s ease;
		transform: rotate(90deg);
	}

	.thread-reply-toggle-btn.expanded :global(.icon) {
		transform: rotate(-90deg);
	}
</style>
