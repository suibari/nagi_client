<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { getThread } from '$lib/api/appview';
	import type { ThreadView } from '$lib/api/types';
	import ChatBubble from '$lib/components/ChatBubble.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import { goto } from '$app/navigation';
	import { optimisticPosts } from '$lib/feed/optimistic-posts.svelte';
	let thread = $state<ThreadView>();
	let error = $state('');
	const uri = `at://${page.params.did}/com.suibari.nagi.post/${page.params.rkey}`;
	async function refreshThread() {
		const next = (await getThread(uri)).thread;
		optimisticPosts.reconcile([next.post, ...next.replies]);
		thread = next;
	}
	let replies = $derived([
		...optimisticPosts.items.filter((item) => item.reply?.parent === uri),
		...(thread?.replies ?? []).filter(
			(reply) => !optimisticPosts.items.some((item) => item.uri === reply.uri),
		),
	]);
	function postDeleted(deletedUri: string) {
		if (deletedUri === uri) {
			void goto('/');
			return;
		}
		if (thread)
			thread = { ...thread, replies: thread.replies.filter((reply) => reply.uri !== deletedUri) };
	}
	onMount(() => {
		void refreshThread().catch((e) => (error = e.message));
		const timer = setInterval(() => {
			if (
				document.visibilityState === 'visible' &&
				optimisticPosts.items.some((item) => item.reply?.parent === uri)
			)
				void refreshThread().catch(() => undefined);
		}, 3_000);
		return () => clearInterval(timer);
	});
</script>

<section class="page-title">
	<p class="eyebrow">{m.threadEyebrow()}</p>
	<h1>{m.threadTitle()}</h1>
</section>
<section class="timeline">
	{#if error}<div class="state error">{error}</div>
	{:else if !thread}<div class="state">{m.loading()}</div>
	{:else}
		<article class="thread-unit">
			<ChatBubble post={thread.post} ondeleted={postDeleted} onposted={refreshThread} />
			{#each replies as reply (reply.uri)}
				<div class="thread-reply">
					<ChatBubble post={reply} compact ondeleted={postDeleted} onposted={refreshThread} />
				</div>
			{/each}
		</article>
	{/if}
</section>
