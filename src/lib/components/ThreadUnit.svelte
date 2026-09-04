<script lang="ts">
	import type { ActorView, FeedItem, PostView } from '$lib/api/types';
	import ChatBubble from './ChatBubble.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import BotReplyStatus from './BotReplyStatus.svelte';
	import ThreadFlags from './ThreadFlags.svelte';
	import Icon from './shell/Icon.svelte';
	import { replyIndent } from '$lib/thread/replyIndent';
	import { postHref } from '$lib/feed/post-follow.svelte';
	let {
		item,
		botActor,
		ondeleted,
		onposted,
		canPin = false,
		pinChannelUri,
		pinnedPostUri,
		hiddenPostUri,
		pinBusy = false,
		ontogglepin,
		unread = false,
		collapsibleReplies = false,
	}: {
		item: FeedItem;
		botActor?: ActorView;
		ondeleted?: (uri: string) => void;
		onposted?: () => void | Promise<void>;
		canPin?: boolean;
		/** ピン操作を許可する所属チャンネル。異なるチャンネルの親投稿は対象外にする。 */
		pinChannelUri?: string;
		pinnedPostUri?: string;
		/** ピン枠と重複するこのURIの吹き出しだけを通常タイムラインから省く。 */
		hiddenPostUri?: string;
		pinBusy?: boolean;
		ontogglepin?: (post: PostView) => void | Promise<void>;
		/** 前回このフィードを見た時点より新しいスレッドか。カード全体に1本だけマークを出す。 */
		unread?: boolean;
		/** 返信を最初は折りたたんで展開ボタン形式にするか。 */
		collapsibleReplies?: boolean;
	} = $props();

	let repliesExpanded = $state(false);

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
	let fullThreadHref = $derived(conv ? postHref(conv.root.uri) : '');
	let convChannel = $derived(
		conv?.root.channel ?? conv?.bubbles.find((b) => b.post.channel)?.post.channel,
	);
	let convKossori = $derived(
		Boolean(conv && (conv.root.threadKossori ?? conv.root.kossori)),
	);
	let channel = $derived(item.channel ?? item.replyParent?.channel ?? item.botReply?.channel);
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
	const canPinPost = (post: PostView) =>
		canPin && (!pinChannelUri || post.channel?.uri === pinChannelUri);
</script>

