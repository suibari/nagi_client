<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Button from '$lib/components/Button.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { onMount, untrack } from 'svelte';
	import { optimisticPosts } from '$lib/feed/optimistic-posts.svelte';
	import { startVisiblePolling } from '$lib/polling';
	import { postedSignal } from '$lib/feed/posted-signal.svelte';
	import { afterNavigate } from '$app/navigation';
	import BlogCard from '$lib/components/BlogCard.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';
	import { fetchBlogDirectory, type BlogDirectoryItem } from '$lib/blog/directory';
	import { fetchCachedBlogTranslations } from '$lib/blog/directoryTranslations';
	import { languagePreferences } from '$lib/i18n/languagePreferences.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import { composerHost } from '$lib/post/composer-host.svelte';

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

	// カードの自動翻訳。キャッシュ済みの訳だけを引く（理由は fetchCachedBlogTranslations）。
	// 記事の言語は一覧に載らないので、原文と同じ言語の訳はそもそもキャッシュに無いことに任せる。
	let translationTarget = $derived(languagePreferences.translationLanguage);
	// 再読込で同じ並びが返ってきたときに引き直さないよう、URI の並びを文字列で持つ。
	let translatableUris = $derived(
		languagePreferences.autoTranslate
			? items
					.filter((item) => !item.optimisticState)
					.map((item) => item.uri)
					.join('\n')
			: '',
	);
	let translations = $state<{ target: string; texts: Map<string, string> }>();
	$effect(() => {
		const uris = translatableUris ? translatableUris.split('\n') : [];
		const target = translationTarget;
		if (!uris.length) return;
		const controller = new AbortController();
		fetchCachedBlogTranslations(uris, target, controller.signal)
			.then((texts) => {
				if (!controller.signal.aborted) translations = { target, texts };
			})
			.catch(() => undefined);
		return () => controller.abort();
	});
	const translationOf = (item: BlogDirectoryItem) =>
		languagePreferences.autoTranslate && translations?.target === translationTarget
			? translations.texts.get(item.uri)
			: undefined;

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

	function openBlogComposer() {
		if (!$session) {
			location.href = '/login';
			return;
		}
		composerHost.showBlog();
	}
</script>

<PageHeader title={m.blogTitle()} description={m.blogIntro()}>
	{#snippet actions()}
		<Button variant="primary" type="button" onclick={openBlogComposer}>{m.blogWrite()}</Button>
	{/snippet}
</PageHeader>

<section class="blog-directory">
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
				<BlogCard {item} translatedText={translationOf(item)} translatedLang={translationTarget} />
			{/each}
		</div>
	{/if}
</section>
