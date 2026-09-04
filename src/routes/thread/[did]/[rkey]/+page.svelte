<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { getThread } from '$lib/api/appview';
	import type { ThreadView } from '$lib/api/types';
	import ChatBubble from '$lib/components/ChatBubble.svelte';
	import BotReplyStatus from '$lib/components/BotReplyStatus.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import { goto } from '$app/navigation';
	import { optimisticPosts } from '$lib/feed/optimistic-posts.svelte';
	import { followPostedScroll } from '$lib/feed/post-follow.svelte';
	import ThreadFlags from '$lib/components/ThreadFlags.svelte';
	import { postTranslations } from '$lib/i18n/postTranslations.svelte';
	import { replyDepths, replyIndent } from '$lib/thread/replyIndent';
	let thread = $state<ThreadView>();
	let error = $state('');
	const uri = `at://${page.params.did}/com.suibari.nagi.post/${page.params.rkey}`;
	let threadRootUri = $derived(thread?.post.uri ?? uri);
	async function refreshThread() {
		const next = (await getThread(uri)).thread;
		void postTranslations.prepare([next.post, ...next.replies]);
		optimisticPosts.reconcile([next.post, ...next.replies]);
		thread = next;
	}
	// 楽観返信は時系列の末尾に置く。先頭に積むと、サーバーが取り込んだ瞬間に本来の位置
	// （下）へ飛んでしまい、書いたばかりの返信を見失う。
	let replies = $derived([
		...(thread?.replies ?? []).filter(
			(reply) => !optimisticPosts.items.some((item) => item.uri === reply.uri),
		),
		...optimisticPosts.items.filter((item) => item.reply?.root.uri === threadRootUri),
	]);
	let replyDepthByUri = $derived(
		replyDepths(threadRootUri, [...(thread ? [thread.post] : []), ...replies]),
	);
	let awaitingBotReply = $derived(
		Boolean(
			thread &&
			[thread.post, ...thread.replies].some(
				(post) => post.botReplyState === 'pending' || post.botReplyState === 'processing',
			),
		),
	);
	// 投稿直後の画面追従。楽観返信 → 確定した返信で DOM が入れ替わるので、
	// 返信リストが変わるたびに追従先を引き直す。
	followPostedScroll(() => replies);
	function postDeleted(deletedUri: string) {
		if (deletedUri === uri || deletedUri === thread?.post.uri) {
			void goto('/');
			return;
		}
		if (thread)
			thread = { ...thread, replies: thread.replies.filter((reply) => reply.uri !== deletedUri) };
	}
	onMount(() => {
		void refreshThread().catch((e) => (error = e.message));
		const timer = setInterval(() => {
			// 投稿直後は AppView に投稿が見えてから bot ジョブが作られるまで短い差があり得る。
			// ジョブがまだ無い最初の応答でも、直近3分のスレッドは高速更新を続ける。
			const recentlyCreated = Boolean(
				thread &&
				[thread.post, ...thread.replies].some(
					(post) => !post.isBot && Date.now() - new Date(post.createdAt).valueOf() < 180_000,
				),
			);
			if (
				document.visibilityState === 'visible' &&
				(optimisticPosts.items.some(
					(item) => item.uri === threadRootUri || item.reply?.root.uri === threadRootUri,
				) ||
					recentlyCreated ||
					awaitingBotReply)
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
			<ThreadFlags
				channel={thread.post.channel}
				kossori={Boolean(thread.post.threadKossori ?? thread.post.kossori)}
			/>
			<div data-post-uri={thread.post.uri}>
				<ChatBubble post={thread.post} ondeleted={postDeleted} onposted={refreshThread} />
			</div>
			<BotReplyStatus
				state={thread.post.botReplyState}
				createdAt={thread.post.createdAt}
				botActor={thread.botActor}
				optimistic={Boolean(thread.post.optimisticState)}
				indent="0"
			/>
			{#each replies as reply (reply.uri)}
				{@const depth = replyDepthByUri.get(reply.uri) ?? 1}
				<div
					class="thread-reply"
					style="--reply-indent: {replyIndent(depth)}"
					data-post-uri={reply.uri}
					data-optimistic-key={reply.optimisticKey}
				>
					<ChatBubble post={reply} ondeleted={postDeleted} onposted={refreshThread} />
				</div>
				<BotReplyStatus
					state={reply.botReplyState}
					createdAt={reply.createdAt}
					botActor={thread.botActor}
					optimistic={Boolean(reply.optimisticState)}
					indent={String(replyIndent(depth + 1))}
				/>
			{/each}
		</article>
	{/if}
</section>
