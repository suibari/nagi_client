<script lang="ts">
	import type { PostView } from '$lib/api/types';
	import ReactionBar from './ReactionBar.svelte';
	import Avatar from './Avatar.svelte';
	import { APPVIEW_URL } from '$lib/api/appview';
	import { session } from '$lib/oauth/session.svelte';
	let { post, compact = false }: { post: PostView; compact?: boolean } = $props();
	let expanded = $state(false);
	let mine = $derived($session?.did === post.author.did);
	let threadHref = $derived(`/thread/${post.author.did}/${post.uri.split('/').pop()}`);
	const resolve = (url?: string) => (url?.startsWith('/') ? APPVIEW_URL + url : (url ?? ''));
</script>

<div class="post-row" class:mine class:bot={post.isBot}>
	<a href={`/profile/${post.author.did}`} aria-label="プロフィールを見る"
		><Avatar actor={post.author} size={compact ? 'small' : undefined} /></a
	>
	<div class="bubble">
		<div class="meta">
			<a href={`/profile/${post.author.did}`}>{post.author.displayName ?? post.author.handle}</a
			>{#if post.isBot}<span class="badge">Botたん</span>{/if}<time
				><a href={threadHref}
					>{new Date(post.createdAt).toLocaleString('ja-JP', {
						month: 'short',
						day: 'numeric',
						hour: '2-digit',
						minute: '2-digit',
					})}</a
				></time
			>
		</div>
		<p class:collapsed={!expanded}>{post.deleted ? 'この投稿は削除されました' : post.text}</p>
		{#if post.text.length > 220}<button class="read" onclick={() => (expanded = !expanded)}
				>{expanded ? '閉じる' : '続きを読む'}</button
			>{/if}{#if post.images?.length}<div class="images">
				{#each post.images as image}<img src={resolve(image.url)} alt={image.alt} />{/each}
			</div>{/if}<ReactionBar uri={post.uri} cid={post.cid} reactions={post.reactions} />
	</div>
</div>
