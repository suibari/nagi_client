<script lang="ts">
	import type { PostView } from '$lib/api/types';
	import TranslateToggle from './TranslateToggle.svelte';
	import ImageGallery from './ImageGallery.svelte';
	import LinkCard from './LinkCard.svelte';
	import { dateLocale } from '$lib/i18n/i18n.svelte';
	let { post }: { post: PostView } = $props();
	let threadHref = $derived.by(() => {
		const [did, , rkey] = post.uri.slice('at://'.length).split('/');
		return `/thread/${did}/${rkey}`;
	});
</script>

<aside class="quote-card">
	<header class="quote-meta">
		<a href={`/profile/${post.author.did}`}
			><strong>{post.author.displayName ?? post.author.handle}</strong></a
		>
		<span aria-hidden="true">·</span>
		<time datetime={post.createdAt}
			><a href={threadHref}
				>{new Date(post.createdAt).toLocaleString(dateLocale(), {
					month: 'short',
					day: 'numeric',
					hour: '2-digit',
					minute: '2-digit',
				})}</a
			></time
		>
	</header>
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

<style>
	.quote-card {
		margin-top: 0.6rem;
		min-inline-size: 0;
		max-inline-size: 100%;
		padding: 0.25rem 0 0.25rem 0.75rem;
		border-left: 3px solid var(--line-strong);
		color: var(--text);
		font-size: 0.875rem;
		text-align: left;
	}

	.quote-meta {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.25rem;
		margin-bottom: 0.35rem;
		color: var(--text-muted);
		font-size: 0.75rem;
		min-inline-size: 0;
	}

	.quote-meta > a {
		min-inline-size: 0;
		max-inline-size: 100%;
	}

	.quote-meta strong {
		color: var(--text-strong);
		overflow-wrap: anywhere;
	}

	.quote-meta a:hover {
		color: var(--accent-strong);
	}
</style>
