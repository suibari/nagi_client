<script lang="ts">
	import type { BlogDirectoryItem } from '$lib/blog/directory';
	import { blogPath } from '$lib/blog/indexable';
	import { APPVIEW_URL } from '$lib/api/appview';
	import { dateLocale, m } from '$lib/i18n/i18n.svelte';

	let { item }: { item: BlogDirectoryItem } = $props();
	let published = $derived(
		new Intl.DateTimeFormat(dateLocale(), { dateStyle: 'medium' }).format(new Date(item.createdAt)),
	);
	const resolve = (url: string) => (url.startsWith('/') ? APPVIEW_URL + url : url);
</script>

<article class="blog-card" data-post-uri={item.uri} data-optimistic-key={item.optimisticKey}>
	{#if item.headerImage}
		<a
			class="blog-card-cover"
			href={item.optimisticState === 'sending' ? undefined : blogPath(item.uri)}
			tabindex="-1"
			aria-hidden="true"
		>
			<img src={resolve(item.headerImage)} alt="" loading="lazy" />
		</a>
	{/if}
	<div class="blog-card-content">
		<a
			class="blog-card-main"
			href={item.optimisticState === 'sending' ? undefined : blogPath(item.uri)}
		>
			<h2>{item.title}</h2>
			{#if item.optimisticState}<span class="post-sending" role="status"
					>{item.optimisticState === 'sending' ? m.postSending() : m.postCreated()}</span
				>{/if}
			<p>{item.description}</p>
			<span class="blog-card-byline">
				{item.author.displayName ?? item.author.handle}
				<span aria-hidden="true">·</span>
				<time datetime={item.createdAt}>{published}</time>
			</span>
		</a>
		{#if item.tags.length}
			<ul class="blog-card-tags" aria-label={m.blogTags()}>
				{#each item.tags as tag (tag)}
					<li><a href={`/blog?tag=${encodeURIComponent(tag)}`}>#{tag}</a></li>
				{/each}
			</ul>
		{/if}
	</div>
</article>
