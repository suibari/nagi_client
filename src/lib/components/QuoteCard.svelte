<script lang="ts">
	import type { PostView } from '$lib/api/types';
	import TranslateToggle from './TranslateToggle.svelte';
	import ImageGallery from './ImageGallery.svelte';
	import LinkCard from './LinkCard.svelte';
	let { post }: { post: PostView } = $props();
</script>

<aside class="notice">
	<strong>{post.author.displayName ?? post.author.handle}</strong>
	<TranslateToggle
		uri={post.uri}
		text={post.text}
		facets={post.facets}
		langs={post.langs}
		deleted={post.deleted}
	/>
	{#if post.images?.length}<ImageGallery images={post.images} />{/if}
	{#if post.linkCards?.length}<div class="link-cards">
			{#each post.linkCards as card}<LinkCard {card} />{/each}
		</div>{/if}
</aside>
