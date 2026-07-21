<script lang="ts">
	import './layout.css';
	import SidebarLeft from '$lib/components/shell/SidebarLeft.svelte';
	import SidebarRight from '$lib/components/shell/SidebarRight.svelte';
	import MobileHeader from '$lib/components/shell/MobileHeader.svelte';
	import MobileNav from '$lib/components/shell/MobileNav.svelte';
	import { initOAuth, session, oauthReady } from '$lib/oauth/session.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import { getOwnNagiProfile } from '$lib/atproto/records';
	import { resolveCrosspostPending } from '$lib/crosspost/preferences';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { startUnreadPolling } from '$lib/notifications/unread.svelte';

	let { children } = $props();
	let checkedDid: string | undefined;
	onMount(() => {
		// 再サインイン（クロスポスト権限の追加同意）から戻ってきた場合の確定処理。
		void initOAuth().then(() => resolveCrosspostPending());
		// 未読通知バッジのポーリング開始（session の変化には内部で追従する）。
		startUnreadPolling();
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
	<!-- OGP・favicon などクローラ向けの静的メタは app.html にある（SPA なので
	     ここに書くと JS 実行後にしか現れない）。ここは i18n で変わるものだけ。 -->
</svelte:head>
<MobileHeader />
<div class="shell">
	<SidebarLeft />
	<main>{@render children()}</main>
	<SidebarRight />
</div>
<MobileNav />
