<script lang="ts">
	import './layout.css';
	import SidebarLeft from '$lib/components/shell/SidebarLeft.svelte';
	import SidebarRight from '$lib/components/shell/SidebarRight.svelte';
	import MobileHeader from '$lib/components/shell/MobileHeader.svelte';
	import MobileNav from '$lib/components/shell/MobileNav.svelte';
	import { initOAuth, session, oauthReady } from '$lib/oauth/session.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import { getOwnNagiProfile } from '$lib/atproto/records';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	let { children } = $props();
	let checkedDid: string | undefined;
	onMount(() => {
		void initOAuth();
	});
	$effect(() => {
		const did = $session?.did;
		if (!$oauthReady || !did || checkedDid === did) return;
		checkedDid = did;
		void getOwnNagiProfile()
			.then((profile) => {
				if (!profile && page.url.pathname !== '/settings/profile')
					void goto('/settings/profile?onboarding=1');
			})
			.catch((error) => {
				checkedDid = undefined;
				console.error('Failed to check Nagi profile:', error);
			});
	});
</script>

<svelte:head>
	<title>{m.appTitle()}</title>
	<meta name="description" content={m.appDescription()} />

	<link rel="icon" type="image/png" href="/nagi_icon.png" />
	<link rel="apple-touch-icon" href="/nagi_icon.png" />

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Nagi" />
	<meta property="og:title" content="Nagi — やさしい言葉が凪ぐ場所" />
	<meta property="og:description" content="すべての声を受け止める、AT Protocol上のSNS" />
	<meta property="og:url" content="https://nagi.suibari.com" />
	<meta property="og:image" content="https://nagi.suibari.com/nagi_ogp.png" />
	<meta property="og:image:width" content="2848" />
	<meta property="og:image:height" content="1504" />
	<meta property="og:image:alt" content="Nagi — やさしい言葉が凪ぐ場所" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Nagi — やさしい言葉が凪ぐ場所" />
	<meta name="twitter:description" content="すべての声を受け止める、AT Protocol上のSNS" />
	<meta name="twitter:image" content="https://nagi.suibari.com/nagi_ogp.png" />
	<meta name="twitter:image:alt" content="Nagi — やさしい言葉が凪ぐ場所" />
</svelte:head>
<MobileHeader />
<div class="shell">
	<SidebarLeft />
	<main>{@render children()}</main>
	<SidebarRight />
</div>
<MobileNav />
