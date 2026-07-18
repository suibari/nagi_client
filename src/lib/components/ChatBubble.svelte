<script lang="ts">
	import type { PostView } from '$lib/api/types';
	import ReactionBar from './ReactionBar.svelte';
	import { session } from '$lib/oauth/session.svelte';
	let { post }: { post: PostView } = $props();
	let expanded = $state(false);
	let mine = $derived($session?.did === post.author.did);
</script>

<article class:mine class:bot={post.isBot}>
	<a class="avatar" href={`/profile/${post.author.did}`}
		>{post.author.displayName?.slice(0, 1) ?? '○'}</a
	>
	<div class="bubble">
		<div class="meta">
			<a href={`/profile/${post.author.did}`}>{post.author.displayName ?? post.author.handle}</a
			>{#if post.isBot}<span class="badge">Botたん</span>{/if}<time
				>{new Date(post.createdAt).toLocaleString('ja-JP', {
					month: 'short',
					day: 'numeric',
					hour: '2-digit',
					minute: '2-digit',
				})}</time
			>
		</div>
		<p class:collapsed={!expanded}>{post.deleted ? 'この投稿は削除されました' : post.text}</p>
		{#if post.text.length > 220}<button class="read" onclick={() => (expanded = !expanded)}
				>{expanded ? '閉じる' : '続きを読む'}</button
			>{/if}{#if post.images?.length}<div class="images">
				{#each post.images as image}<img src={image.url ?? ''} alt={image.alt} />{/each}
			</div>{/if}<ReactionBar reactions={post.reactions} />
	</div>
</article>
