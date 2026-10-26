<script lang="ts">
	import type { ModerationOpts } from '@atproto/api';
	import type { BskyConversation } from '$lib/bsky/conversation';
	import type { BskyPostCardView } from '$lib/bsky/mapView';
	import { bskyPostUrl } from '$lib/bsky/links';
	import { replyIndent } from '$lib/thread/replyIndent';
	import { m } from '$lib/i18n/i18n.svelte';
	import BskyPostCard from './BskyPostCard.svelte';
	let {
		thread,
		moderation,
		entering = false,
		isPostEntering = () => false,
	}: {
		thread: BskyConversation;
		moderation: ModerationOpts;
		entering?: boolean;
		isPostEntering?: (uri: string) => boolean;
	} = $props();
</script>

{#snippet bubble(post: BskyPostCardView, root = false)}
	<BskyPostCard
		item={{ key: post.uri, post, repostedBy: root ? thread.item.repostedBy : undefined }}
		{moderation}
		standalone={false}
	/>
{/snippet}

<article class="thread-unit" class:feed-entering={entering} data-bsky-thread={thread.key}>
	{@render bubble(thread.root, true)}
	{#if thread.hiddenCount > 0 || thread.incomplete}
		<a
			class="thread-gap"
			href={bskyPostUrl(thread.rootUri) ?? thread.root.url}
			target="_blank"
			rel="noopener noreferrer"
			aria-label={m.threadViewAll()}
		>
			{thread.hiddenCount > 0 ? m.threadMore({ count: thread.hiddenCount }) : m.threadViewAll()}
		</a>
	{/if}
	{#each thread.replies as reply (reply.post.uri)}
		<div
			class="thread-reply"
			class:message-entering={!entering && isPostEntering(reply.post.uri)}
			style="--reply-indent: {replyIndent(reply.depth)}"
		>
			{@render bubble(reply.post)}
		</div>
	{/each}
</article>
