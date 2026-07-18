<script lang="ts">
	import type { PostView } from '$lib/api/types';
	let { post }: { post: PostView } = $props();
</script>

{#if post.isBot}<aside class="notice">
		<strong>{post.author.displayName ?? post.author.handle}</strong>
		<p>{post.text}</p>
	</aside>{/if}
