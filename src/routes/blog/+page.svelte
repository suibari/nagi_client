<script lang="ts">
	import Spinner from '$lib/components/Spinner.svelte';
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import BlogCard from '$lib/components/BlogCard.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';
	import { fetchBlogDirectory, type BlogDirectoryItem } from '$lib/blog/directory';
	import { m } from '$lib/i18n/i18n.svelte';

	let { data } = $props();
	// svelte-ignore state_referenced_locally -- prerender seed; onMount enriches it with document tags
	let items = $state<BlogDirectoryItem[]>(data.seed);
	let loading = $state(false);
	let error = $state('');
	let selectedTag = $state('');
	afterNavigate(({ to }) => {
		selectedTag = (to?.url.searchParams.get('tag') ?? '').trim().replace(/^[#＃]+/, '');
	});
	let tags = $derived(
		[...new Set(items.flatMap((item) => item.tags))].sort((a, b) => a.localeCompare(b)),
	);
	let visibleItems = $derived(
		selectedTag
			? items.filter((item) =>
					item.tags.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase()),
				)
			: items,
	);

	async function load() {
		loading = true;
		error = '';
		try {
			items = await fetchBlogDirectory();
		} catch (cause) {
			error = cause instanceof Error ? cause.message : m.loadFailed();
		} finally {
			loading = false;
		}
	}

	onMount(() => void load());
</script>

<section class="page-title"><h1>{m.blogTitle()}</h1></section>

<section class="blog-directory">
	<p class="blog-intro">{m.blogIntro()}</p>
	{#if tags.length}
		<nav class="blog-tags" aria-label={m.blogTags()}>
			<a href="/blog" class:active={!selectedTag}>{m.blogAll()}</a>
			{#each tags as tag (tag)}
				<a
					href={`/blog?tag=${encodeURIComponent(tag)}`}
					class:active={tag.toLowerCase() === selectedTag.toLowerCase()}>#{tag}</a
				>
			{/each}
		</nav>
	{/if}

	{#if loading}
		<Spinner label={m.feedWaiting()} />
	{:else if error}
		<div class="state error">
			{error}<button class="icon-action" aria-label={m.retry()} title={m.retry()} onclick={load}
				><Icon name="refresh" size={18} /></button
			>
		</div>
	{:else if !visibleItems.length}
		<div class="state">{selectedTag ? m.blogTagEmpty({ tag: selectedTag }) : m.blogEmpty()}</div>
	{:else}
		<div class="blog-list">
			{#each visibleItems as item (item.uri)}
				<BlogCard {item} />
			{/each}
		</div>
	{/if}
</section>
