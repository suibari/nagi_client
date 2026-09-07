<script lang="ts">
	import { onDestroy, tick } from 'svelte';
	import type { ActorView, FeedItem } from '$lib/api/types';
	import ReactionStamp from '$lib/components/ReactionStamp.svelte';
	import ThreadUnit from '$lib/components/ThreadUnit.svelte';
	import NewPostsButton from '$lib/components/NewPostsButton.svelte';
	import { scrollToElement } from '$lib/feed/post-follow.svelte';

	const actor: ActorView = {
		did: 'did:plc:interaction-preview',
		handle: 'preview.nagi.example',
		displayName: 'プレビューさん',
	};
	const now = () => new Date().toISOString();
	const post = (id: number, text: string): FeedItem => ({
		uri: `at://${actor.did}/com.suibari.nagi.post/${id}`,
		cid: `preview-${id}`,
		author: actor,
		text,
		createdAt: now(),
		indexedAt: now(),
		reactions: [],
		isBot: false,
		isAffirmation: false,
	});

	let stamp = $state<{ id: number; emoji: string; left: number; top: number }>();
	let stampId = 0;
	let feedSequence = 1;
	let feedItems = $state<FeedItem[]>([
		post(feedSequence, 'ここには実データを使わない投稿が並びます。'),
	]);
	let enteringFeedUri = $state<string>();
	let previewNewPostsAvailable = $state(false);
	let postingItem = $state<FeedItem>();
	const parent = post(10_000, 'この投稿への返信が、下から上へ滑りながら現れます。');
	let replyItem = $state<FeedItem>();
	let replyPreview = $state<HTMLElement>();
	let previewTimers: ReturnType<typeof setTimeout>[] = [];
	onDestroy(() => {
		previewTimers.forEach(clearTimeout);
	});
	const later = (callback: () => void, delay: number) => {
		previewTimers.push(setTimeout(callback, delay));
	};

	function previewReaction(event: MouseEvent) {
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		stamp = {
			id: ++stampId,
			emoji: ['🌊', '✨', '🙌'][stampId % 3],
			left: rect.left + rect.width / 2,
			top: rect.top + rect.height / 2,
		};
	}

	function previewPosting() {
		const id = ++feedSequence;
		postingItem = {
			...post(id, '送信中から投稿完了へ切り替わるモック投稿です。'),
			uri: `optimistic://${id}`,
			optimisticState: 'sending',
			optimisticKey: `preview-${id}`,
		};
		later(() => {
			if (postingItem?.optimisticKey !== `preview-${id}`) return;
			postingItem = {
				...postingItem,
				uri: `at://${actor.did}/com.suibari.nagi.post/${id}`,
				cid: `preview-created-${id}`,
				optimisticState: 'indexing',
			};
		}, 1_000);
		later(() => {
			if (postingItem?.optimisticKey === `preview-${id}`)
				postingItem = { ...postingItem, optimisticState: undefined };
		}, 2_200);
	}

	function previewFeed() {
		const next = post(++feedSequence, `更新で追加されたモック投稿 ${feedSequence}`);
		enteringFeedUri = next.uri;
		feedItems = [next, ...feedItems];
		previewNewPostsAvailable = window.scrollY > 24;
		setTimeout(() => {
			if (enteringFeedUri === next.uri) enteringFeedUri = undefined;
		}, 700);
	}

	function previewScrollToNewest() {
		previewNewPostsAvailable = false;
		window.scrollTo({
			top: 0,
			behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
		});
	}

	async function previewReply() {
		const id = ++feedSequence;
		const next = post(id, 'いま追加したモック返信です。画面もこの位置へ追従します。');
		replyItem = {
			...next,
			uri: `optimistic://${id}`,
			optimisticState: 'sending',
			optimisticKey: `preview-reply-${id}`,
			reply: {
				root: { uri: parent.uri, cid: parent.cid },
				parent: { uri: parent.uri, cid: parent.cid },
			},
			replyParent: parent,
		};
		await tick();
		scrollToElement(replyPreview);
		later(() => {
			if (replyItem?.optimisticKey !== `preview-reply-${id}`) return;
			replyItem = {
				...replyItem,
				uri: next.uri,
				cid: `preview-reply-created-${id}`,
				optimisticState: 'indexing',
			};
		}, 1_000);
		later(() => {
			if (replyItem?.optimisticKey === `preview-reply-${id}`)
				replyItem = { ...replyItem, optimisticState: undefined };
		}, 2_200);
	}
