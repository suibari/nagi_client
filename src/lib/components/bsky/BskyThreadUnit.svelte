<script lang="ts">
	import type { ModerationOpts } from '@atproto/api';
	import { onMount, untrack } from 'svelte';
	import {
		conversationPosts,
		expandBskyConversation,
		type BskyConversation,
	} from '$lib/bsky/conversation';
	import type { BskyThreadSnapshot } from '$lib/bsky/thread';
	import { sentBskyReplies } from '$lib/bsky/sent-replies.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import type { OAuthSession } from '@atproto/oauth-client-browser';
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
		interactive = true,
	}: {
		thread: BskyConversation;
		moderation: ModerationOpts;
		entering?: boolean;
		isPostEntering?: (uri: string) => boolean;
		loadThread?: (uri: string) => Promise<BskyThreadSnapshot>;
		revision?: number;
		/** 設定画面のプレビュー等では Bluesky への操作を出さない。 */
		interactive?: boolean;
	} = $props();

	let row = $state<HTMLElement>();
	let visible = $state(false);
	let detail = $state.raw<{
		uri: string;
		owner: OAuthSession | null;
		snapshot: BskyThreadSnapshot;
	}>();
	let loading = $state(false);
	let failed = $state(false);
	let attempt = $state(0);
	const arrivals = new EntryMotion();
	const sent = $derived(interactive ? sentBskyReplies.get(thread.rootUri) : undefined);
	const sentRevision = $derived(sent?.revision ?? 0);
	const shown = $derived(
		expandBskyConversation(
			thread,
			detail?.uri === thread.rootUri && detail.owner === $session ? detail.snapshot : undefined,
			sent?.replies.map(({ post }) => post),
		),
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
		const owner = $session;
		void revision;
		void attempt;
		const fetcher = loadThread;
		if (!visible || !fetcher) return;
		if (
			!sentRevision &&
			thread.root.raw.replyCount === 0 &&
			!thread.replies.length &&
			!thread.incomplete
		) {
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
					if (cancelled || $session !== owner) return;
					const previousUris = new Set(
						conversationPosts(untrack(() => shown)).map((post) => post.uri),
					);
					const next = expandBskyConversation(
						untrack(() => thread),
						snapshot,
					);
					detail = { uri, owner, snapshot };
					if (interactive) sentBskyReplies.reconcile(uri, snapshot);
					arrivals.mark(
						[],
						conversationPosts(next)
							.map((post) => post.uri)
							.filter((postUri) => !previousUris.has(postUri)),
					);
				},
				(error: unknown) => {
					if (cancelled || $session !== owner) return;
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
		{interactive}
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
