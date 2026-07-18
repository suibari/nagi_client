<script lang="ts">
	import { onMount } from 'svelte';
	import { getTimeline } from '$lib/api/appview';
	import type { PostView } from '$lib/api/types';
	import ChatBubble from '$lib/components/ChatBubble.svelte';
	import Composer from '$lib/components/Composer.svelte';
	import { session, oauthReady } from '$lib/oauth/session.svelte';
	let posts = $state<PostView[]>([]);
	let cursor = $state<string>();
	let hasMore = $state(false);
	let loading = $state(true);
	let error = $state('');
	let lastDid = $state<string>();
	async function load(append = false) {
		try {
			if (!append) loading = true;
			const page = await getTimeline(append ? cursor : undefined);
			const unseen = page.items.filter(
				(post) => !posts.some((existing) => existing.uri === post.uri),
			);
			posts = append ? [...posts, ...unseen] : page.items;
			cursor = page.cursor;
			hasMore = page.hasMore;
			error = '';
		} catch (cause) {
			error = cause instanceof Error ? cause.message : 'タイムラインを読み込めませんでした';
		} finally {
			loading = false;
		}
	}
	onMount(() => {
		load();
		const timer = setInterval(load, 30000);
		return () => clearInterval(timer);
	});
	$effect(() => {
		if ($oauthReady) {
			const did = $session?.did;
			if (did !== lastDid) {
				lastDid = did;
				load();
			}
		}
	});
</script>

<section class="hero">
	<p class="eyebrow">AT Protocolでつながる、やさしい場所</p>
	<h1>言葉が、静かに届く。</h1>
	<p>ここでは、どんな声もまず受け止めます。</p>
</section>
{#if $session}<Composer onposted={() => load()} />{:else}<aside class="welcome">
		<div>
			<strong>Nagiへようこそ</strong><span
				>タイムラインは誰でも読めます。参加すると投稿やリアクションができます。</span
			>
		</div>
		<a href="/login">参加する</a>
	</aside>{/if}
<section class="timeline" aria-busy={loading}>
	{#if loading && !posts.length}<div class="state">波が届くのを待っています…</div>
	{:else if error && !posts.length}<div class="state error">
			{error}<button onclick={() => load()}>もう一度</button>
		</div>
	{:else if !posts.length}<div class="state">まだ静かな海です。最初の言葉を待っています。</div>
	{:else}{#each posts as post (post.uri)}<ChatBubble {post} />{/each}{#if hasMore}<button
				class="more"
				onclick={() => load(true)}>さらに読む</button
			>{/if}{/if}
</section>
