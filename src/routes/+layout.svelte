<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';
	import { initOAuth } from '$lib/oauth/session.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();
	onMount(() => {
		void initOAuth();
	});
</script>

<svelte:head
	><link rel="icon" href={favicon} /><title>Nagi — やさしい言葉が凪ぐ場所</title><meta
		name="description"
		content="すべての声を受け止める、AT Protocol上のSNS"
	/></svelte:head
>
<Header />
<main>{@render children()}</main>
