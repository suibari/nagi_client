<script lang="ts">
	import type { FeedItem } from '$lib/api/types';
	import ChatBubble from './ChatBubble.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	let {
		item,
		ondeleted,
		onposted,
	}: { item: FeedItem; ondeleted?: (uri: string) => void; onposted?: () => void | Promise<void> } =
		$props();
	const STALE_MS = 3 * 60 * 1000;
	let stale = $derived(
		item.botReplyState === 'pending' && Date.now() - new Date(item.createdAt).valueOf() > STALE_MS,
	);
</script>

<article class="thread-unit">
	{#if item.replyParent}
		<ChatBubble post={item.replyParent} {ondeleted} {onposted} />
		<div class="thread-reply"><ChatBubble post={item} compact {ondeleted} {onposted} /></div>
	{:else}
		<ChatBubble post={item} {ondeleted} {onposted} />
	{/if}
	{#if item.botReply}
		<div class="thread-reply">
			<ChatBubble post={item.botReply} compact {ondeleted} {onposted} />
		</div>
	{:else if item.botReplyState === 'pending' && !stale}
		<div class="thread-reply">
			<div class="bot-pending">
				<img class="avatar small" src="/nagi_icon.png" alt="" />
				<div class="pending-bubble" role="status" aria-live="polite">
					<span class="typing"><i></i><i></i><i></i></span>{m.botThinking()}
				</div>
			</div>
		</div>
	{:else if item.botReplyState === 'pending'}
		<p class="bot-missed">{m.botMissed()}</p>
	{:else if item.botReplyState === 'failed'}
		<p class="bot-missed">{m.botSkipped()}</p>
	{/if}
</article>
