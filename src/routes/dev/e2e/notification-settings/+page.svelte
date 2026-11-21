<script lang="ts">
	import { onMount } from 'svelte';
	import { session, type OAuthSession } from '$lib/oauth/session.svelte';
	import {
		BLUESKY_INTERACTION_SCOPES,
		BLUESKY_VIEW_SCOPES,
		CROSSPOST_SCOPE,
	} from '$lib/oauth/client';
	import NotificationSettingsPage from '../../../settings/notifications/+page.svelte';

	/**
	 * 通知設定の確認用。仮のセッションで設定画面をそのまま描く。?bluesky のときは Bluesky 連携の権限を持つ。
	 * AppView への呼び出しはネットワーク越しなので e2e で差し替える。
	 */
	let ready = $state(false);
	onMount(() => {
		const scope = new URLSearchParams(location.search).has('bluesky')
			? ['atproto', CROSSPOST_SCOPE, ...BLUESKY_VIEW_SCOPES, ...BLUESKY_INTERACTION_SCOPES].join(
					' ',
				)
			: 'atproto';
		session.set({
			did: 'did:plc:notification-settings-viewer',
			fetchHandler: (url: string | URL, init?: RequestInit) => fetch(url, init),
			getTokenInfo: async () => ({ scope }),
		} as unknown as OAuthSession);
		ready = true;
		return () => session.set(null);
	});
</script>

{#if ready}<NotificationSettingsPage />{/if}
