<script lang="ts">
	import Spinner from '$lib/components/Spinner.svelte';
	import { onMount, untrack } from 'svelte';
	import { optimisticPosts } from '$lib/feed/optimistic-posts.svelte';
	import { startVisiblePolling } from '$lib/polling';
	import { postedSignal } from '$lib/feed/posted-signal.svelte';
	import { afterNavigate } from '$app/navigation';
	import BlogCard from '$lib/components/BlogCard.svelte';
	import GuestHero from '$lib/components/GuestHero.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';
	import { fetchBlogDirectory, type BlogDirectoryItem } from '$lib/blog/directory';
	import { m } from '$lib/i18n/i18n.svelte';
	import { hadRecentSession, session } from '$lib/oauth/session.svelte';
	import { composerHost } from '$lib/post/composer-host.svelte';
	import { setComposerMode } from '$lib/post/composer-mode';

	let { data } = $props();
	// svelte-ignore state_referenced_locally -- prerender seed; onMount enriches it with document tags
	let items = $state<BlogDirectoryItem[]>(data.seed);
	let loading = $state(false);
	let error = $state('');
	let selectedTag = $state('');
	afterNavigate(({ to }) => {
		selectedTag = (to?.url.searchParams.get('tag') ?? '').trim().replace(/^[#＃]+/, '');
	});
	let mergedItems = $derived([
		...optimisticPosts.blogs.filter((pending) => !items.some((item) => item.uri === pending.uri)),
		...items,
	]);
	$effect(() => {
		if (postedSignal.count) untrack(() => void load(true));
	});
	let tags = $derived(
		[...new Set(mergedItems.flatMap((item) => item.tags))].sort((a, b) => a.localeCompare(b)),
	);
	let visibleItems = $derived(
		selectedTag
			? mergedItems.filter((item) =>
					item.tags.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase()),
				)
			: mergedItems,
	);

	async function load(refresh = false) {
		loading = !mergedItems.length;
		error = '';
		try {
			items = await fetchBlogDirectory({ refresh });
			const indexed = new Set(items.map((item) => item.uri));
			optimisticPosts.blogs = optimisticPosts.blogs.filter((item) => !indexed.has(item.uri));
		} catch (cause) {
			error = cause instanceof Error ? cause.message : m.loadFailed();
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		void load();
		return startVisiblePolling(() => void load(true), 10_000, {
			when: () => optimisticPosts.blogs.some((item) => item.optimisticState === 'indexing'),
		});
	});

	// ホームのヒーローと同じ判定。プリレンダ結果（初回訪問者・クローラ）には出し、
	// 戻ってきた利用者には OAuth の復元を待たずに最初から出さない。
	const showHero = $derived(!$session && !hadRecentSession());

	function openBlogComposer() {
		if (!$session) {
			location.href = '/login';
			return;
		}
		composerHost.clearAllTargets();
		setComposerMode('blog');
		composerHost.show();
	}
</script>

<section class="page-title blog-title">
	<h1>{m.blogTitle()}</h1>
	<button type="button" class="primary" onclick={openBlogComposer}>{m.blogWrite()}</button>
</section>

{#if showHero}
	<GuestHero compact />
{/if}

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

	{#if loading && !visibleItems.length}
		<Spinner label={m.feedWaiting()} />
	{:else if error && !visibleItems.length}
		<div class="state error">
			{error}<button
				class="icon-action"
				aria-label={m.retry()}
				title={m.retry()}
				onclick={() => void load(true)}><Icon name="refresh" size={18} /></button
			>
		</div>
	{:else if !visibleItems.length}
		<div class="state">{selectedTag ? m.blogTagEmpty({ tag: selectedTag }) : m.blogEmpty()}</div>
	{:else}
		<div class="blog-list">
			{#each visibleItems as item (item.optimisticKey ?? item.uri)}
				<BlogCard {item} />
			{/each}
		</div>
	{/if}
</section>

<style>
	.blog-title {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}
</style>
