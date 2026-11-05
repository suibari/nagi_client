<script lang="ts">
	import { onMount } from 'svelte';
	import { session, type OAuthSession } from '$lib/oauth/session.svelte';
	import NotificationsPage from '../../../notifications/+page.svelte';

	/**
	 * 通知一覧の確認用。仮のセッションで通知画面をそのまま描く。
	 * com.suibari.nagi.getNotifications はネットワーク越しに取るので、e2e で差し替える。
	 */
	let ready = $state(false);
	onMount(() => {
		session.set({
			did: 'did:plc:notifications-viewer',
			fetchHandler: (url: string | URL, init?: RequestInit) => fetch(url, init),
			getTokenInfo: async () => ({ scope: '' }),
		} as unknown as OAuthSession);
		ready = true;
		return () => session.set(null);
	});
</script>

{#if ready}<NotificationsPage />{/if}
