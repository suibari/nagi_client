<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { getThread } from '$lib/api/appview';
	let thread = $state<any>();
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
	{#if error}<div class="state error">{error}</div>{:else if !thread}<div class="state">
			読み込み中…
		</div>{:else}<div class="notice">{thread.post.text || 'この投稿は削除されました'}</div>
		{#each thread.replies ?? [] as reply}<div class="notice">{reply.text}</div>{/each}{/if}
</section>
