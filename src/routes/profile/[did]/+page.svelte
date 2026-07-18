<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { getProfile } from '$lib/api/appview';
	import ChatBubble from '$lib/components/ChatBubble.svelte';
	let data = $state<any>();
	let error = $state('');
	onMount(() =>
		getProfile(page.params.did ?? '')
			.then((v) => (data = v))
			.catch((e) => (error = e.message)),
	);
</script>

<section class="page-title">
	<p class="eyebrow">公開プロフィール</p>
	<h1>{data?.profile?.displayName ?? page.params.did}</h1>
	<p>{data?.profile?.description ?? ''}</p>
</section>
<section class="timeline">
	{#if error}<div class="state error">
			{error}
		</div>{/if}{#each data?.items ?? [] as post (post.uri)}<ChatBubble {post} />{/each}
</section>
