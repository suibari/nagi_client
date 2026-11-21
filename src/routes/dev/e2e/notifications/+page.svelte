<script lang="ts">
	import { onMount } from 'svelte';
	import { session, type OAuthSession } from '$lib/oauth/session.svelte';
	import NotificationsPage from '../../../notifications/+page.svelte';
	import {
		BLUESKY_INTERACTION_SCOPES,
		BLUESKY_VIEW_SCOPES,
		CROSSPOST_SCOPE,
	} from '$lib/oauth/client';

	/**
	 * 通知一覧の確認用。仮のセッションで通知画面をそのまま描く。
	 * com.suibari.nagi.getNotifications はネットワーク越しに取るので、e2e で差し替える。
	 */
	let ready = $state(false);
	onMount(() => {
		// ?bluesky のときは Bluesky 連携（閲覧と操作）の権限を持つ。
		const scope = new URLSearchParams(location.search).has('bluesky')
			? ['atproto', CROSSPOST_SCOPE, ...BLUESKY_VIEW_SCOPES, ...BLUESKY_INTERACTION_SCOPES].join(
					' ',
				)
			: '';
		session.set({
			did: 'did:plc:notifications-viewer',
			fetchHandler: (url: string | URL, init?: RequestInit) => fetch(url, init),
			getTokenInfo: async () => ({ scope }),
		} as unknown as OAuthSession);
		ready = true;
		return () => session.set(null);
	});
</script>

{#if ready}<NotificationsPage />{/if}
