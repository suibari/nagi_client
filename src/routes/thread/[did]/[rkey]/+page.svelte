<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { getThread } from '$lib/api/appview';
	import type { ThreadView } from '$lib/api/types';
	import ChatBubble from '$lib/components/ChatBubble.svelte';
	let thread = $state<ThreadView>();
	let error = $state('');
	const uri = `at://${page.params.did}/com.suibari.nagi.post/${page.params.rkey}`;
	onMount(() =>
		getThread(uri)
			.then((v) => (thread = v.thread))
			.catch((e) => (error = e.message)),
	);
</script>

<section class="page-title">
	<p class="eyebrow">会話</p>
	<h1>スレッド</h1>
</section>
<section class="timeline">
	{#if error}<div class="state error">{error}</div>
	{:else if !thread}<div class="state">読み込み中…</div>
	{:else}
		<article class="thread-unit">
			<ChatBubble post={thread.post} />
			{#each thread.replies as reply (reply.uri)}
				<div class="thread-reply"><ChatBubble post={reply} compact /></div>
			{/each}
		</article>
	{/if}
</section>