{#if conv && showConversation}
	<article
		class="thread-unit"
		class:unread
		class:optimistic={Boolean(item.optimisticState)}
		data-post-uri={item.uri}
		data-optimistic-key={item.optimisticKey}
	>
		<ThreadFlags channel={convChannel} kossori={convKossori} />
		{#if showConvRoot}
			<ChatBubble
				post={conv.root}
				{botActor}
				{ondeleted}
				{onposted}
				canPin={canPinPost(conv.root)}
				pinned={conv.root.uri === pinnedPostUri}
				{pinBusy}
				{ontogglepin}
			/>
		{/if}
		{#if conv.hiddenCount > 0}<a
				class="thread-gap"
				href={fullThreadHref}
				aria-label={m.threadViewAll()}>{m.threadMore({ count: conv.hiddenCount })}</a
			>{/if}

		{#if visibleConvBubbles.length > 0}
			{#if collapsibleReplies && !repliesExpanded}
				<button
					type="button"
					class="thread-reply-toggle-btn"
					onclick={() => (repliesExpanded = true)}
				>
					<Icon name="chevron" size={14} />
					<span>{m.showReplies({ count: visibleConvBubbles.length })}</span>
				</button>
			{:else}
				{#each visibleConvBubbles as bubble (bubble.post.uri)}
					<!-- data-* は投稿後の追従スクロールの目印。楽観返信はここへ合流して出る。 -->
					<div
						class="thread-reply"
						style="--reply-indent: {replyIndent(bubble.depth)}"
						data-post-uri={bubble.post.uri}
						data-optimistic-key={bubble.post.optimisticKey}
					>
						<ChatBubble
							post={bubble.post}
							{botActor}
							{ondeleted}
							{onposted}
							canPin={canPinPost(bubble.post)}
							pinned={bubble.post.uri === pinnedPostUri}
							{pinBusy}
							{ontogglepin}
						/>
					</div>
				{/each}
				{#if collapsibleReplies && repliesExpanded}
					<button
						type="button"
						class="thread-reply-toggle-btn expanded"
						onclick={() => (repliesExpanded = false)}
					>
						<Icon name="chevron" size={14} />
						<span>{m.hideReplies()}</span>
					</button>
				{/if}
			{/if}
		{/if}

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
		data-post-uri={item.uri}
		data-optimistic-key={item.optimisticKey}
	>
		<ThreadFlags {channel} kossori={threadKossori} />
		{#if showParent && item.replyParent}
			<ChatBubble
				post={item.replyParent}
				{botActor}
				{ondeleted}
				{onposted}
				canPin={canPinPost(item.replyParent)}
				pinned={item.replyParent.uri === pinnedPostUri}
				{pinBusy}
				{ontogglepin}
			/>
		{/if}
		{#if showItem}
			{#if showParent}<div class="thread-reply">
					<ChatBubble
						post={item}
						{botActor}
						{ondeleted}
						{onposted}
						canPin={canPinPost(item)}
						pinned={item.uri === pinnedPostUri}
						{pinBusy}
						{ontogglepin}
					/>
				</div>
			{:else}<ChatBubble
					post={item}
					{botActor}
					{ondeleted}
					{onposted}
					canPin={canPinPost(item)}
					pinned={item.uri === pinnedPostUri}
					{pinBusy}
					{ontogglepin}
				/>
			{/if}
		{/if}
		{#if !item.optimisticState && showBotReply && item.botReply}
			{#if collapsibleReplies && !repliesExpanded}
				<button
					type="button"
					class="thread-reply-toggle-btn"
					onclick={() => (repliesExpanded = true)}
				>
					<Icon name="chevron" size={14} />
					<span>{m.showReplies({ count: 1 })}</span>
				</button>
			{:else}
				{#if showItem}<div class="thread-reply">
						<ChatBubble
							post={item.botReply}
							{botActor}
							{ondeleted}
							{onposted}
							canPin={canPinPost(item.botReply)}
							pinned={item.botReply.uri === pinnedPostUri}
							{pinBusy}
							{ontogglepin}
						/>
					</div>
				{:else}<ChatBubble
						post={item.botReply}
						{botActor}
						{ondeleted}
						{onposted}
						canPin={canPinPost(item.botReply)}
						pinned={item.botReply.uri === pinnedPostUri}
						{pinBusy}
						{ontogglepin}
					/>
				{/if}
				{#if collapsibleReplies && repliesExpanded}
					<button
						type="button"
						class="thread-reply-toggle-btn expanded"
						onclick={() => (repliesExpanded = false)}
					>
						<Icon name="chevron" size={14} />
						<span>{m.hideReplies()}</span>
					</button>
				{/if}
			{/if}
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
	.thread-reply-toggle-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		margin-top: 6px;
		margin-inline-start: 12px;
		padding: 5px 12px;
		border: 1px solid var(--panel-border);
		border-radius: 9999px;
		background: var(--surface-2, rgba(0, 0, 0, 0.03));
		color: var(--accent-strong);
		font-size: 12px;
		font-weight: 700;
		cursor: pointer;
		transition: background-color 0.15s ease, border-color 0.15s ease;
	}

	.thread-reply-toggle-btn:hover {
		background: var(--surface-3, rgba(0, 0, 0, 0.06));
		border-color: var(--accent);
	}

	.thread-reply-toggle-btn :global(.icon) {
		transition: transform 0.2s ease;
		transform: rotate(90deg);
	}

	.thread-reply-toggle-btn.expanded :global(.icon) {
		transform: rotate(-90deg);
	}
</style>
