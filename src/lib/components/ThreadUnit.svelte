<script lang="ts">
	import type { ActorView, FeedItem, PostView } from '$lib/api/types';
	import ChatBubble from './ChatBubble.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import Avatar from './Avatar.svelte';
	import ThreadFlags from './ThreadFlags.svelte';
	import { onMount } from 'svelte';
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
	} = $props();
	const STALE_MS = 3 * 60 * 1000;
	const LONG_WAIT_MS = 10 * 1000;
	let waiting = $derived(item.botReplyState === 'pending' || item.botReplyState === 'processing');
	let now = $state(Date.now());
	onMount(() => {
		const timer = window.setInterval(() => (now = Date.now()), 1000);
		return () => window.clearInterval(timer);
	});
	let stale = $derived(waiting && now - new Date(item.createdAt).valueOf() > STALE_MS);
	let longWait = $derived(waiting && now - new Date(item.createdAt).valueOf() >= LONG_WAIT_MS);
	let pendingStatus = $derived(
		item.botReplyState === 'processing' ? m.botThinking() : m.botWaiting(),
	);
	let channel = $derived(item.channel ?? item.replyParent?.channel ?? item.botReply?.channel);
	let threadKossori = $derived(
		Boolean(
			item.threadKossori ??
			item.replyParent?.threadKossori ??
			item.botReply?.threadKossori ??
			item.kossori ??
			item.channelOnly,
		),
	);
	let showParent = $derived(Boolean(item.replyParent && item.replyParent.uri !== hiddenPostUri));
	let showItem = $derived(item.uri !== hiddenPostUri);
	let showBotReply = $derived(Boolean(item.botReply && item.botReply.uri !== hiddenPostUri));
	let hasVisiblePost = $derived(showParent || showItem || showBotReply);
	const canPinPost = (post: PostView) =>
		canPin && (!pinChannelUri || post.channel?.uri === pinChannelUri);
</script>

{#if hasVisiblePost}
	<article
		class="thread-unit"
		class:optimistic={Boolean(item.optimisticState)}
		data-post-uri={item.uri}
		data-optimistic-key={item.optimisticKey}
	>
		<ThreadFlags {channel} kossori={threadKossori} />
		{#if showParent && item.replyParent}
			<ChatBubble
				post={item.replyParent}
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
			{#if showItem}<div class="thread-reply">
					<ChatBubble
						post={item.botReply}
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
					{ondeleted}
					{onposted}
					canPin={canPinPost(item.botReply)}
					pinned={item.botReply.uri === pinnedPostUri}
					{pinBusy}
					{ontogglepin}
				/>
			{/if}
		{:else if !item.optimisticState && showItem && waiting && !stale}
			<div class="thread-reply">
				<div class="bot-pending">
					<Avatar actor={botActor} />
					<div class="pending-bubble" role="status" aria-live="polite">
						<div><span class="typing"><i></i><i></i><i></i></span>{pendingStatus}</div>
						{#if longWait}<small>{m.botLongWait()}</small>{/if}
					</div>
				</div>
			</div>
		{:else if !item.optimisticState && showItem && waiting}
			<p class="bot-missed">{m.botMissed()}</p>
		{:else if !item.optimisticState && showItem && item.botReplyState === 'failed'}
			<p class="bot-missed" role="status">{m.botFailed()}</p>
		{/if}
	</article>
{/if}
