<script lang="ts">
	import type { BlogDirectoryItem } from '$lib/blog/directory';
	import { blogPath } from '$lib/blog/indexable';
	import { dateLocale, m } from '$lib/i18n/i18n.svelte';

	let { item }: { item: BlogDirectoryItem } = $props();
	let published = $derived(
		new Intl.DateTimeFormat(dateLocale(), { dateStyle: 'medium' }).format(new Date(item.createdAt)),
	);
</script>

<article class="blog-card">
	<a class="blog-card-main" href={blogPath(item.uri)}>
		<h2>{item.title}</h2>
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
</article>
