<script lang="ts">
	import RichText from '$lib/components/RichText.svelte';
	import { extractTitle } from '$lib/atproto/markdown';

	let { data } = $props();
	let post = $derived(data.post);
	let title = $derived(extractTitle(post.text) ?? post.text.slice(0, 80));
	let body = $derived(post.text.replace(/^# [^\n]+\n*/, '').trimStart());
	let rkey = $derived(post.uri.split('/').pop());
</script>

<article class="blog-article">
	<header>
		<p class="blog-label">ブログ</p>
		<h1>{title}</h1>
		<p class="blog-byline">
			<a href={`/profile/${post.author.did}`}>{post.author.displayName ?? post.author.handle}</a>
			<time datetime={post.createdAt}>{post.createdAt.slice(0, 10)}</time>
		</p>
	</header>
	<div class="blog-body"><RichText text={body} /></div>
	<a class="blog-discussion" href={`/thread/${post.author.did}/${rkey}`}>Nagiで投稿を見る</a>
</article>

<style>
	.blog-article {
		max-width: 760px;
		margin: 0 auto;
		padding: 36px 20px 80px;
	}
	.blog-label {
		color: var(--accent-strong);
		font-weight: 700;
	}
	h1 {
		font-size: clamp(1.7rem, 4vw, 2.5rem);
		line-height: 1.3;
	}
	.blog-byline {
		display: flex;
		gap: 16px;
		align-items: center;
		color: var(--text-muted);
	}
	.blog-body {
		margin: 32px 0;
		line-height: 1.85;
	}
	.blog-discussion {
		display: inline-block;
		margin-top: 24px;
	}
</style>
