<script lang="ts">
	import type { PostView } from '$lib/api/types';
	import TranslateToggle from './TranslateToggle.svelte';
	let { post }: { post: PostView } = $props();
</script>

<aside class="notice">
	<strong>{post.author.displayName ?? post.author.handle}</strong>
	<TranslateToggle uri={post.uri} text={post.text} langs={post.langs} deleted={post.deleted} />
</aside>
