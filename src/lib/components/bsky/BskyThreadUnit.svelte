<script lang="ts">
	import type { ModerationOpts } from '@atproto/api';
	import { onMount, untrack } from 'svelte';
	import {
		conversationPosts,
		expandBskyConversation,
		type BskyConversation,
	} from '$lib/bsky/conversation';
	import type { BskyThreadSnapshot } from '$lib/bsky/thread';
	import { EntryMotion } from '$lib/feed/entry-motion.svelte';
	import Spinner from '../Spinner.svelte';
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
		loadThread,
		revision = 0,
	}: {
		thread: BskyConversation;
		moderation: ModerationOpts;
		entering?: boolean;
		isPostEntering?: (uri: string) => boolean;
		loadThread?: (uri: string) => Promise<BskyThreadSnapshot>;
		revision?: number;
	} = $props();

	let row = $state<HTMLElement>();
	let visible = $state(false);
	let detail = $state<{ uri: string; snapshot: BskyThreadSnapshot }>();
	let loading = $state(false);
	let failed = $state(false);
	let attempt = $state(0);
	const arrivals = new EntryMotion();
	const shown = $derived(
		detail?.uri === thread.rootUri ? expandBskyConversation(thread, detail.snapshot) : thread,
	);

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				visible = entries.some((entry) => entry.isIntersecting);
			},
			{ rootMargin: '200px 0px' },
		);
		if (row) observer.observe(row);
		return () => observer.disconnect();
	});
	$effect(() => {
		const uri = thread.rootUri;
		void revision;
		void attempt;
		const fetcher = loadThread;
		if (!visible || !fetcher) return;
		if (thread.root.raw.replyCount === 0 && !thread.replies.length && !thread.incomplete) {
			detail = undefined;
			loading = false;
			failed = false;
			return;
		}
		let cancelled = false;
		loading = true;
		failed = false;
		void untrack(() => fetcher(uri))
			.then(
				(snapshot) => {
					if (cancelled) return;
					const previousUris = new Set(
						conversationPosts(untrack(() => shown)).map((post) => post.uri),
					);
					const next = expandBskyConversation(
						untrack(() => thread),
						snapshot,
					);
					detail = { uri, snapshot };
					arrivals.mark(
						[],
						conversationPosts(next)
							.map((post) => post.uri)
							.filter((postUri) => !previousUris.has(postUri)),
					);
				},
				(error: unknown) => {
					if (cancelled) return;
					console.warn('[BskyThreadUnit] thread failed', error);
					failed = true;
				},
			)
			.finally(() => {
				if (!cancelled) loading = false;
			});
		return () => {
			cancelled = true;
		};
	});
</script>

{#snippet bubble(post: BskyPostCardView, root = false)}
	<BskyPostCard
		item={{ key: post.uri, post, repostedBy: root ? thread.item.repostedBy : undefined }}
		{moderation}
		standalone={false}
	/>
{/snippet}

<article
	class="thread-unit"
	class:feed-entering={entering}
	data-bsky-thread={thread.key}
	bind:this={row}
>
	{@render bubble(shown.root, true)}
	{#if shown.hiddenCount > 0 || shown.incomplete}
		<a
			class="thread-gap"
			href={bskyPostUrl(thread.rootUri) ?? thread.root.url}
			target="_blank"
			rel="noopener noreferrer"
			aria-label={m.threadViewAll()}
		>
			{shown.hiddenCount > 0 ? m.threadMore({ count: shown.hiddenCount }) : m.threadViewAll()}
		</a>
	{/if}
	{#each shown.replies as reply (reply.post.uri)}
		<div
			class="thread-reply"
			class:message-entering={!entering &&
				(isPostEntering(reply.post.uri) || arrivals.uris.has(reply.post.uri))}
			style="--reply-indent: {replyIndent(reply.depth)}"
		>
			{@render bubble(reply.post)}
		</div>
	{/each}
	{#if loading && shown.replies.length === 0}
		<Spinner inline size="sm" label={m.feedWaiting()} />
	{:else if failed}
		<div class="state error" role="status">
			{m.bskyThreadLoadFailed()}
			<button type="button" class="icon-action" onclick={() => attempt++}>{m.retry()}</button>
		</div>
	{/if}
</article>
