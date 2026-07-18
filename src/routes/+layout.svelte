<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import SidebarLeft from '$lib/components/shell/SidebarLeft.svelte';
	import SidebarRight from '$lib/components/shell/SidebarRight.svelte';
	import MobileHeader from '$lib/components/shell/MobileHeader.svelte';
	import MobileNav from '$lib/components/shell/MobileNav.svelte';
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
<MobileHeader />
<div class="shell">
	<SidebarLeft />
	<main>{@render children()}</main>
	<SidebarRight />
</div>
<MobileNav />
