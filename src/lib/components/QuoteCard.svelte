<script lang="ts">
	import type { PostView } from '$lib/api/types';
	import { m } from '$lib/i18n/i18n.svelte';
	import TranslateToggle from './TranslateToggle.svelte';
	import ImageGallery from './ImageGallery.svelte';
	import LinkCard from './LinkCard.svelte';
	import QuoteFrame from './QuoteFrame.svelte';
	import PostModerationGuard from './PostModerationGuard.svelte';
	import PostUnavailableNotice from './PostUnavailableNotice.svelte';
	import { postPageHref } from '$lib/feed/post-follow.svelte';
	let { post }: { post: PostView } = $props();
	let expanded = $state(false);
	let overflowing = $state(false);
	let threadHref = $derived(postPageHref(post));
</script>

<PostModerationGuard {post}>
	<QuoteFrame
		name={post.author.displayName ?? post.author.handle}
		profileHref={`/profile/${post.author.did}`}
		datetime={post.createdAt}
		timeHref={threadHref}
	>
		{#if post.deleted}
			<PostUnavailableNotice reason={post.unavailableReason} authorDid={post.author.did} />
		{:else}
			{#snippet collapseToggle()}
				{#if overflowing || expanded}<button
						class="read"
						type="button"
						aria-expanded={expanded}
						onclick={() => (expanded = !expanded)}>{expanded ? m.readLess() : m.readMore()}</button
					>{/if}
			{/snippet}
			<TranslateToggle
				uri={post.uri}
				cid={post.cid}
				text={post.text}
				facets={post.facets}
				langs={post.langs}
				collapsed={!expanded}
				onoverflowchange={(value) => (overflowing = value)}
				{collapseToggle}
			/>
		{/if}
		{#if post.images?.length}<ImageGallery images={post.images} />{/if}
		{#if post.linkCards?.length}<div class="link-cards">
				{#each post.linkCards as card}<LinkCard {card} />{/each}
			</div>{/if}
	</QuoteFrame>
</PostModerationGuard>
