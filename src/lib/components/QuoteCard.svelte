<script lang="ts">
	import type { PostView } from '$lib/api/types';
	import TranslateToggle from './TranslateToggle.svelte';
	import ImageGallery from './ImageGallery.svelte';
	import LinkCard from './LinkCard.svelte';
	import QuoteFrame from './QuoteFrame.svelte';
	let { post }: { post: PostView } = $props();
	let threadHref = $derived.by(() => {
		const [did, , rkey] = post.uri.slice('at://'.length).split('/');
		return `/thread/${did}/${rkey}`;
	});
</script>

<QuoteFrame
	name={post.author.displayName ?? post.author.handle}
	profileHref={`/profile/${post.author.did}`}
	datetime={post.createdAt}
	timeHref={threadHref}
>
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
</QuoteFrame>
