<script lang="ts">
	import { onMount } from 'svelte';
	import { getTrend } from '$lib/api/appview';
	import ChatBubble from '$lib/components/ChatBubble.svelte';
	import type { PostView } from '$lib/api/types';
	let posts = $state<PostView[]>([]);
	let error = $state('');
	onMount(() => {
		getTrend()
			.then((p) => (posts = p.items))
			.catch((e) => (error = e.message));
	});
</script>

<section class="page-title">
	<p class="eyebrow">今日のきらめき</p>
	<h1>トレンド</h1>
</section>
<section class="timeline">
	{#if error}<div class="state error">{error}</div>{/if}{#each posts as post (post.uri)}<ChatBubble
			{post}
		/>{/each}
</section>