</script>

<section class="interaction-preview">
	<header class="preview-head">
		<p class="eyebrow">Development preview</p>
		<h1>インタラクション演出</h1>
		<p>すべてブラウザ内のモック表示です。API・PDS・AppViewへは送信しません。</p>
	</header>

	<nav class="preview-controls" aria-label="演出を再生">
		<button type="button" onclick={previewReaction}>🌊 リアクション</button>
		<button type="button" onclick={previewPosting}>💬 投稿バブル 送信中 → 完了</button>
		<button type="button" onclick={previewFeed}>↓ 新着フィード</button>
		<button type="button" onclick={() => void previewReply()}>↑ 返信＋画面追従</button>
	</nav>

	<section class="preview-panel">
		<h2>投稿バブル</h2>
		<p>アバター横の吹き出し本体が開き、約1秒後に投稿完了表示へ切り替わります。</p>
		<div class="timeline mock-output" inert>
			{#if postingItem}
				{#key postingItem.uri}
					<ThreadUnit item={postingItem} />
				{/key}
			{:else}
				<p>上の「投稿バブル 送信中 → 完了」を押してください。</p>
			{/if}
		</div>
	</section>

	<section id="preview-feed" class="preview-panel">
		<h2>フィード更新</h2>
		<p>ボタンを押すたび、先頭のモック投稿だけが上から滑り込みます。</p>
		<div class="timeline mock-output" inert>
			{#each feedItems as item (item.uri)}
				<ThreadUnit {item} entering={enteringFeedUri === item.uri} />
			{/each}
		</div>
	</section>

	<div class="reply-distance" aria-hidden="true">返信時の画面追従を確認するための余白</div>

	<section class="preview-panel reply-preview" bind:this={replyPreview}>
		<h2>返信</h2>
		{#if replyItem}
			<div class="mock-output" inert>
				<ThreadUnit item={replyItem} />
			</div>
		{:else}
			<p>上の「返信＋画面追従」を押すと、ここへスクロールして返信が現れます。</p>
		{/if}
	</section>
</section>

<NewPostsButton visible={previewNewPostsAvailable} onclick={previewScrollToNewest} />

{#if stamp}
	{#key stamp.id}
		<ReactionStamp emoji={stamp.emoji} left={stamp.left} top={stamp.top} />
	{/key}
{/if}

<style>
	.interaction-preview {
		display: grid;
		gap: 16px;
		padding-block: 20px 80px;
	}
	.preview-head,
	.preview-panel {
		display: grid;
		gap: 8px;
	}
	.preview-head h1,
	.preview-head p,
	.preview-panel h2,
	.preview-panel p {
		margin: 0;
	}
	.preview-head > p:last-child,
	.preview-panel > p {
		color: var(--text-muted);
	}
	.preview-controls {
		position: sticky;
		top: 8px;
		z-index: 20;
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		padding: 10px;
		border: 1px solid var(--line);
		border-radius: var(--r-md);
		background: color-mix(in srgb, var(--surface-1) 92%, transparent);
		box-shadow: var(--shadow-soft);
		backdrop-filter: blur(10px);
	}
	.preview-controls button {
		padding: 9px 12px;
		border: 1px solid var(--line-strong);
		border-radius: var(--r-sm);
		background: var(--surface-2);
		color: var(--text);
		font-weight: 700;
		cursor: pointer;
	}
	.preview-panel {
		padding: 16px;
		border: 1px solid var(--line);
		border-radius: var(--r-md);
		background: var(--surface-1);
	}
	.reply-distance {
		display: grid;
		place-items: center;
		min-height: 55vh;
		color: var(--text-faint);
		font-size: 12px;
	}
	.reply-preview {
		scroll-margin-top: 84px;
	}
	.mock-output {
		user-select: none;
	}
	@media (max-width: 767px) {
		.preview-controls {
			top: calc(var(--mobile-header-h) + 6px);
		}
		.preview-controls button {
			flex: 1 1 145px;
		}
	}
</style>
