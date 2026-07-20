<script lang="ts">
	import type { ActorView, FeedItem } from '$lib/api/types';
	import ChatBubble from './ChatBubble.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import Avatar from './Avatar.svelte';
	import { onMount } from 'svelte';
	let {
		item,
		botActor,
		ondeleted,
		onposted,
	}: {
		item: FeedItem;
		botActor?: ActorView;
		ondeleted?: (uri: string) => void;
		onposted?: () => void | Promise<void>;
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
</script>

<article class="thread-unit" class:optimistic={Boolean(item.optimisticState)}>
	{#if item.replyParent}
		<ChatBubble post={item.replyParent} {ondeleted} {onposted} />
		<div class="thread-reply"><ChatBubble post={item} compact {ondeleted} {onposted} /></div>
	{:else}
		<ChatBubble post={item} {ondeleted} {onposted} />
	{/if}
	{#if !item.optimisticState && item.botReply}
		<div class="thread-reply">
			<ChatBubble post={item.botReply} compact {ondeleted} {onposted} />
		</div>
	{:else if !item.optimisticState && waiting && !stale}
		<div class="thread-reply">
			<div class="bot-pending">
				<Avatar actor={botActor} size="small" />
				<div class="pending-bubble" role="status" aria-live="polite">
					<div><span class="typing"><i></i><i></i><i></i></span>{pendingStatus}</div>
					{#if longWait}<small>{m.botLongWait()}</small>{/if}
				</div>
			</div>
		</div>
	{:else if !item.optimisticState && waiting}
		<p class="bot-missed">{m.botMissed()}</p>
	{:else if !item.optimisticState && item.botReplyState === 'failed'}
		<p class="bot-missed" role="status">{m.botFailed()}</p>
	{/if}
</article>
